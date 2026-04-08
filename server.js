const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = process.env.PORT || 3000;
const SCRAPE_FILE = path.join(__dirname, 'rescrape_all16.js');
const DATA_FILE = path.join(__dirname, 'leaderboard_data.json');
const LANDING_FILE = path.join(__dirname, 'landing.html');

const MIME = {
  '.html': 'text/html',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css',
};

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // ─── Refresh API ────────────────────────────────────────────
  if (url === '/api/refresh' && req.method === 'POST') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    try {
      // Run scraper
      execSync(`node "${SCRAPE_FILE}"`, { timeout: 300000 });
      console.log('Scraper finished');

      // Read updated data
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

      // Embed into landing.html
      const cleanData = raw.map(t => ({
        name: t.name,
        rows: t.rows.filter(r => r.player && r.score && r.score !== '-' && r.player.length > 1)
      }));

      const dataStr = JSON.stringify(cleanData);
      let html = fs.readFileSync(LANDING_FILE, 'utf8');
      html = html.replace(/const RAW_DATA = \[.*?\];/s, `const RAW_DATA = ${dataStr};`);

      // Write updated landing
      fs.writeFileSync(LANDING_FILE, html);

      const total = cleanData.reduce((sum, t) => sum + t.rows.length, 0);
      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, total, tournaments: cleanData.length }));
    } catch (e) {
      console.error('Refresh error:', e.message);
      res.writeHead(500);
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
    return;
  }

  // ─── CORS preflight ─────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');

  // ─── Static files ────────────────────────────────────────────
  let filePath = req.url === '/' ? '/landing.html' : req.url;
  filePath = path.join(__dirname, filePath);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
