/**
 * Common English stopwords to strip before building the FULLTEXT query.
 * Keeps search terms meaningful and avoids MySQL FULLTEXT noise.
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'as', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall',
  'can', 'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'than', 'too',
  'very', 'just', 'about', 'above', 'after', 'before', 'between', 'into',
  'through', 'during', 'this', 'that', 'these', 'those', 'he', 'she',
  'they', 'we', 'you', 'i', 'me', 'him', 'her', 'us', 'them', 'what',
  'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'all', 'any',
  'also', 'up', 'out', 'if', 'then', 'because', 'while', 'only', 'own',
  'same', 'now', 'get', 'our', 'their', 'your', 'my', 'new', 'one',
]);

/**
 * Strips stopwords from a raw query string.
 * Returns an array of meaningful lowercase tokens (min 2 chars).
 *
 * @param {string} query - Raw user input
 * @returns {string[]} Array of keywords
 */
function extractKeywords(query) {
  if (!query || typeof query !== 'string') return [];

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')   // strip punctuation
    .split(/\s+/)
    .filter((word) => word.length >= 2 && !STOPWORDS.has(word));
}

/**
 * Converts extracted keywords into a MySQL BOOLEAN MODE search string.
 * Each keyword is prefixed with + so all terms must influence ranking.
 * Also appends wildcard variants for partial matching.
 *
 * @param {string[]} keywords
 * @returns {string} MySQL AGAINST() search string
 */
function buildBooleanQuery(keywords) {
  if (keywords.length === 0) return '';

  return keywords
    .map((kw) => `+${kw}* ${kw}`)   // exact prefix match + optional term for ranking
    .join(' ');
}

module.exports = { extractKeywords, buildBooleanQuery, STOPWORDS };
