const fs = require('fs');
const path = require('path');

const GITHUB_REPO = 'qiaotech26/New-Maharashtra-Garjana';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// In-memory cache shared across warm serverless invocations
global._NMG_ARTICLES_CACHE = global._NMG_ARTICLES_CACHE || {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: return cached articles map
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

  const stringId = String(id);

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

  try {
    const articleRecord = {
      id: stringId,
      numericId: Number(body.numericId || body.id) || Date.now(),
      title: body.title || 'न्यू महाराष्ट्र गर्जना बातमी',
      img: body.img || '',
      desc: body.desc || body.caption || '',
      content: body.content || '',
      cat: body.cat || 'महाराष्ट्र',
      author: body.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी',
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
