import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import ahaService from '../services/ahaService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Manual sync from AHA! (admin only)
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    console.log('Starting AHA! sync...');

    // Fetch data from AHA!
    const ahaInitiatives = await ahaService.fetchInitiatives();

    if (!ahaInitiatives || ahaInitiatives.length === 0) {
      return res.status(200).json({
        message: 'No initiatives found in AHA!',
        synced: 0
      });
    }

    // Get AI provider preference
    const configResult = await query(
      "SELECT config_value FROM admin_config WHERE config_key = 'ai_provider'"
    );
    const aiProvider = configResult.rows[0]?.config_value || 'oneadvanced';

    // Generate AI summaries
    console.log(`Generating AI summaries using ${aiProvider}...`);
    const initiativesWithSummaries = await aiService.batchSummarize(ahaInitiatives, aiProvider);

    // Upsert initiatives into database
    let syncedCount = 0;
    for (const initiative of initiativesWithSummaries) {
      await query(
        `INSERT INTO initiatives (aha_id, title, description, ai_summary, timeline, column_name, raw_aha_data, is_visible)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (aha_id)
         DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           ai_summary = EXCLUDED.ai_summary,
           timeline = EXCLUDED.timeline,
           column_name = EXCLUDED.column_name,
           raw_aha_data = EXCLUDED.raw_aha_data,
           updated_at = CURRENT_TIMESTAMP`,
        [
          initiative.aha_id,
          initiative.title,
          initiative.description,
          initiative.ai_summary,
          initiative.timeline,
          initiative.column_name,
          JSON.stringify(initiative.raw_aha_data)
        ]
      );
      syncedCount++;
    }

    // Log sync
    await query(
      `INSERT INTO sync_logs (sync_status, sync_message, initiatives_synced, synced_by)
       VALUES ($1, $2, $3, $4)`,
      ['success', 'Sync completed successfully', syncedCount, 'admin']
    );

    console.log(`Sync completed: ${syncedCount} initiatives synced`);

    res.json({
      message: 'Sync completed successfully',
      synced: syncedCount,
      aiProvider
    });
  } catch (error) {
    console.error('Sync error:', error);

    // Log failed sync
    await query(
      `INSERT INTO sync_logs (sync_status, sync_message, initiatives_synced, synced_by)
       VALUES ($1, $2, $3, $4)`,
      ['failed', error.message, 0, 'admin']
    ).catch(err => console.error('Failed to log sync error:', err));

    res.status(500).json({
      error: 'Sync failed',
      message: error.message
    });
  }
});

// Get sync history (admin only)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM sync_logs ORDER BY synced_at DESC LIMIT 20`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sync history:', error);
    res.status(500).json({ error: 'Failed to fetch sync history' });
  }
});

export default router;
