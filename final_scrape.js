const { chromium } = require('playwright');

const URLS = [
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDUyM2EwOGNhLWUwZmQtNGIzNC1hNDZmLTU5ZmI2ODgxMDNmYjpQdWJsaXNoZWQ=/leaderboard', name: 'T1' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRkOTUzZjU5LWVlYWEtNDA2Mi1hZmZjLTQ3OWUxNjJlYmYzZjpQdWJsaXNoZWQ=/leaderboard', name: 'T2' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGM0ODIxMjBmLWJkNDktNGE0My04YmViLTNiMjczMTlhNzcwMDpQdWJsaXNoZWQ=/leaderboard', name: 'T3' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU4MGVlOWNlLTIwNWMtNDc1My1hNzY3LTFmOTlkODMxNjFiZDpQdWJsaXNoZWQ=/leaderboard', name: 'T4' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU0YjA2OWQwLTU2MDEtNGM1NS1iMGY5LTIwMDM3ZmRjZDg2YTpQdWJsaXNoZWQ=/leaderboard', name: 'T5' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGYzYzA4OGJiLTdjYjUtNGFmMC05ZDY1LWE1NzJkMjVmZDNiMjpQdWJsaXNoZWQ=/leaderboard', name: 'T6' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGI1NDZiNzUwLTVmZjEtNGU4Ni05NGQ0LTliMmYwMDU1Y2VjZTpQdWJsaXNoZWQ=/leaderboard', name: 'T7' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRmMzRjYmE5Zi05OTA0LTQ1N2ItODRjNi1kZmIzYTBkMmI1ZmE6ZGlkUHVibGlzaGVk/leaderboard', name: 'T8' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRiY2YzNzdmNi01YjYyLTRkYWItYWJkYi00MzE3NTQyZGNhYWM6ZGlkUGxheWVk/leaderboard', name: 'T9' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDEyMDgxN2Q5LThkMmUtNGMxYi05ZjdiLTJmNTg1ZjZlY2ZiMTpQdWJsaXNoZWQ=/leaderboard', name: 'T10' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDJlZDRlYzczLTVhOGMtNGJkNi1iMGRkLWRjODk4YzllNmRhZzpQdWJsaXNoZWQ=/leaderboard', name: 'T11' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDFhNzRiZjQwLTQ0OTctNGI5YS1iMWExLWE1MmJiM2JhNzk5YjpQdWJsaXNoZWQ=/leaderboard', name: 'T12' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDNiOTJmNDA5LWM0OTctNDU4OC1iOTgwLTkzZjc3OTc1OGE5NzpQdWJsaXNoZWQ=/leaderboard', name: 'T13' },
  { url: 'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRmYzJjZjY5LXV0aWwtUm91bmRUb3VybmFtZQpkamQ4ZDBjZjUtZTlkMC00ZTM2LWE4ZmYtYmFkODdiMzcyOWFiOk11bHRpVmFsdWVPbmx5UnVuTW9kZT9wbGFjZWhvbGRlcnM9UGxheWVk/leaderboard', name: 'T14' },
];

function parseLeaderboardText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 6) return [];
  
  const rows = [];
  const dataLines = lines.slice(5); // skip header: # PLAYER SCORE THRU TOTAL
  
  for (let i = 0; i + 4 < dataLines.length; i += 5) {
    const rank = dataLines[i];
    const player = dataLines[i + 1];
    const score = dataLines[i + 2];
    const thru = dataLines[i + 3];
    const total = dataLines[i + 4];
    
    // Validate row quality
    if (!player || player.length === 0) continue;
    if (player.match(/^(PLAYER|SCORE|THRU|TOTAL|Rank|Player|#)$/i)) continue;
    if (!score && score !== '0') continue;
    
    rows.push({ rank, player, score, thru, total });
  }
  
  return rows;
}

async function scrapePage(browser, item) {
  const page = await browser.newPage();
  const errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  try {
    await page.goto(item.url, { timeout: 30000, waitUntil: 'load' });
    // Wait for leaderboard data to render
    await page.waitForFunction(() => {
      const body = document.body.innerText;
      return body.includes('PLAYER') && body.includes('SCORE') && body.length > 200;
    }, { timeout: 15000 });
    await page.waitForTimeout(1000);

    const text = await page.evaluate(() => document.body.innerText);
    const rowCount = parseLeaderboardText(text).length;
    
    await page.close();
    return { name: item.name, success: true, text, rows: rowCount };
  } catch (e) {
    await page.close();
    return { name: item.name, success: false, error: e.message, errors: errors.slice(0, 3) };
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const allResults = [];
  for (const item of URLS) {
    process.stderr.write(`Scraping ${item.name}...\n`);
    const result = await scrapePage(browser, item);
    if (result.success) {
      const rows = parseLeaderboardText(result.text);
      process.stderr.write(`  ✓ ${rows.length} rows\n`);
      allResults.push({ name: item.name, url: item.url, rows });
    } else {
      process.stderr.write(`  ✗ ${result.error}\n`);
      allResults.push({ name: item.name, url: item.url, rows: [], error: result.error });
    }
  }

  await browser.close();
  
  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allResults, null, 2));
  
  process.stderr.write('\nFinal Results:\n');
  let total = 0;
  allResults.forEach(r => {
    const n = r.rows?.length || 0;
    total += n;
    process.stderr.write(`  ${r.name}: ${n} rows${r.error ? ' [ERR: ' + r.error + ']' : ''}\n`);
  });
  process.stderr.write(`\nTotal: ${total} rows across ${allResults.filter(r => r.rows?.length > 0).length} tournaments\n`);
  
  process.exit(0);
})();
