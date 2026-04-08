const { chromium } = require('playwright');

const URLS = [
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDUyM2EwOGNhLWUwZmQtNGIzNC1hNDZmLTU5ZmI2ODgxMDNmYjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGZkOTUzZjU5LWVlYWEtNDA2Mi1hZmZjLTQ3OWUxNjJlYmYzZjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGExYmQ5ZTk5LTE0NzUtNDg4ZC05MDI4LWFkOGY0ZDgxNTIyOTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGZhZjMyMmI2LTZjZWItNDI2NC04NTgyLTdlNTQ2YTk0NDFhODpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGM0ODIxMjBmLWJkNDktNGE0My04YmViLTNiMjczMTlhNzcwMDpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDUwNjY0NDE1LWIxOTAtNDIzMC04YmI1LTI4ZjhjZTI0NGZlMjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU4MGVlOWNlLTIwNWMtNDc1My1hNzY3LTFmOTlkODMxNjFiZDpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDU0YjA2OWQwLTU2MDEtNGM1NS1iMGY5LTIwMDM3ZmRjZDg2YTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGYzYzA4OGJiLTdjYjUtNGFmMC05ZDY1LWE1NzJkMjVmZDNiMjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGI1NDZiNzUwLTVmZjEtNGU4Ni05NGQ0LTliMmYwMDU1Y2VjZTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDgzNTNiYTlmLTk5MDQtNDU3Yi04NGM2LWRmYjNhMGQyYjVmYTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZGJjZjM3N2Y2LTViNjItNGRhYi1hYmRiLTQzMTc1NDJkY2FhYzpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDEyMDgxN2Q5LThkMmUtNGMxYi05ZjdiLTJmNTg1ZjZlY2ZiMTpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDJlZDRlYzczLTVhOGMtNGJkNi1iMGRkLWRjODk4YzllNmRhZzpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDFhNzRiZjQwLTQ0OTctNGI5YS1iMWExLWE1MmJiM2JhNzk5YjpQdWJsaXNoZWQ=/leaderboard',
  'https://portal.trackmangolf.com/tournaments/TXVsdGlSb3VuZFRvdXJuYW1lbnQKZDNiOTJmNDA5LWM0OTctNDU4OC1iOTgwLTkzZjc3OTc1OGE5NzpQdWJsaXNoZWQ=/leaderboard',
];

function isName(s) {
  if (!s) return false;
  const t = s.trim();
  return !/^\d+$/.test(t) && !/^[+-]?\d+$/.test(t) && t !== 'E' && t !== 'F' &&
    t !== 'DNF' && !/^(PLAYER|SCORE|THRU|TOTAL|Rank|#)$/i.test(t) && t.length > 0;
}

function parse(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const rows = [];
  let i = 5;
  while (i + 3 < lines.length) {
    const [a, b, c, d, e] = [lines[i], lines[i+1], lines[i+2], lines[i+3], lines[i+4]];
    if (isName(a) && isName(b) && isName(c)) { rows.push({rank:'',player:a,score:b,thru:c,total:d}); i+=4; continue; }
    if (isName(a) && !isName(b) && !isName(c)) { rows.push({rank:'',player:a,score:b,thru:c,total:d}); i+=4; continue; }
    if (/^\d+$/.test(a) && isName(b) && !isName(c)) { rows.push({rank:a,player:b,score:c,thru:d,total:e}); i+=5; continue; }
    if (/^\d+$/.test(a) && isName(b) && isName(c)) { rows.push({rank:a,player:b,score:c,thru:d,total:e}); i+=5; continue; }
    i++;
  }
  return rows;
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu'] });
  const allData = [];

  for (let i = 0; i < URLS.length; i++) {
    const name = 'T' + (i+1);
    const page = await browser.newPage();
    try {
      await page.goto(URLS[i], { timeout: 60000, waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8000);
      const text = await page.evaluate(() => document.body.innerText);
      await page.close();
      const rows = parse(text);
      process.stderr.write(`[${name}] ${rows.length} rows\n`);
      allData.push({ name, rows });
    } catch(e) {
      await page.close();
      process.stderr.write(`[${name}] ERROR: ${e.message.substring(0,50)}\n`);
      allData.push({ name, rows: [] });
    }
  }

  await browser.close();

  const fs = require('fs');
  fs.writeFileSync('/data/.openclaw/workspace/golf-leaderboard/leaderboard_data.json', JSON.stringify(allData, null, 2));

  let total = 0;
  allData.forEach(t => {
    const valid = t.rows.filter(r => r.player && r.score && r.score !== '-' && r.player.length > 1);
    process.stderr.write(`  ${t.name}: ${valid.length} valid\n`);
    total += valid.length;
  });
  process.stderr.write(`TOTAL: ${total} valid players\n`);

  process.exit(0);
})();
