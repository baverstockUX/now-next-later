import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import ahaService from '../services/ahaService.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// In-memory sync progress store
let syncProgress = {
  inProgress: false,
  step: '',
  message: '',
  current: 0,
  total: 0,
  percentage: 0,
  shouldCancel: false
};

// Manual sync from AHA! (admin only)
router.post('/refresh', authenticateToken, async (req, res) => {
  // Don't allow concurrent syncs
  if (syncProgress.inProgress) {
    return res.status(409).json({
      error: 'Sync already in progress'
    });
  }

  // Start sync in background and return immediately
  res.json({ message: 'Sync started', inProgress: true });

  // Reset progress
  syncProgress = {
    inProgress: true,
    step: 'fetching_config',
    message: 'Reading configuration...',
    current: 0,
    total: 100,
    percentage: 5,
    shouldCancel: false
  };

  try {
    console.log('Starting AHA! sync...');

    // Get selected releases from config
    const releasesResult = await query(
      "SELECT config_value FROM admin_config WHERE config_key = 'selected_releases'"
    );
    const selectedReleases = releasesResult.rows[0]?.config_value
      ? JSON.parse(releasesResult.rows[0].config_value)
      : [];

    if (syncProgress.shouldCancel) throw new Error('Sync cancelled by user');

    // Update progress
    syncProgress = {
      ...syncProgress,
      step: 'fetching_features',
      message: `Fetching features from ${selectedReleases.length} releases...`,
      percentage: 10
    };

    // Fetch data from AHA! (filtered by selected releases)
    const ahaInitiatives = await ahaService.fetchInitiatives(selectedReleases);

    if (!ahaInitiatives || ahaInitiatives.length === 0) {
      syncProgress = {
        inProgress: false,
        step: 'completed',
        message: 'No initiatives found in selected releases',
        current: 0,
        total: 0,
        percentage: 100,
        shouldCancel: false
      };
      return;
    }

    if (syncProgress.shouldCancel) throw new Error('Sync cancelled by user');

    // Get AI model preference
    const configResult = await query(
      "SELECT config_value FROM admin_config WHERE config_key = 'ai_provider'"
    );
    const aiModel = configResult.rows[0]?.config_value || 'oneadvanced';

    // Update progress
    syncProgress = {
      ...syncProgress,
      step: 'ai_summaries',
      message: `Generating AI summaries for ${ahaInitiatives.length} features...`,
      percentage: 30,
      total: ahaInitiatives.length
    };

    // Generate AI summaries with progress callback
    console.log(`Generating AI summaries using ${aiModel}...`);
    const initiativesWithSummaries = await aiService.batchSummarize(
      ahaInitiatives,
      aiModel,
      (progress) => {
        if (syncProgress.shouldCancel) {
          throw new Error('Sync cancelled by user');
        }
        syncProgress = {
          ...syncProgress,
          current: progress.current,
          message: progress.message,
          percentage: 30 + Math.floor((progress.current / progress.total) * 60)
        };
      }
    );

    if (syncProgress.shouldCancel) throw new Error('Sync cancelled by user');

    // Update progress
    syncProgress = {
      ...syncProgress,
      step: 'saving',
      message: 'Saving features to database...',
      percentage: 95
    };

    // Upsert initiatives into database
    let syncedCount = 0;
    for (const initiative of initiativesWithSummaries) {
      if (syncProgress.shouldCancel) throw new Error('Sync cancelled by user');

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

    // Mark as complete
    syncProgress = {
      inProgress: false,
      step: 'completed',
      message: `Successfully synced ${syncedCount} features`,
      current: syncedCount,
      total: syncedCount,
      percentage: 100,
      shouldCancel: false
    };

  } catch (error) {
    console.error('Sync error:', error);

    // Log failed sync
    await query(
      `INSERT INTO sync_logs (sync_status, sync_message, initiatives_synced, synced_by)
       VALUES ($1, $2, $3, $4)`,
      ['failed', error.message, 0, 'admin']
    ).catch(err => console.error('Failed to log sync error:', err));

    // Mark as failed
    syncProgress = {
      inProgress: false,
      step: 'error',
      message: `Sync failed: ${error.message}`,
      current: 0,
      total: 0,
      percentage: 0,
      shouldCancel: false,
      error: error.message
    };
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

// Get available releases from AHA! (admin only)
router.get('/releases', authenticateToken, async (req, res) => {
  try {
    const releases = await ahaService.fetchAvailableReleases();

    res.json(releases);
  } catch (error) {
    console.error('Error fetching releases:', error);
    res.status(500).json({ error: 'Failed to fetch releases from AHA!' });
  }
});

// Get sync progress (admin only)
router.get('/progress', authenticateToken, async (req, res) => {
  res.json(syncProgress);
});

// Cancel ongoing sync (admin only)
router.post('/cancel', authenticateToken, async (req, res) => {
  if (syncProgress.inProgress) {
    syncProgress.shouldCancel = true;
    res.json({ message: 'Sync cancellation requested' });
  } else {
    res.status(400).json({ error: 'No sync in progress' });
  }
});

export default router;
