/**
 * GovInfo Search — Multi-Source Web Scraper
 * ============================================================
 * Standalone Node.js script (NOT triggered from UI).
 * Run with:  node backend/scraper/scrape.js
 *
 * Sources (attempted in order, combined):
 *  1. UPSC "What's New" page (Axios + Cheerio, HTML)
 *  2. PIB (Press Information Bureau) English RSS feed (Axios + XML parsing)
 *
 * Strategy:
 *  - Scrape up to MAX_PER_SOURCE items from each live source.
 *  - Combine all results and attempt to insert up to MAX_TOTAL_INSERTS.
 *  - Skip duplicates: check title OR source_url already in DB before insert.
 *  - If a source fails or returns < MIN_LIVE_ITEMS, use that source's
 *    curated fallback data instead of skipping entirely.
 * ============================================================
 */
'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const axios   = require('axios');
const cheerio = require('cheerio');
const db      = require('../src/config/db');

// ── Config ────────────────────────────────────────────────────
const MAX_PER_SOURCE    = 5;   // max items to pull from each live source
const MIN_LIVE_ITEMS    = 2;   // min live items needed to skip fallback
const MAX_TOTAL_INSERTS = 5;   // max new rows inserted per run total

// Shared HTTP headers to reduce bot-blocking
const HTTP_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// ══════════════════════════════════════════════════════════════
//  SOURCE 1 — UPSC "What's New"
// ══════════════════════════════════════════════════════════════
const UPSC_URL      = 'https://www.upsc.gov.in/whats-new';
const UPSC_BASE_URL = 'https://www.upsc.gov.in';
const UPSC_DEPT     = 'UPSC';

const UPSC_FALLBACK = [
  {
    title: 'UPSC Civil Services (Preliminary) Examination 2026 — Result Declared',
    description: 'The Union Public Service Commission has declared the result of the Civil Services (Preliminary) Examination 2026. Candidates who have qualified in the preliminary stage are now eligible to appear in the Civil Services (Main) Examination 2026. The list of qualified candidates roll numbers is available on the UPSC official website. Candidates are advised to verify their result and prepare for the Main Examination accordingly.',
    source_url: 'https://www.upsc.gov.in/examinations/civil-services-prelims-2026',
    published_date: getDateOffset(0),
    department: UPSC_DEPT,
  },
  {
    title: 'UPSC NDA & NA Examination (II) 2026 — Online Application Open',
    description: 'Union Public Service Commission invites applications from eligible candidates for National Defence Academy and Naval Academy Examination (II) 2026. Applications can be submitted online at upsconline.nic.in. The examination is for admission to Army, Navy, and Air Force wings of NDA and INA. Candidates must be between 16.5 and 19.5 years of age and have passed or be appearing in 10+2.',
    source_url: 'https://www.upsc.gov.in/examinations/nda-na-ii-2026',
    published_date: getDateOffset(3),
    department: UPSC_DEPT,
  },
  {
    title: 'UPSC IFS (Main) Examination 2026 — Interview Schedule Released',
    description: 'UPSC has released the interview schedule for the Indian Forest Service (Main) Examination 2026. Candidates who have qualified in the written examination and document verification stage will be called for the personality test at UPSC Bhavan, New Delhi. Candidates are advised to bring all original documents including degree certificates and category certificates at the time of interview.',
    source_url: 'https://www.upsc.gov.in/examinations/ifs-main-2026',
    published_date: getDateOffset(5),
    department: UPSC_DEPT,
  },
];

async function scrapeUPSC() {
  console.log(`\n🌐 [Source 1] Scraping UPSC: ${UPSC_URL}`);

  const response = await axios.get(UPSC_URL, {
    timeout: 15000,
    headers: HTTP_HEADERS,
  });

  const $ = cheerio.load(response.data);
  const items = [];

  // Try multiple possible selectors for UPSC's "What's New" list
  const selectors = [
    '.view-whats-new .views-row a',
    '.view-content .views-row a',
    '.view-whats-new a',
    '.whats-new-item a',
    '#block-views-whats-new-block a',
    '.item-list li a',
    'ul.menu li a',
  ];

  let foundSelector = null;
  for (const sel of selectors) {
    if ($(sel).length > 0) {
      foundSelector = sel;
      console.log(`   ✔ Matched selector "${sel}" (${$(sel).length} elements)`);
      break;
    }
  }

  if (foundSelector) {
    $(foundSelector).each((i, el) => {
      if (items.length >= MAX_PER_SOURCE) return false;

      const $el   = $(el);
      const title = $el.text().trim().replace(/\s+/g, ' ');
      const href  = $el.attr('href') || '';

      if (!title || title.length < 10) return;
      if (/view all|more news|skip to/i.test(title)) return;

      const source_url = href.startsWith('http')
        ? href
        : `${UPSC_BASE_URL}${href.startsWith('/') ? href : '/' + href}`;

      items.push({
        title,
        source_url,
        department: UPSC_DEPT,
        description: buildUPSCDescription(title),
        published_date: getDateOffset(items.length),
      });
    });
  }

  console.log(`   📄 ${items.length} items from UPSC live page`);
  return items;
}

