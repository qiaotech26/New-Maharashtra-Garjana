const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const NEWS_FILE = path.join(BASE_DIR, 'news_data.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.xml': 'application/xml; charset=UTF-8',
  '.txt': 'text/plain; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function getArticlesMap() {
  try {
    if (fs.existsSync(NEWS_FILE)) {
      const data = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
      const map = {};
      const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
      categories.forEach(cat => {
        if (Array.isArray(data[cat])) {
          data[cat].forEach(a => {
            if (a.id) map[String(a.id)] = a;
          });
        }
      });
      return map;
    }
  } catch (e) {
    console.error('Error reading news_data.json:', e);
  }
  return {};
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureAbsoluteUrl(imgUrl, host) {
  if (!imgUrl) return `https://${host}/marathi-title-gold-glow.png`;
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) {
    return imgUrl;
  }
  const cleanPath = imgUrl.startsWith('/') ? imgUrl : '/' + imgUrl;
  return `https://${host}${cleanPath}`;
}

const server = http.createServer((req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  let reqPath = decodeURI(parsedUrl.pathname);

  // API endpoint to sync new/edited articles from Admin panel
  if (req.method === 'POST' && reqPath === '/api/sync-article') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const article = JSON.parse(body);
        if (article && article.id) {
          let newsData = {};
          if (fs.existsSync(NEWS_FILE)) {
            newsData = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
          }
          if (!Array.isArray(newsData.latest)) newsData.latest = [];
          
          const existingIdx = newsData.latest.findIndex(a => a.id === article.id);
          if (existingIdx !== -1) {
            newsData.latest[existingIdx] = article;
          } else {
            newsData.latest.unshift(article);
          }
          fs.writeFileSync(NEWS_FILE, JSON.stringify(newsData, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, id: article.id }));
          return;
        }
      } catch (err) {
        console.error('Sync article error:', err);
      }
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid article data' }));
    });
    return;
  }

  // Check if article ID is requested (via ?article=101, ?id=101, or /article/101)
  let articleId = parsedUrl.searchParams.get('article') || parsedUrl.searchParams.get('id');
  if (!articleId && reqPath.startsWith('/article/')) {
    articleId = reqPath.split('/')[2];
  }

  // Handle Home / Article / HTML routes with Dynamic OpenGraph Injection for WhatsApp preview
  if ((reqPath === '/' || reqPath === '' || reqPath === '/index.html' || reqPath.startsWith('/article/')) && req.method === 'GET') {
    const indexPath = path.join(BASE_DIR, 'index.html');
    fs.readFile(indexPath, 'utf8', (err, html) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error reading index.html');
        return;
      }

      if (articleId) {
        const articlesMap = getArticlesMap();
        const article = articlesMap[String(articleId)];

        if (article) {
          const title = escapeHtml(article.title || 'न्यू महाराष्ट्र गर्जना बातमी');
          const desc = escapeHtml(article.desc || article.caption || 'महाराष्ट्रातील ताज्या व महत्त्वाच्या घडामोडी सविस्तर वाचा.');
          const imageUrl = ensureAbsoluteUrl(article.img, host);
          const shareUrl = `https://${host}/?article=${article.id}`;

          // Inject specific article OpenGraph and Twitter tags for WhatsApp & Social preview
          let modifiedHtml = html;

          // Replace title
          modifiedHtml = modifiedHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title} - न्यू महाराष्ट्र गर्जना | New Maharashtra Garjana</title>`);
          
          // Replace meta description
          modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']/i, `<meta name="description" content="${desc}"`);

          // Replace og:title
          modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']/i, `<meta property="og:title" content="${title} - न्यू महाराष्ट्र गर्जना"`);

          // Replace og:description
          modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']/i, `<meta property="og:description" content="${desc}"`);

          // Replace og:image with specific article thumbnail
          modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']/i, `<meta property="og:image" content="${imageUrl}"`);

          // Insert og:image:secure_url and dimensions if not present
          if (modifiedHtml.includes('og:image:secure_url')) {
            modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image:secure_url["']\s+content=["'][^"']*["']/i, `<meta property="og:image:secure_url" content="${imageUrl}"`);
          } else {
            modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:image["'][^>]*>/i, `$&
<meta property="og:image:secure_url" content="${imageUrl}">
<meta property="og:image:type" content="image/jpeg">`);
          }

          // Replace og:url
          modifiedHtml = modifiedHtml.replace(/<meta\s+property=["']og:url["']\s+content=["'][^"']*["']/i, `<meta property="og:url" content="${shareUrl}"`);

          // Replace twitter tags
          modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:title["']\s+content=["'][^"']*["']/i, `<meta name="twitter:title" content="${title} - न्यू महाराष्ट्र गर्जना"`);
          modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:description["']\s+content=["'][^"']*["']/i, `<meta name="twitter:description" content="${desc}"`);
          modifiedHtml = modifiedHtml.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']/i, `<meta name="twitter:image" content="${imageUrl}"`);

          res.writeHead(200, {
            'Content-Type': 'text/html; charset=UTF-8',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
          res.end(modifiedHtml);
          return;
        }
      }

      // Default home page response
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache'
      });
      res.end(html);
    });
    return;
  }

  // Static File Serving
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`<h1>404 Not Found</h1><p>The file <code>${reqPath}</code> was not found.</p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
