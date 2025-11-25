import express from 'express';
import { query } from '../db/connection.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all initiatives (public - customer view)
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, ai_summary as description, custom_tags, timeline, column_name, sort_order
       FROM initiatives
       WHERE is_visible = true
       ORDER BY column_name, sort_order, created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ error: 'Failed to fetch initiatives' });
  }
});

// Get all initiatives including hidden ones (admin only)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT *
       FROM initiatives
       ORDER BY column_name, sort_order, created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ error: 'Failed to fetch initiatives' });
  }
});

// Get single initiative by ID (admin only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM initiatives WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    res.status(500).json({ error: 'Failed to fetch initiative' });
  }
});

// Update initiative (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      ai_summary,
      custom_tags,
      timeline,
      column_name,
      sort_order,
      is_visible
    } = req.body;

    const result = await query(
      `UPDATE initiatives
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           ai_summary = COALESCE($3, ai_summary),
           custom_tags = COALESCE($4, custom_tags),
           timeline = COALESCE($5, timeline),
           column_name = COALESCE($6, column_name),
           sort_order = COALESCE($7, sort_order),
           is_visible = COALESCE($8, is_visible),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, description, ai_summary, custom_tags, timeline, column_name, sort_order, is_visible, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating initiative:', error);
    res.status(500).json({ error: 'Failed to update initiative' });
  }
});

// Delete initiative (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM initiatives WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Initiative not found' });
    }

    res.json({ message: 'Initiative deleted successfully' });
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ error: 'Failed to delete initiative' });
  }
});

export default router;
