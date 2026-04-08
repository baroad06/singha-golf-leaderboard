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
];

async function scrapePage(browser, url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { timeout: 20000, waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const data = await page.evaluate(() => {
      // Try to get tournament name from page title/header
      const titleEl = document.querySelector('h1, h2, [class*="title"], [class*="name"]');
      const tournamentName = titleEl ? titleEl.innerText.trim() : document.title;

      // Try multiple table selectors
      const table = document.querySelector('table');
      if (!table) return null;

      const headers = Array.from(table.querySelectorAll('th')).map(h => h.innerText.trim().toLowerCase());
      const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => {
        const cells = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
        if (cells.length < 4) return null;
        return { rank: cells[0], player: cells[1], score: cells[2], thru: cells[3], total: cells[4] || '' };
      }).filter(r => r && r.player);

      return { tournamentName, headers, rows };
    });

    await page.close();
    return { url, success: true, data };
  } catch (e) {
    await page.close();
    return { url, success: false, error: e.message };
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  for (const url of URLS) {
    process.stderr.write(`Scraping: ${url.substring(0, 80)}\n`);
    const result = await scrapePage(browser, url);
    if (result.success && result.data) {
      process.stderr.write(`  ✓ Got ${result.data.rows?.length || 0} rows: "${result.data.tournamentName}"\n`);
    } else {
      process.stderr.write(`  ✗ ${result.error}\n`);
    }
    // Output JSON to stdout for capture
    console.log(JSON.stringify(result));
  }

  await browser.close();
  process.exit(0);
})();
