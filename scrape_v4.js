const { chromium } = require('playwright');

const URLS = [
  { name: 'T1',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDUyM2EwOGNhLWUwZmQtNGIzNC1hNDZmLTU5ZmI2ODgxMDNmYjpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T3',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGM0ODIxMjBmLWJkNDktNGE0My04YmViLTNiMjczMTlhNzcwMDpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T4',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU4MGVlOWNlLTIwNWMtNDc1My1hNzY3LTFmOTlkODMxNjFiZDpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T5',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU0YjA2OWQwLTU2MDEtNGM1NS1iMGY5LTIwMDM3ZmRjZDg2YTpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T6',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGYzYzA4OGJiLTdjYjUtNGFmMC05ZDY1LWE1NzJkMjVmZDNiMjpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T7',  url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGI1NDZiNzUwLTVmZjEtNGU4Ni05NGQ0LTliMmYwMDU1Y2VjZTpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T10', url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDEyMDgxN2Q5LThkMmUtNGMxYi05ZjdiLTJmNTg1ZjZlY2ZiMTpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T12', url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDFhNzRiZjQwLTQ0OTctNGI5YS1iMWExLWE1MmJiM2JhNzk5YjpQdWJsaXNoZWQ=/leaderboard' },
  { name: 'T13', url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDNiOTJmNDA5LWM0OTctNDU4OC1iOTgwLTkzZjc3OTc1OGE5NzpQdWJsaXNoZWQ=/leaderboard' },
];

// Detect: is this line a player name (not a rank/score/thru)?
function isName(s) {
  if (!s) return false;
  const t = s.trim();
  return !/^\d+$/.test(t) && !/^[+-]?\d+$/.test(t) && t !== 'E' && t !== 'F' &&
    t !== 'DNF' && !/^(PLAYER|SCORE|THRU|TOTAL|Rank|#)$/i.test(t) && t.length > 0;
}

function parsePage(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const rows = [];
  let i = 5; // skip header

  while (i + 3 < lines.length) {
    const [a, b, c, d, e] = [lines[i], lines[i+1], lines[i+2], lines[i+3], lines[i+4]];

    if (isName(a) && isName(b) && isName(c)) {
      // 3 consecutive names — treat a as player (rank missing), b as score placeholder
      rows.push({ rank: '', player: a, score: b, thru: c, total: d });
      i += 4;
      continue;
    }

    if (isName(a) && !isName(b) && !isName(c)) {
      // a=player, b=score/thru/total pattern
      rows.push({ rank: '', player: a, score: b, thru: c, total: d });
      i += 4;
      continue;
    }

    if (/^\d+$/.test(a) && isName(b) && !isName(c)) {
      // Normal: rank, player, score, thru, total
      rows.push({ rank: a, player: b, score: c, thru: d, total: e });
      i += 5;
      continue;
    }

    if (/^\d+$/.test(a) && isName(b) && isName(c)) {
      // rank, player, extra, score, thru (skip extra)
      rows.push({ rank: a, player: b, score: c, thru: d, total: e });
      i += 5;
      continue;
    }

    // Unknown — skip one line
    i++;
  }

  return rows;
}

async function scrapePage(browser, item) {
  const page = await browser.newPage();
  try {
    await page.goto(item.url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    const text = await page.evaluate(() => document.body.innerText);
    await page.close();
    return parsePage(text);
  } catch (e) {
    await page.close();
    return [];
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const allData = [];
  for (const item of URLS) {
    process.stderr.write(`[${item.name}] `);
    const rows = await scrapePage(browser, item);
    process.stderr.write(`${rows.length} rows\n`);
    allData.push({ name: item.name, rows });
  }

  await browser.close();

  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allData, null, 2));
  process.exit(0);
})();