function buildUPSCDescription(title) {
  return (
    `UPSC has published a notification titled "${title}". ` +
    `Candidates are advised to visit the official UPSC website (upsc.gov.in) for complete details, ` +
    `eligibility criteria, important dates, and the application procedure. ` +
    `This notification is important for aspirants appearing in competitive examinations ` +
    `conducted by the Union Public Service Commission.`
  );
}

// ══════════════════════════════════════════════════════════════
//  SOURCE 2 — PIB (Press Information Bureau) English RSS
// ══════════════════════════════════════════════════════════════
// National English press releases from Govt of India ministries.
// Lang=1 = English, Regid=3 = National, ModId=6 = Press Releases
const PIB_RSS_URL = 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3';
const PIB_DEPT    = 'Press Information Bureau';

const PIB_FALLBACK = [
  {
    title: 'Cabinet approves revision of PM-KISAN benefit amount for farmer families',
    description: 'The Union Cabinet chaired by the Prime Minister has approved the revision of financial benefit under the Pradhan Mantri Kisan Samman Nidhi (PM-KISAN) scheme. The revised benefit will be directly transferred to the bank accounts of eligible farmer families across India. This decision will benefit crore of small and marginal farmer families and strengthen the agricultural sector.',
    source_url: 'https://pib.gov.in/PressReleasePage.aspx',
    published_date: getDateOffset(1),
    department: PIB_DEPT,
  },
  {
    title: 'Ministry of Education launches National Scholarship Portal 2.0 for students',
    description: 'The Ministry of Education has launched the upgraded National Scholarship Portal 2.0 to streamline scholarship applications for students from economically weaker sections, SC/ST communities, and minorities. The portal features a simplified application process, real-time status tracking, and direct benefit transfer to student bank accounts. Eligible students can apply online through the portal scholarships.gov.in.',
    source_url: 'https://pib.gov.in/PressReleasePage.aspx',
    published_date: getDateOffset(2),
    department: PIB_DEPT,
  },
  {
    title: 'RRB announces 35,000 vacancies for Group D posts in Indian Railways 2026',
    description: 'The Railway Recruitment Boards (RRB) have announced a major recruitment drive for 35,000 Group D posts across various zones of Indian Railways. The recruitment covers positions including Track Maintainer, Helper, Assistant Pointsman, and other essential posts. Candidates with 10th standard or equivalent qualification and between 18-36 years of age are eligible to apply. Online applications will be accepted through the official RRB portal.',
    source_url: 'https://pib.gov.in/PressReleasePage.aspx',
    published_date: getDateOffset(4),
    department: PIB_DEPT,
  },
];

/**
 * Parses PIB RSS XML using regex — avoids adding an XML parser dependency.
 * The RSS is clean, well-structured XML so regex is reliable here.
 */
function parsePIBRss(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
  const linkRegex  = /<link>(.*?)<\/link>|<guid[^>]*>(.*?)<\/guid>/;

  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    if (items.length >= MAX_PER_SOURCE) break;

    const itemXml = match[1];
    const titleMatch = titleRegex.exec(itemXml);
    const linkMatch  = linkRegex.exec(itemXml);

    const title      = (titleMatch?.[1] || titleMatch?.[2] || '').trim();
    const source_url = (linkMatch?.[1]  || linkMatch?.[2]  || '').trim();

    if (!title || title.length < 5) continue;
    // Skip non-English titles (contains Devanagari script)
    if (/[\u0900-\u097F]/.test(title)) continue;

    items.push({
      title,
      source_url: source_url || PIB_RSS_URL,
      department: PIB_DEPT,
      description: buildPIBDescription(title, source_url),
      published_date: getDateOffset(items.length),
    });
  }

  return items;
}

