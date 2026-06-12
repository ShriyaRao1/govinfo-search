const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { extractKeywords, buildBooleanQuery } = require('../utils/stopwords');

/**
 * GET /api/search
 * Query params:
 *   q          - search query string
 *   department - optional department filter (exact match)
 *
 * Uses MySQL FULLTEXT MATCH() AGAINST() in BOOLEAN MODE for ranked results.
 * Falls back to a LIKE search if q is empty (returns all, filtered by department).
 */
router.get('/', async (req, res) => {
  try {
    const { q = '', department = '' } = req.query;

    const keywords = extractKeywords(q);
    const booleanQuery = buildBooleanQuery(keywords);

    let sql;
    let params;

    if (booleanQuery) {
      // ── Full-text ranked search ──────────────────────────────
      sql = `
        SELECT
          id,
          title,
          department,
          source_url,
          published_date,
          LEFT(description, 300)  AS excerpt,
          MATCH(title, description, pdf_text)
            AGAINST(? IN BOOLEAN MODE) AS relevance_score
        FROM Notification
        WHERE
          MATCH(title, description, pdf_text) AGAINST(? IN BOOLEAN MODE)
          ${department ? 'AND department = ?' : ''}
        ORDER BY relevance_score DESC
        LIMIT 50
      `;
      params = department
        ? [booleanQuery, booleanQuery, department]
        : [booleanQuery, booleanQuery];
    } else {
      // ── No meaningful query — return all (with optional dept filter) ──
      sql = `
        SELECT
          id,
          title,
          department,
          source_url,
          published_date,
          LEFT(description, 300) AS excerpt
        FROM Notification
        ${department ? 'WHERE department = ?' : ''}
        ORDER BY published_date DESC
        LIMIT 50
      `;
      params = department ? [department] : [];
    }

    const [rows] = await db.query(sql, params);

    return res.json({
      success: true,
      query: q,
      department: department || null,
      keywords,
      total: rows.length,
      results: rows,
    });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ success: false, message: 'Search failed', error: err.message });
  }
});

/**
 * GET /api/search/departments
 * Returns the distinct list of departments for the filter dropdown.
 */
router.get('/departments', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT DISTINCT department FROM Notification ORDER BY department ASC'
    );
    const departments = rows.map((r) => r.department);
    return res.json({ success: true, departments });
  } catch (err) {
    console.error('Departments fetch error:', err);
    return res.status(500).json({ success: false, message: 'Could not fetch departments' });
  }
});

module.exports = router;
