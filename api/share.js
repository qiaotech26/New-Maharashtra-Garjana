const fs = require('fs');
const path = require('path');

// ── IMAGE URL RESOLUTION CACHE ──────────────────────────────────────────────
const resolvedImageCache = {};

// ── LOAD LOCAL DATA FILES ────────────────────────────────────────────────────
function getStoreData() {
  let newsData = null;
  let articlesStore = {};

  try {
    const dataPath = path.join(process.cwd(), 'news_data.json');
    if (fs.existsSync(dataPath)) {
      newsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
  } catch (e) { }

  try {
    const storePath = path.join(process.cwd(), 'articles_store.json');
    if (fs.existsSync(storePath)) {
      articlesStore = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
  } catch (e) { }

  return { newsData, articlesStore };
}

// ── HTML ESCAPE ──────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── STRIP HTML TAGS ──────────────────────────────────────────────────────────
function cleanText(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── RESOLVE REDIRECT IMAGE URLS ──────────────────────────────────────────────
// WhatsApp crawlers fail on 302 redirects (e.g. picsum.photos).
// Resolve to direct CDN URLs to ensure the preview image loads.
async function resolveDirectImageUrl(imgUrl) {
  if (!imgUrl || typeof imgUrl !== 'string') return imgUrl;
  if (resolvedImageCache[imgUrl]) return resolvedImageCache[imgUrl];

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
    } catch (e) { }
  }

  return imgUrl;
}

// ── GETS A VALID ARTICLE IMAGE URL ───────────────────────────────────────────
// Returns the article's own image if it's a valid public HTTPS URL,
// otherwise falls back to the official branding image.
function getArticleShareImage(imgField, proto, host) {
  const fallback = `${proto}://${host}/marathi-title-gold-glow.png`;

  if (!imgField) return fallback;
  if (imgField.startsWith('data:')) return fallback; // data URIs are not crawlable
  if (imgField.startsWith('blob:')) return fallback; // blob URLs are not crawlable

  if (imgField.startsWith('http://') || imgField.startsWith('https://')) {
    return imgField; // Already absolute
  }

  // Relative path — make it absolute
  return `${proto}://${host}${imgField.startsWith('/') ? imgField : '/' + imgField}`;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.newmaharashtragarjana.com';
  const proto = req.headers['x-forwarded-proto'] || 'https';

  // Parse query parameters (Vercel sets req.query; for other environments parse manually)
  let query = req.query;
  if (!query || Object.keys(query).length === 0) {
    try {
      const parsedUrl = new URL(req.url, `${proto}://${host}`);
      query = Object.fromEntries(parsedUrl.searchParams.entries());
    } catch (e) {
      query = {};
    }
  }

  // ── EXTRACT ARTICLE ID ───────────────────────────────────────────────────
  // Priority: ?id= param > ?article= param > /article/:id path segment
  let id = query.id || query.article;
  if (!id && req.url) {
    const cleanPath = req.url.split('?')[0];
    const match = cleanPath.match(/\/(?:article|share)\/([^/?#]+)/i);
    if (match) {
      id = decodeURIComponent(match[1]);
    }
  }

  let title = null;
  let desc = null;
  let img = null;

  if (id) {
    const stringId = String(id);
    const { newsData, articlesStore } = getStoreData();

    // ── LOOKUP ORDER ─────────────────────────────────────────────────────
    // 1. In-process memory cache (warm serverless invocation)
    if (global._NMG_ARTICLES_CACHE && global._NMG_ARTICLES_CACHE[stringId]) {
      const cached = global._NMG_ARTICLES_CACHE[stringId];
      title = title || cached.title;
      desc = desc || cached.desc;
      img = img || cached.img;
    }

    // 2. articles_store.json (persisted synced articles from admin portal)
    if ((!title || !img) && articlesStore && articlesStore[stringId]) {
      const custom = articlesStore[stringId];
      title = title || custom.title;
      desc = desc || custom.desc;
      img = img || custom.img;
    }

    // 3. news_data.json (built-in default articles)
    if ((!title || !img) && newsData) {
      const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
      for (const cat of categories) {
        if (Array.isArray(newsData[cat])) {
          const found = newsData[cat].find(a => String(a.id) === stringId);
          if (found) {
            title = title || found.title;
            desc = desc || found.desc || found.caption;
            img = img || found.img;
            break;
          }
        }
      }
    }

    // 4. GitHub raw articles_store.json (catches articles synced after last deploy)
    if (!title || !img) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const rawRes = await fetch(
          'https://raw.githubusercontent.com/qiaotech26/New-Maharashtra-Garjana/main/articles_store.json',
          { cache: 'no-cache', signal: controller.signal }
        );
        clearTimeout(timeout);
        if (rawRes.ok) {
          const remoteStore = await rawRes.json();
          if (remoteStore && remoteStore[stringId]) {
            const art = remoteStore[stringId];
            title = title || art.title;
            desc = desc || art.desc;
            img = img || art.img;
          }
        }
      } catch (e) { }
    }

    // 5. Cloud Firestore REST API — publicly readable if rules allow
    //    Project: newmahagarjana  Collection: news_articles  Document: <articleId>
    if (!title || !img) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const fsRes = await fetch(
          `https://firestore.googleapis.com/v1/projects/newmahagarjana/databases/(default)/documents/news_articles/${stringId}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        if (fsRes.ok) {
          const doc = await fsRes.json();
          const fields = doc.fields || {};
          if (!title && fields.title && fields.title.stringValue) title = fields.title.stringValue;
          if (!desc && fields.desc && fields.desc.stringValue) desc = fields.desc.stringValue;
          if (!img && fields.img && fields.img.stringValue) img = fields.img.stringValue;
        }
      } catch (e) { }
    }
  }

  const isArticleFound = Boolean(title);

  // ── APPLY FALLBACKS ──────────────────────────────────────────────────────
  if (!title) {
    if (id) {
      title = 'बातमी उपलब्ध नाही किंवा हटवण्यात आली आहे';
      desc = 'न्यू महाराष्ट्र गर्जना - ही बातमी सध्या उपलब्ध नाही किंवा हटवण्यात आली आहे. ताज्या घडामोडी वाचण्यासाठी मुख्य पानाला भेट द्या.';
    } else {
      title = 'न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana)';
      desc = 'महाराष्ट्रातील सर्वात विश्वासार्ह मराठी बातम्यांचे डिजिटल वृत्तपत्र. ताज्या घडामोडी सविस्तर वाचा.';
    }
  } else {
    title = cleanText(title);
    desc = cleanText(desc) || 'महाराष्ट्रातील सर्वात विश्वासार्ह मराठी बातम्यांचे डिजिटल वृत्तपत्र.';
  }

  if (desc.length > 240) {
    desc = desc.substring(0, 237).trim() + '...';
  }

  // ── RESOLVE IMAGE URL ────────────────────────────────────────────────────
  img = getArticleShareImage(img, proto, host);
  img = await resolveDirectImageUrl(img); // Follow redirects for crawlers

  // ── BUILD URLS ───────────────────────────────────────────────────────────
  // canonicalUrl: the stable public URL for this article (used in OG tags)
  // targetUrl: where humans are redirected to (the SPA with ?article= param)
  const canonicalUrl = id
    ? `${proto}://${host}/article/${encodeURIComponent(id)}`
    : `${proto}://${host}/`;
  const targetUrl = id
    ? `${proto}://${host}/?article=${encodeURIComponent(id)}`
    : `${proto}://${host}/`;

  // ── IMAGE MIME TYPE ──────────────────────────────────────────────────────
  const lowerImg = img.toLowerCase().split('?')[0];
  const imgType = lowerImg.endsWith('.png') ? 'image/png'
    : lowerImg.endsWith('.webp') ? 'image/webp'
      : lowerImg.endsWith('.gif') ? 'image/gif'
        : 'image/jpeg';

  // ── DATE FOR JSON-LD ─────────────────────────────────────────────────────
  const publishedDate = new Date().toISOString(); // Best available approximation

  // ── HTML RESPONSE ────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="mr" prefix="og: https://ogp.me/ns# article: https://ogp.me/ns/article#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना | New Maharashtra Garjana</title>

  <!-- Primary Meta Tags -->
  <meta name="title" content="${escapeHtml(title)} - न्यू महाराष्ट्र गर्जना">
  <meta name="description" content="${escapeHtml(desc)}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph / Facebook / WhatsApp Preview Tags -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="न्यू महाराष्ट्र गर्जना">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(desc)}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:secure_url" content="${img}">
  <meta property="og:image:type" content="${imgType}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:locale" content="mr_IN">
  <meta property="article:publisher" content="https://www.facebook.com/share/1BwdzGiPf8/">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@newmaharashtragarjana">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(desc)}">
  <meta name="twitter:image" content="${img}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">

  <!-- NewsArticle JSON-LD Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${canonicalUrl}"
    },
    "headline": ${JSON.stringify(title)},
    "description": ${JSON.stringify(desc)},
    "image": ["${img}"],
    "datePublished": "${publishedDate}",
    "dateModified": "${publishedDate}",
    "inLanguage": "mr",
    "author": {
      "@type": "Person",
      "name": "न्यू महाराष्ट्र गर्जना प्रतिनिधी"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "न्यू महाराष्ट्र गर्जना",
      "alternateName": "New Maharashtra Garjana",
      "url": "https://newmaharashtragarjana.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newmaharashtragarjana.com/logo.jpg"
      }
    }
  }
  </script>

  <!-- Instant redirect for browser visitors (crawlers read meta tags above and stop) -->
  <script>
    window.location.replace(${JSON.stringify(targetUrl)});
  </script>
</head>
<body style="margin:0;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0F172A;color:#FFFFFF;text-align:center;">
  <div style="max-width:600px;margin:0 auto;background:#1E293B;padding:30px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    <h2 style="color:#F59E0B;margin-top:0;">न्यू महाराष्ट्र गर्जना</h2>
    <div style="margin:20px 0;border-radius:8px;overflow:hidden;max-height:280px;">
      <img src="${img}" alt="${escapeHtml(title)}" style="width:100%;height:auto;object-fit:cover;display:block;border-radius:8px;">
    </div>
    <h3 style="color:#FFFFFF;font-size:1.1rem;line-height:1.5;margin:15px 0;">${escapeHtml(title)}</h3>
    <p style="color:#CBD5E1;font-size:0.95rem;line-height:1.6;margin:15px 0;">${escapeHtml(desc)}</p>
    <p style="color:#94A3B8;font-size:0.85rem;">बातमी उघडत आहे, कृपया प्रतीक्षा करा...</p>
    <a href="${targetUrl}" style="display:inline-block;margin-top:15px;padding:10px 24px;background:#E11D48;color:#FFFFFF;text-decoration:none;border-radius:6px;font-weight:600;">थेट बातमी उघडा →</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=UTF-8');
  // Cache for 1 hour on CDN, stale-while-revalidate for up to 24 hours
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');

  if (typeof res.status === 'function') {
    res.status(200).send(html);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(html);
  }
};
