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

function parseLeaderboardText(text, url) {
  // Split by newlines and parse each line
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Find header row position
  const headerIdx = lines.findIndex(l => 
    l.includes('#') && l.includes('PLAYER') && l.includes('SCORE')
  );
  
  let dataStart = headerIdx >= 0 ? headerIdx + 1 : 0;
  if (headerIdx >= 0) dataStart = headerIdx + 1;
  
  // Try to parse remaining lines
  const rows = [];
  let i = dataStart;
  while (i < lines.length) {
    const line = lines[i];
    
    // Skip header fragments or separators
    if (line.match(/^(#|PLAYER|SCORE|THRU|TOTAL|Rank|Player)/i)) { i++; continue; }
    
    // Try to detect row: starts with number (rank) followed by player name
    const rankMatch = line.match(/^(\d+)\s+(.+)/);
    if (rankMatch) {
      const rank = rankMatch[1];
      const rest = rankMatch[2];
      
      // Score is next line(s) until thru
      const scoreLine = lines[i + 1] || '';
      const thruLine = lines[i + 2] || '';
      const totalLine = lines[i + 3] || '';
      
      // Score: E, -2, +3, etc
      const scoreMatch = scoreLine.match(/^([EW]|[+-]?\d+)$/) || scoreLine.match(/^[+-]?\d+$/) || scoreLine.match(/^[EW]$/);
      if (scoreMatch || scoreLine === 'E') {
        rows.push({
          rank: rank,
          player: rest.replace(/\s+/g, ' ').trim(),
          score: scoreLine,
          thru: thruLine.match(/^[A-Z]$/) ? thruLine : (thruLine.match(/^\d+$/) ? thruLine : '-'),
          total: totalLine.match(/^\d+$/) ? totalLine : '-'
        });
        i += scoreMatch ? 2 : 1;
        // Skip thru and total if numeric
        if (thruLine.match(/^\d+$/)) i++;
        if (totalLine.match(/^\d+$/)) i++;
      } else {
        rows.push({
          rank: rank,
          player: rest.replace(/\s+/g, ' ').trim(),
          score: '-',
          thru: '-',
          total: '-'
        });
        i += 1;
      }
    } else {
      // Try as player-only line (continuation or single entry)
      if (line.length > 1 && line.length < 50 && !line.match(/^\d+\s+\d+/)) {
        rows.push({
          rank: '',
          player: line,
          score: '-',
          thru: '-',
          total: '-'
        });
      }
      i++;
    }
  }
  
  return rows;
}

async function scrapePage(browser, item) {
  const page = await browser.newPage();
  try {
    await page.goto(item.url, { timeout: 25000 });
    await page.waitForTimeout(3000);

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
      const rows = parseLeaderboardText(result.text, item.url);
      process.stderr.write(`  ✓ Got ${rows.length} rows\n`);
      allResults.push({ name: item.name, url: item.url, rows });
    } else {
      process.stderr.write(`  ✗ ${result.error}\n`);
      allResults.push({ name: item.name, url: item.url, rows: [], error: result.error });
    }
  }

  await browser.close();
  
  // Save to file
  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allResults, null, 2));
  process.stderr.write('\nSaved to leaderboard_data.json\n');
  
  // Output counts
  allResults.forEach(r => {
    process.stderr.write(`${r.name}: ${r.rows?.length || 0} rows${r.error ? ' (ERROR: ' + r.error + ')' : ''}\n`);
  });
  
  process.exit(0);
})();
