const fs = require('fs');
const path = require('path');

const GITHUB_REPO = 'qiaotech26/New-Maharashtra-Garjana';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const ADMIN_SYNC_KEY = process.env.ADMIN_SYNC_KEY || '';

// In-memory cache shared across warm serverless invocations
global._NMG_ARTICLES_CACHE = global._NMG_ARTICLES_CACHE || {};
global._NMG_RATE_LIMITS = global._NMG_RATE_LIMITS || {};

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxReq = 30; // Max 30 write/delete requests per minute

  if (!global._NMG_RATE_LIMITS[ip] || now > global._NMG_RATE_LIMITS[ip].resetAt) {
    global._NMG_RATE_LIMITS[ip] = { count: 1, resetAt: now + windowMs };
    return true;
  }

  global._NMG_RATE_LIMITS[ip].count++;
  return global._NMG_RATE_LIMITS[ip].count <= maxReq;
}

module.exports = async (req, res) => {
  // Polyfill status, json, and send methods if running in bare Node HTTP server
  if (!res.status) {
    res.status = function (code) {
      res.statusCode = code;
      return res;
    };
  }
  if (!res.json) {
    res.json = function (data) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      }
      return res.end(JSON.stringify(data));
    };
  }
  if (!res.send) {
    res.send = function (data) {
      return res.end(data);
    };
  }

  // Strict CORS restriction
  const allowedOrigins = [
    'https://www.newmaharashtragarjana.com',
    'https://newmaharashtragarjana.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000'
  ];
  const reqOrigin = req.headers.origin;
  if (allowedOrigins.includes(reqOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', reqOrigin);
  } else if (!reqOrigin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.newmaharashtragarjana.com');
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.newmaharashtragarjana.com');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Sync-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: return cached articles map (public read allowed)
  if (req.method === 'GET') {
    let store = global._NMG_ARTICLES_CACHE || {};
    try {
      const localFile = path.join(process.cwd(), 'articles_store.json');
      if (fs.existsSync(localFile)) {
        const fileStore = JSON.parse(fs.readFileSync(localFile, 'utf8'));
        store = { ...fileStore, ...store };
      }
    } catch (e) { }
    return res.status(200).json(store);
  }

  // Rate Limiting for mutating operations (POST, DELETE)
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(String(clientIp))) {
    return res.status(429).json({ error: 'Too Many Requests. Rate limit exceeded.' });
  }

  // Authorization Check if ADMIN_SYNC_KEY is configured
  if (ADMIN_SYNC_KEY) {
    const authHeader = req.headers['authorization'] || '';
    const secretHeader = req.headers['x-sync-secret'] || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    if (bearer !== ADMIN_SYNC_KEY && secretHeader !== ADMIN_SYNC_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Valid sync credentials required' });
    }
  }

  // Parse request body
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { }
  }

  const id = body?.id || req.query?.id;
  const isDelete = req.method === 'DELETE' || body?.action === 'delete';

  if (!id) {
    return res.status(400).json({ error: 'Missing article id' });
  }

  const stringId = String(id).trim();
  if (stringId.length > 100) {
    return res.status(400).json({ error: 'Invalid article id length' });
  }

  // Handle DELETE request
  if (isDelete) {
    delete global._NMG_ARTICLES_CACHE[stringId];

    try {
      const localFile = path.join(process.cwd(), 'articles_store.json');
      if (fs.existsSync(localFile)) {
        let store = {};
        try { store = JSON.parse(fs.readFileSync(localFile, 'utf8')); } catch (e) { }
        delete store[stringId];
        fs.writeFileSync(localFile, JSON.stringify(store, null, 2), 'utf8');
      }
    } catch (e) { }

    try {
      const newsFile = path.join(process.cwd(), 'news_data.json');
      if (fs.existsSync(newsFile)) {
        let newsData = {};
        try { newsData = JSON.parse(fs.readFileSync(newsFile, 'utf8')); } catch (e) { }
        const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
        categories.forEach(cat => {
          if (Array.isArray(newsData[cat])) {
            newsData[cat] = newsData[cat].filter(a => String(a.id) !== stringId);
          }
        });
        fs.writeFileSync(newsFile, JSON.stringify(newsData, null, 2), 'utf8');
      }
    } catch (e) { }

    return res.status(200).json({ success: true, deletedId: stringId });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Input Validation for POST
  const title = String(body.title || '').trim();
  const cat = String(body.cat || '').trim();
  if (!title || title.length > 500) {
    return res.status(400).json({ error: 'Validation Error: Title is required and must be <= 500 characters' });
  }
  if (!cat || cat.length > 80) {
    return res.status(400).json({ error: 'Validation Error: Category is required and must be <= 80 characters' });
  }

  const desc = String(body.desc || body.caption || '').trim();
  if (desc.length > 5000) {
    return res.status(400).json({ error: 'Validation Error: Description exceeds 5000 characters' });
  }

  const content = String(body.content || '').trim();
  if (content.length > 100000) {
    return res.status(400).json({ error: 'Validation Error: Content exceeds 100000 characters' });
  }

  const img = String(body.img || '').trim();
  if (img.length > 1048576) {
    return res.status(400).json({ error: 'Validation Error: Image data exceeds 1MB limit' });
  }

  const author = String(body.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी').trim();
  if (author.length > 150) {
    return res.status(400).json({ error: 'Validation Error: Author exceeds 150 characters' });
  }

  try {
    const articleRecord = {
      id: stringId,
      numericId: Number(body.numericId || body.id) || Date.now(),
      title: title,
      img: img,
      desc: desc,
      content: content,
      cat: cat,
      author: author,
      time: body.time || new Date().toLocaleDateString('mr-IN'),
      isHero: Boolean(body.isHero),
      isBreaking: Boolean(body.isBreaking),
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately store in memory cache
    global._NMG_ARTICLES_CACHE[stringId] = articleRecord;

    // 2. Save to local articles_store.json
    try {
      const localFile = path.join(process.cwd(), 'articles_store.json');
      let store = {};
      if (fs.existsSync(localFile)) {
        try { store = JSON.parse(fs.readFileSync(localFile, 'utf8')); } catch (e) { }
      }
      store[stringId] = articleRecord;
      fs.writeFileSync(localFile, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) { }

    // 3. Save to local news_data.json so server.js and fallback readers have category feeds
    try {
      const newsFile = path.join(process.cwd(), 'news_data.json');
      let newsData = {
        ticker: [],
        latest: [],
        maharashtra: [],
        politics: [],
        sports: [],
        entertainment: [],
        videos: [],
        photos: []
      };
      if (fs.existsSync(newsFile)) {
        try { newsData = JSON.parse(fs.readFileSync(newsFile, 'utf8')); } catch (e) { }
      }
      if (!Array.isArray(newsData.latest)) newsData.latest = [];

      // Update in latest
      const exIdx = newsData.latest.findIndex(a => String(a.id) === stringId);
      if (exIdx !== -1) {
        newsData.latest[exIdx] = articleRecord;
      } else {
        newsData.latest.unshift(articleRecord);
      }

      // Update in category array
      const catMap = {
        'महाराष्ट्र': 'maharashtra',
        'राजकारण': 'politics',
        'क्रीडा': 'sports',
        'मनोरंजन': 'entertainment',
        'व्हिडिओ': 'videos',
        'फोटो': 'photos'
      };
      const catKey = catMap[articleRecord.cat];
      if (catKey) {
        if (!Array.isArray(newsData[catKey])) newsData[catKey] = [];
        const cIdx = newsData[catKey].findIndex(a => String(a.id) === stringId);
        if (cIdx !== -1) {
          newsData[catKey][cIdx] = articleRecord;
        } else {
          newsData[catKey].unshift(articleRecord);
        }
      }

      // If breaking news, add to ticker
      if (articleRecord.isBreaking) {
        if (!Array.isArray(newsData.ticker)) newsData.ticker = [];
        if (!newsData.ticker.includes(articleRecord.title)) {
          newsData.ticker.unshift(articleRecord.title);
        }
      }

      fs.writeFileSync(newsFile, JSON.stringify(newsData, null, 2), 'utf8');
    } catch (e) { }

    // 4. Persist to GitHub articles_store.json if token is provided
    if (GITHUB_TOKEN) {
      try {
        fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/articles_store.json`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'User-Agent': 'NMG-Sync-Bot'
          }
        })
          .then(r => r.json())
          .then(fileData => {
            let store = {};
            let sha = fileData.sha;
            if (fileData.content) {
              try {
                store = JSON.parse(Buffer.from(fileData.content, 'base64').toString('utf8'));
              } catch (e) { }
            }
            store[stringId] = articleRecord;

            return fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/articles_store.json`, {
              method: 'PUT',
              headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'NMG-Sync-Bot',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                message: `Sync article #${stringId}: ${articleRecord.title.slice(0, 50)}`,
                content: Buffer.from(JSON.stringify(store, null, 2)).toString('base64'),
                sha: sha
              })
            });
          })
          .catch(err => console.error('GitHub sync error:', err.message));
      } catch (e) { }
    }

    return res.status(200).json({ success: true, id: stringId, article: articleRecord });
  } catch (err) {
    console.error('sync-article error:', err);
    return res.status(500).json({ error: err.message });
  }
};
