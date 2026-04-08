const { chromium } = require('playwright');

const URLS = [
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDUyM2EwOGNhLWUwZmQtNGIzNC1hNDZmLTU5ZmI2ODgxMDNmYjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRkOTUzZjU5LWVlYWEtNDA2Mi1hZmZjLTQ3OWUxNjJlYmYzZjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGM0ODIxMjBmLWJkNDktNGE0My04YmViLTNiMjczMTlhNzcwMDpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU4MGVlOWNlLTIwNWMtNDc1My1hNzY3LTFmOTlkODMxNjFiZDpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU0YjA2OWQwLTU2MDEtNGM1NS1iMGY5LTIwMDM3ZmRjZDg2YTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGYzYzA4OGJiLTdjYjUtNGFmMC05ZDY1LWE1NzJkMjVmZDNiMjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGI1NDZiNzUwLTVmZjEtNGU4Ni05NGQ0LTliMmYwMDU1Y2VjZTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRmMzRjYmE5Zi05OTA0LTQ1N2ItODRjNi1kZmIzYTBkMmI1ZmE6ZGlkUHVibGlzaGVk/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRiY2YzNzdmNi01YjYyLTRkYWItYWJkYi00MzE3NTQyZGNhYWM6ZGlkUGxheWVk/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDEyMDgxN2Q5LThkMmUtNGMxYi05ZjdiLTJmNTg1ZjZlY2ZiMTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDJlZDRlYzczLTVhOGMtNGJkNi1iMGRkLWRjODk4YzllNmRhZzpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDFhNzRiZjQwLTQ0OTctNGI5YS1iMWExLWE1MmJiM2JhNzk5YjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDNiOTJmNDA5LWM0OTctNDU4OC1iOTgwLTkzZjc3OTc1OGE5NzpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGRmYzJjZjY5LXV0aWwtUm91bmRUb3VybmFtZQpkamQ4ZDBjZjUtZTlkMC00ZTM2LWE4ZmYtYmFkODdiMzcyOWFiOk11bHRpVmFsdWVPbmx5UnVuTW9kZT9wbGFjZWhvbGRlcnM9UGxheWVk/leaderboard',
];

function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 6) return [];
  const rows = [];
  const data = lines.slice(5);
  for (let i = 0; i + 4 < data.length; i += 5) {
    const rank = data[i];
    const player = data[i + 1];
    const score = data[i + 2];
    const thru = data[i + 3];
    const total = data[i + 4];
    if (!player || player.length === 0) continue;
    if (player.match(/^(PLAYER|SCORE|THRU|TOTAL|Rank|#)$/i)) continue;
    rows.push({ rank, player, score, thru, total });
  }
  return rows;
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const allResults = [];
  for (let i = 0; i < URLS.length; i++) {
    const url = URLS[i];
    const name = 'T' + (i + 1);
    process.stderr.write(`[${i+1}/${URLS.length}] Scraping ${name}... `);
    
    const page = await browser.newPage();
    try {
      await page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8000);

      const text = await page.evaluate(() => document.body.innerText);
      const rows = parse(text);
      process.stderr.write(`${rows.length} rows\n`);
      allResults.push({ name, url, rows });
    } catch (e) {
      process.stderr.write(`ERROR: ${e.message.substring(0, 50)}\n`);
      allResults.push({ name, url, rows: [], error: e.message });
    }
    await page.close();
  }

  await browser.close();
  
  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allResults, null, 2));
  
  let total = 0;
  allResults.forEach(r => { total += r.rows?.length || 0; });
  process.stderr.write(`\nDone! Total: ${total} rows\n`);
  process.exit(0);
})();
