const url = require('url');
const fs = require('fs');
const path = require('path');

const resolvedImageCache = {};

function getStoreData() {
  let newsData = null;
  let articlesStore = {};

  try {
    newsData = require('../news_data.json');
  } catch (e) {
    try {
      const dataPath = path.join(process.cwd(), 'news_data.json');
      if (fs.existsSync(dataPath)) {
        newsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
    } catch (err) {}
  }

  try {
    articlesStore = require('../articles_store.json');
  } catch (e) {
    try {
      const storePath = path.join(process.cwd(), 'articles_store.json');
      if (fs.existsSync(storePath)) {
        articlesStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
      }
    } catch (err) {}
  }

  return { newsData, articlesStore };
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

function cleanText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function resolveDirectImageUrl(imgUrl) {
  if (!imgUrl || typeof imgUrl !== 'string') return imgUrl;
  if (resolvedImageCache[imgUrl]) return resolvedImageCache[imgUrl];

  // WhatsApp crawlers fail on 302 redirects. Resolve picsum.photos to direct fastly CDN URLs.
  if (imgUrl.includes('picsum.photos') && !imgUrl.includes('fastly.picsum.photos')) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(imgUrl, { redirect: 'follow', signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok && res.url && res.url !== imgUrl) {
        resolvedImageCache[imgUrl] = res.url;
        return res.url;
      }
    } catch (e) {}
  }

  return imgUrl;
}

module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.newmaharashtragarjana.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  
  // Parse query parameters
  let query = req.query;
  if (!query || Object.keys(query).length === 0) {
    try {
      const parsedUrl = new URL(req.url, `${proto}://${host}`);
      query = Object.fromEntries(parsedUrl.searchParams.entries());
    } catch (e) {
      query = {};
    }
  }
  
  // Extract ID from query OR URL path (/article/:id or /share/:id)
  let id = query.id || query.article;
  if (!id && req.url) {
    const cleanPath = req.url.split('?')[0];
    const match = cleanPath.match(/\/(?:article|share)\/([^/?#]+)/i);
    if (match) {
      id = decodeURIComponent(match[1]);
    }
  }

  let title = query.title;
  let desc = query.desc || query.description;
  let img = query.img || query.image || query.thumb;

  if (id) {
    const stringId = String(id);
    const { newsData, articlesStore } = getStoreData();

    // 1. Check in-memory global cache
    if ((!title || !img) && global._NMG_ARTICLES_CACHE && global._NMG_ARTICLES_CACHE[stringId]) {
      const cached = global._NMG_ARTICLES_CACHE[stringId];
      if (!title) title = cached.title;
      if (!desc) desc = cached.desc;
      if (!img) img = cached.img;
    }

    // 2. Check articles_store.json (custom admin articles)
    if ((!title || !img) && articlesStore && articlesStore[stringId]) {
      const custom = articlesStore[stringId];
      if (!title) title = custom.title;
      if (!desc) desc = custom.desc;
      if (!img) img = custom.img;
    }

    // 3. Check news_data.json (default articles across all categories)
    if ((!title || !img) && newsData) {
      const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
      for (const cat of categories) {
        if (Array.isArray(newsData[cat])) {
          const found = newsData[cat].find(a => String(a.id) === stringId);
          if (found) {
            if (!title) title = found.title;
            if (!desc) desc = found.desc || found.caption;
            if (!img) img = found.img;
            break;
          }
        }
      }
    }

    // 4. Remote GitHub fallback if article was just added
    if ((!title || !img)) {
      try {
        const rawRes = await fetch('https://raw.githubusercontent.com/qiaotech26/New-Maharashtra-Garjana/main/articles_store.json', { cache: 'no-cache' });
        if (rawRes.ok) {
          const remoteStore = await rawRes.json();
          if (remoteStore && remoteStore[stringId]) {
            const art = remoteStore[stringId];
            if (!title) title = art.title;
            if (!desc) desc = art.desc;
            if (!img) img = art.img;
          }
        }
      } catch (e) {}
    }

    // 5. Cloud Firestore lookup for project 'newmahagarjana'
    if (!title || !img) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const fsRes = await fetch(`https://firestore.googleapis.com/v1/projects/newmahagarjana/databases/(default)/documents/news_articles/${stringId}`, {
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (fsRes.ok) {
          const doc = await fsRes.json();
          const fields = doc.fields || {};
          if (!title && fields.title && fields.title.stringValue) title = fields.title.stringValue;
          if (!desc && fields.desc && fields.desc.stringValue) desc = fields.desc.stringValue;
          if (!img && fields.img && fields.img.stringValue) img = fields.img.stringValue;
        }
      } catch (e) {}
    }
  }

  // Fallbacks if still not provided
  title = cleanText(title) || 'न्यू महाराष्ट्र गर्जना बातमी';
  desc = cleanText(desc) || 'महाराष्ट्रातील सर्वात विश्वासार्ह मराठी बातम्यांचे डिजिटल वृत्तपत्र. ताज्या घडामोडी सविस्तर वाचा.';
  
  if (desc.length > 240) {
    desc = desc.substring(0, 237).trim() + '...';
  }

  // Format absolute image URL for WhatsApp / Social scrapers
  const defaultLogo = `${proto}://${host}/marathi-title-gold-glow.png`;
  if (!img || img.startsWith('data:')) {
    img = defaultLogo;
  } else if (!img.startsWith('http://') && !img.startsWith('https://')) {
    img = `${proto}://${host}${img.startsWith('/') ? img : '/' + img}`;
  }

  // Resolve redirecting images to direct 200 OK CDN URLs for WhatsApp preview
  img = await resolveDirectImageUrl(img);

  // Clean short redirect target for users clicking in browser
  const targetUrl = id 
    ? `${proto}://${host}/?article=${encodeURIComponent(id)}`
    : `${proto}://${host}/`;

  const canonicalUrl = id 
    ? `${proto}://${host}/article/${encodeURIComponent(id)}`
    : `${proto}://${host}/`;

  const imgType = img.endsWith('.png') ? 'image/png' : (img.endsWith('.webp') ? 'image/webp' : 'image/jpeg');

  const html = `<!DOCTYPE html>
<html lang="mr" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना | New Maharashtra Garjana</title>
  
  <!-- Primary Meta Tags -->
  <meta name="title" content="${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना">
  <meta name="description" content="${escapeHtml(desc)}">
  
  <!-- OpenGraph / Facebook / WhatsApp Preview Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="न्यू महाराष्ट्र गर्जना">
  <meta property="og:title" content="${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:secure_url" content="${img}">
  <meta property="og:image:type" content="${imgType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="mr_IN">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@newmaharashtragarjana">
  <meta name="twitter:title" content="${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${img}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  
  <!-- Instant redirection for browser visitors (crawlers stay to read meta tags) -->
  <script>
    window.location.replace('${targetUrl}');
  </script>
</head>
<body style="margin: 0; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #FFFFFF; text-align: center;">
  <div style="max-width: 600px; margin: 0 auto; background: #1E293B; padding: 30px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    <h2 style="color: #F59E0B; margin-top: 0;">न्यू महाराष्ट्र गर्जना</h2>
    <div style="margin: 20px 0; border-radius: 8px; overflow: hidden; max-height: 280px;">
      <img src="${img}" alt="${escapeHtml(title)}" style="width: 100%; height: auto; object-fit: cover; display: block; border-radius: 8px;">
    </div>
    <h3 style="color: #FFFFFF; font-size: 1.15rem; line-height: 1.5; margin: 15px 0;">${escapeHtml(title)}</h3>
    <p style="color: #CBD5E1; font-size: 0.95rem; line-height: 1.6; margin: 15px 0;">${escapeHtml(desc)}</p>
    <p style="color: #94A3B8; font-size: 0.85rem;">बातमी उघडत आहे, कृपया प्रतीक्षा करा...</p>
    <a href="${targetUrl}" style="display: inline-block; margin-top: 15px; padding: 10px 24px; background: #E11D48; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 600;">थेट बातमी उघडा →</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  if (typeof res.status === 'function') {
    res.status(200).send(html);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(html);
  }
};
