const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const db = require('../config/db');
const { extractKeywords, buildBooleanQuery } = require('../utils/stopwords');

const MODEL = 'gemini-2.5-flash';

/** Returns a Gemini client using the current env var (lazy — avoids startup warning). */
function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }
  return new GoogleGenAI({ apiKey: key.trim() });
}

// Minimum relevance score for a DB result to be considered useful
const RELEVANCE_THRESHOLD = 0.5;
// Max history turns sent to Gemini (each turn = 1 user + 1 assistant msg)
const MAX_HISTORY_TURNS = 5;

/**
 * Formats the last N conversation turns into a readable string for the prompt.
 * @param {Array<{role:string, text:string}>} history
 */
function formatHistory(history) {
  if (!history || history.length === 0) return '';
  const recent = history.slice(-(MAX_HISTORY_TURNS * 2));
  return recent
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

/**
 * POST /api/chat
 * Body: { message: string, history?: Array<{role, text}> }
 */
router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // ── 1. Validate input ─────────────────────────────────────
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    const userMessage = message.trim().slice(0, 500);

    // ── 2. Init Gemini client ─────────────────────────────────
    let ai;
    try {
      ai = getAI();
    } catch (keyErr) {
      console.error('Gemini key error:', keyErr.message);
      return res.status(500).json({ success: false, message: keyErr.message });
    }

    // ── 3. Extract keywords & build FULLTEXT query ────────────
    const keywords = extractKeywords(userMessage);
    const booleanQuery = buildBooleanQuery(keywords);

    // ── 4. DB search ──────────────────────────────────────────
    let dbResults = [];
    if (booleanQuery) {
      const sql = `
        SELECT
          id,
          title,
          department,
          published_date,
          LEFT(description, 600) AS excerpt,
          MATCH(title, description, pdf_text)
            AGAINST(? IN BOOLEAN MODE) AS relevance_score
        FROM Notification
        WHERE
          MATCH(title, description, pdf_text) AGAINST(? IN BOOLEAN MODE)
          AND MATCH(title, description, pdf_text) AGAINST(? IN BOOLEAN MODE) > ?
        ORDER BY relevance_score DESC
        LIMIT 5
      `;
      const [rows] = await db.query(sql, [
        booleanQuery,
        booleanQuery,
        booleanQuery,
        RELEVANCE_THRESHOLD,
      ]);
      dbResults = rows;
    }

    const historyText = formatHistory(history);

    // ── 4a. DB hits found → answer from notifications ─────────
    if (dbResults.length > 0) {
      const notificationsContext = dbResults
        .map(
          (n, i) =>
            `[${i + 1}] Title: "${n.title}" | Department: ${n.department} | ` +
            `Date: ${n.published_date ? new Date(n.published_date).toDateString() : 'N/A'} | ` +
            `Excerpt: ${n.excerpt || 'No description available.'}`
        )
        .join('\n\n');

      const prompt = `You are a helpful assistant for GovInfo Search, an Indian government notifications portal.
Answer the user's question using ONLY the notifications provided below. Be conversational and concise.
Cite specific notification titles and dates in your answer. If the notifications don't fully answer the question, say so honestly.

Relevant Notifications:
${notificationsContext}

${historyText ? `Conversation History:\n${historyText}\n` : ''}User: ${userMessage}
Assistant:`;

      try {
        const response = await ai.models.generateContent({
          model: MODEL,
          contents: prompt,
        });

        const reply = response.text?.trim();

        if (!reply) throw new Error('Empty response from Gemini');

        const citations = dbResults.map((n) => ({
          id: n.id,
          title: n.title,
          date: n.published_date,
        }));

        return res.json({ success: true, reply, source: 'db', citations });
      } catch (geminiErr) {
        console.error('Gemini DB-path error:', geminiErr.message);
        // Fall through to web search
      }
    }

    // ── 4b. No DB hits → web search grounding fallback ────────
    const webPrompt = `You are a helpful assistant for GovInfo Search, an Indian government notifications portal.
The user's question did not match anything in our internal notifications database.
Search the web for recent, official Indian government information about the user's question.
Start your response by clearly stating: "I couldn't find this in our database, but based on general web information:"
Be factual, concise, and cite sources where possible.

${historyText ? `Conversation History:\n${historyText}\n` : ''}User question: ${userMessage}
Assistant:`;

    try {
      const webResponse = await ai.models.generateContent({
        model: MODEL,
        contents: webPrompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const reply = webResponse.text?.trim();

      if (!reply) throw new Error('Empty web-grounding response');

      return res.json({ success: true, reply, source: 'web', citations: [] });
    } catch (webErr) {
      console.error('Gemini web-grounding error:', webErr.message);
      // Fall through to polite fallback
    }

    // ── 4c. Both paths failed → polite fallback ───────────────
    return res.json({
      success: true,
      reply:
        "I'm sorry, I couldn't find relevant information about that topic. " +
        'Try using the search bar at the top of the page, or visit the official government portal at india.gov.in for the latest updates.',
      source: 'none',
      citations: [],
    });
  } catch (err) {
    console.error('Chat route error:', err);
    return res.status(500).json({ success: false, message: 'Chat failed', error: err.message });
  }
});

module.exports = router;
