const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_REPO = 'qiaotech26/New-Maharashtra-Garjana';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

// In-memory cache shared across warm serverless invocations
global._NMG_ARTICLES_CACHE = global._NMG_ARTICLES_CACHE || {};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(global._NMG_ARTICLES_CACHE || {});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    if (!body || !body.id) {
      return res.status(400).json({ error: 'Missing article id' });
    }

    const id = String(body.id);
    const articleRecord = {
      id: id,
      title: body.title || 'न्यू महाराष्ट्र गर्जना बातमी',
      img: body.img || '',
      desc: body.desc || body.caption || '',
      cat: body.cat || 'महाराष्ट्र',
      time: body.time || '',
      updatedAt: new Date().toISOString()
    };

    // 1. Immediately store in memory cache
    global._NMG_ARTICLES_CACHE[id] = articleRecord;

    // 2. Also save to local articles_store.json if file exists
    try {
      const localFile = path.join(process.cwd(), 'articles_store.json');
      let store = {};
      if (fs.existsSync(localFile)) {
        try { store = JSON.parse(fs.readFileSync(localFile, 'utf8')); } catch (e) {}
      }
      store[id] = articleRecord;
      fs.writeFileSync(localFile, JSON.stringify(store, null, 2), 'utf8');
    } catch (e) {}

    // 3. Persist to GitHub articles_store.json if token is provided
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
            } catch (e) {}
          }
          store[id] = articleRecord;
          
          return fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/articles_store.json`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'User-Agent': 'NMG-Sync-Bot',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Sync article #${id}: ${articleRecord.title.slice(0, 50)}`,
              content: Buffer.from(JSON.stringify(store, null, 2)).toString('base64'),
              sha: sha
            })
          });
        })
        .catch(err => console.error('GitHub sync error:', err.message));
      } catch (e) {}
    }

    return res.status(200).json({ success: true, id: id });
  } catch (err) {
    console.error('sync-article error:', err);
    return res.status(500).json({ error: err.message });
  }
};
