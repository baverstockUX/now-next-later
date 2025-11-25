import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Get configuration (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM admin_config');

    const config = {};
    result.rows.forEach(row => {
      config[row.config_key] = row.config_value;
    });

    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Update configuration (admin only)
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { ai_provider, product_name, selected_releases } = req.body;

    if (ai_provider) {
      await query(
        `INSERT INTO admin_config (config_key, config_value)
         VALUES ('ai_provider', $1)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = CURRENT_TIMESTAMP`,
        [ai_provider]
      );
    }

    if (product_name) {
      await query(
        `INSERT INTO admin_config (config_key, config_value)
         VALUES ('product_name', $1)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = CURRENT_TIMESTAMP`,
        [product_name]
      );
    }

    if (selected_releases !== undefined) {
      await query(
        `INSERT INTO admin_config (config_key, config_value)
         VALUES ('selected_releases', $1)
         ON CONFLICT (config_key)
         DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(selected_releases)]
      );
    }

    res.json({ message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Get available AI models (admin only)
router.get('/ai-models', authenticateToken, async (req, res) => {
  try {
    const models = aiService.getAvailableModels();
    res.json(models);
  } catch (error) {
    console.error('Error fetching AI models:', error);
    res.status(500).json({ error: 'Failed to fetch AI models' });
  }
});

export default router;