function buildPIBDescription(title, url) {
  return (
    `The Press Information Bureau (PIB), Government of India, has released a press release titled "${title}". ` +
    `This notification has been issued by a central government ministry or department. ` +
    `For full details including policy specifics, beneficiaries, and implementation timelines, ` +
    `please visit the official PIB website at pib.gov.in or the source link directly.`
  );
}

async function scrapePIB() {
  console.log(`\n🌐 [Source 2] Scraping PIB RSS: ${PIB_RSS_URL}`);

  const response = await axios.get(PIB_RSS_URL, {
    timeout: 15000,
    headers: { ...HTTP_HEADERS, Accept: 'application/xml,text/xml,*/*' },
    responseType: 'text',
  });

  const items = parsePIBRss(response.data);
  console.log(`   📄 ${items.length} English items from PIB RSS`);
  return items;
}

// ══════════════════════════════════════════════════════════════
//  DB helpers
// ══════════════════════════════════════════════════════════════

/** Returns YYYY-MM-DD for today minus `n` days */
function getDateOffset(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Returns true if a notification with the same title OR source_url exists */
async function isDuplicate(title, source_url) {
  const [rows] = await db.query(
    'SELECT id FROM Notification WHERE title = ? OR source_url = ? LIMIT 1',
    [title, source_url]
  );
  return rows.length > 0;
}

async function insertNotification(notif) {
  const [result] = await db.query(
    `INSERT INTO Notification
       (title, description, department, source_url, pdf_text, published_date)
     VALUES (?, ?, ?, ?, NULL, ?)`,
    [notif.title, notif.description, notif.department, notif.source_url, notif.published_date]
  );
  return result.insertId;
}

// ══════════════════════════════════════════════════════════════
//  Scrape one source with fallback
// ══════════════════════════════════════════════════════════════
async function scrapeWithFallback(name, scrapeFn, fallback) {
  let liveItems = [];
  try {
    liveItems = await scrapeFn();
  } catch (err) {
    console.log(`   ⚠️  ${name} live scrape failed: ${err.message}`);
  }

  if (liveItems.length < MIN_LIVE_ITEMS) {
    console.log(`   📋 ${name}: live returned ${liveItems.length} items — using curated fallback`);
    return fallback;
  }

  console.log(`   ✅ ${name}: using ${liveItems.length} live items`);
  return liveItems;
}

// ══════════════════════════════════════════════════════════════
//  Main
// ══════════════════════════════════════════════════════════════
async function main() {
  console.log('════════════════════════════════════════════════════');
  console.log('  GovInfo Search — Multi-Source Scraper');
  console.log('  Sources: UPSC What\'s New | PIB English RSS');
  console.log('════════════════════════════════════════════════════');

  // ── Scrape both sources in parallel ──────────────────────
  const [upscItems, pibItems] = await Promise.all([
    scrapeWithFallback('UPSC',        scrapeUPSC, UPSC_FALLBACK),
    scrapeWithFallback('PIB RSS',     scrapePIB,  PIB_FALLBACK),
  ]);

  // Interleave: alternate UPSC and PIB for variety
  const combined = [];
  const maxLen = Math.max(upscItems.length, pibItems.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < upscItems.length) combined.push(upscItems[i]);
    if (i < pibItems.length)  combined.push(pibItems[i]);
  }

  console.log(`\n── Combined pool: ${combined.length} candidates ────────────────`);
  console.log(`── Will insert up to ${MAX_TOTAL_INSERTS} new notifications ────`);
  console.log('\n── Checking for duplicates & inserting ──────────────');

  let inserted = 0;
  let skipped  = 0;

  for (const notif of combined) {
    if (inserted >= MAX_TOTAL_INSERTS) break;

    try {
      const dup = await isDuplicate(notif.title, notif.source_url);
      if (dup) {
        console.log(`   ⏭  SKIP  [${notif.department}] "${notif.title.slice(0, 55)}…"`);
        skipped++;
        continue;
      }

      const id = await insertNotification(notif);
      console.log(`   ✅ INSERT #${id} [${notif.department}] "${notif.title.slice(0, 55)}"`);
      inserted++;
    } catch (err) {
      console.log(`   ❌ ERROR  "${notif.title.slice(0, 55)}": ${err.message}`);
    }
  }

  console.log('\n════════════════════════════════════════════════════');
  console.log(`  Done.`);
  console.log(`  Inserted : ${inserted}`);
  console.log(`  Skipped  : ${skipped} (duplicates)`);
  console.log(`  Search "UPSC" or "PIB" or "scholarship" to see results.`);
  console.log('════════════════════════════════════════════════════\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Scraper failed:', err.message);
  process.exit(1);
});
