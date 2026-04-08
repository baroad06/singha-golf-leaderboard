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
  
  // Find header (skip it)
  let dataStart = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].match(/^#/) && lines[i].includes('PLAYER')) {
      dataStart = i + 1;
      break;
    }
  }
  
  const rows = [];
  // Data comes as: rank, player, score, thru, total — repeating
  for (let i = dataStart; i + 4 < lines.length; i += 5) {
    const rank = lines[i];
    const player = lines[i + 1];
    const score = lines[i + 2];
    const thru = lines[i + 3];
    const total = lines[i + 4];
    
    // Validate: rank should be number (or empty for continuation)
    // player should not be a header or number
    if (!player || player.match(/^(PLAYER|SCORE|THRU|TOTAL|Rank|Player|#)$/i)) continue;
    // score should look like a score (E, +3, -2, 0, etc)
    if (!score.match(/^([EW]|[+-]?\d+)$/) && score !== 'E') continue;
    
    rows.push({ rank, player, score, thru, total });
  }
  
  return rows;
}

async function scrapePage(browser, item) {
  const page = await browser.newPage();
  try {
    await page.goto(item.url, { timeout: 25000 });
    await page.waitForTimeout(4000);

    const data = await page.evaluate(() => {
      return document.body.innerText;
    });

    await page.close();
    return { name: item.name, success: true, text: data };
  } catch (e) {
    await page.close();
    return { name: item.name, success: false, error: e.message };
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
    if (result.success && result.text) {
      const rows = parseLeaderboardText(result.text);
      process.stderr.write(`  ✓ Got ${rows.length} rows\n`);
      allResults.push({ name: item.name, url: item.url, rows });
    } else {
      process.stderr.write(`  ✗ ${result.error || 'empty'}\n`);
      allResults.push({ name: item.name, url: item.url, rows: [], error: result.error });
    }
  }

  await browser.close();
  
  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allResults, null, 2));
  process.stderr.write('\nAll done! Results:\n');
  allResults.forEach(r => {
    process.stderr.write(`  ${r.name}: ${r.rows?.length || 0} rows${r.error ? ' ERROR:' + r.error : ''}\n`);
  });
  
  process.exit(0);
})();
