const url = require('url');

let newsData = null;
try {
  newsData = require('../news_data.json');
} catch (e) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dataPath = path.join(process.cwd(), 'news_data.json');
    if (fs.existsSync(dataPath)) {
      newsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (err) {}
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

module.exports = (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.newmaharashtragarjana.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  
  // Parse query parameters
  let query = req.query;
  if (!query || Object.keys(query).length === 0) {
    const parsed = url.parse(req.url, true);
    query = parsed.query || {};
  }
  
  const id = query.id || query.article;
  let title = query.title;
  let desc = query.desc || query.description;
  let img = query.img || query.image;

  // If title or img is missing, try looking up in newsData
  if ((!title || !img) && id && newsData) {
    const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
    for (const cat of categories) {
      if (Array.isArray(newsData[cat])) {
        const found = newsData[cat].find(a => String(a.id) === String(id));
        if (found) {
          if (!title) title = found.title;
          if (!desc) desc = found.desc || found.caption;
          if (!img) img = found.img;
          break;
        }
      }
    }
  }

  // Fallbacks if not provided
  title = title || 'न्यू महाराष्ट्र गर्जना बातमी';
  desc = desc || 'महाराष्ट्रातील सर्वात विश्वासार्ह मराठी बातम्यांचे डिजिटल वृत्तपत्र. ताज्या घडामोडी सविस्तर वाचा.';

  // Format absolute image URL for WhatsApp / Social scrapers
  const defaultLogo = `${proto}://${host}/marathi-title-gold-glow.png`;
  if (!img || img.startsWith('data:')) {
    img = defaultLogo;
  } else if (!img.startsWith('http://') && !img.startsWith('https://')) {
    img = `${proto}://${host}${img.startsWith('/') ? img : '/' + img}`;
  }

  const redirectParams = new URLSearchParams();
  if (id) redirectParams.set('article', id);
  if (title && title !== 'न्यू महाराष्ट्र गर्जना बातमी') redirectParams.set('title', title);
  if (img && !img.includes('marathi-title-gold-glow.png')) redirectParams.set('img', img);
  if (desc && !desc.includes('महाराष्ट्रातील सर्वात विश्वासार्ह')) redirectParams.set('desc', desc);

  const targetUrl = `${proto}://${host}/?${redirectParams.toString()}`;
  const canonicalUrl = `${proto}://${host}/share?id=${id || ''}`;

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
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:url" content="${targetUrl}">
  <meta property="og:locale" content="mr_IN">
  
  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@newmaharashtragarjana">
  <meta name="twitter:title" content="${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${img}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  
  <!-- Instant redirection for browser visits -->
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
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
    <p style="color: #94A3B8; font-size: 0.9rem;">बातमी उघडत आहे, कृपया प्रतीक्षा करा...</p>
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
