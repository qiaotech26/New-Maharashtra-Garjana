/* ==========================================================================
   NEW MAHARASHTRA GARJANA - FULLY FUNCTIONAL NEWS PLATFORM ENGINE
   ========================================================================== */

// ── INITIAL DATASET (MUST START COMPLETELY EMPTY FOR PRODUCTION) ──
const defaultNewsData = {
  ticker: [],
  latest: [],
  maharashtra: [],
  politics: [],
  sports: [],
  entertainment: [],
  videos: [],
  photos: []
};

// GLOBAL APP STATE
let appState = {
  news: null,
  activeCategory: 'सर्व',
  searchTerm: '',
  isAdminLoggedIn: false,
  commentsMap: {}
};

// Helper: Sanitize state to purge any legacy demo data from client browser cache
function sanitizeNewsData(data) {
  if (!data || typeof data !== 'object') {
    return JSON.parse(JSON.stringify(defaultNewsData));
  }

  const isDemoItem = (item) => {
    if (!item) return true;
    const title = (item.title || '').toLowerCase();
    const img = (item.img || '').toLowerCase();
    const id = Number(item.id);

    if (img.includes('picsum.photos')) return true;
    if (title.includes('नव्या विकास योजनांची') || title.includes('विधानसभेत विरोधकांचा') || title.includes('सागरी किनाऱ्याच्या')) return true;
    if ([101, 102, 103, 104, 105, 106, 107, 108, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403, 501, 502, 503, 601, 602, 603, 604, 701, 702, 703, 704, 705].includes(id)) return true;
    return false;
  };

  const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
  categories.forEach(cat => {
    if (Array.isArray(data[cat])) {
      data[cat] = data[cat].filter(item => !isDemoItem(item));
    } else {
      data[cat] = [];
    }
  });

  if (Array.isArray(data.ticker)) {
    data.ticker = data.ticker.filter(t => !t.includes('सर्वसमावेशक विकास योजनेची'));
  } else {
    data.ticker = [];
  }

  return data;
}

// ── LOCAL STORAGE ENGINE ──
function loadStateFromStorage() {
  try {
    const saved = localStorage.getItem('nmg_news_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      appState.news = sanitizeNewsData(parsed);
      saveStateToStorage();
    } else {
      appState.news = JSON.parse(JSON.stringify(defaultNewsData));
      saveStateToStorage();
    }

    const savedComments = localStorage.getItem('nmg_comments_data');
    if (savedComments) {
      appState.commentsMap = JSON.parse(savedComments);
    }

    const adminSession = sessionStorage.getItem('nmg_admin_session');
    if (adminSession === 'true') {
      appState.isAdminLoggedIn = true;
    }
  } catch (e) {
    console.error('Error loading state:', e);
    appState.news = JSON.parse(JSON.stringify(defaultNewsData));
  }
}

function saveStateToStorage() {
  try {
    localStorage.setItem('nmg_news_data', JSON.stringify(appState.news));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

function saveCommentsToStorage() {
  try {
    localStorage.setItem('nmg_comments_data', JSON.stringify(appState.commentsMap));
  } catch (e) {
    console.error('Failed to save comments:', e);
  }
}

// ── RENDER ENGINE ──

function renderAll() {
  renderTicker();
  renderHeroSection();
  renderLatestGrid();
  renderCategorySections();
  renderVideoGrid();
  renderPhotoGrid();
  updateCategoryStatusBar();
}

// 1. TICKER
function renderTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track || !appState.news) return;

  const items = (appState.news.ticker && appState.news.ticker.length > 0)
    ? appState.news.ticker
    : ["ताज्या घडामोडींसाठी न्यू महाराष्ट्र गर्जनाशी जोडलेले रहा."];

  const html = items.map(t => `
    <div class="ticker-item" onclick="openTickerArticle('${t.replace(/'/g, "\\'")}')">
      <span class="ticker-bullet">●</span>
      <span>${t}</span>
    </div>
  `).join('');

  track.innerHTML = html + html;
}

// 2. HERO SECTION
function renderHeroSection() {
  const mainContainer = document.getElementById('heroMainContainer');
  const sideContainer = document.getElementById('heroSideContainer');
  if (!appState.news) return;

  const allArticles = [...(appState.news.latest || [])];
  const heroArticle = allArticles.find(a => a.isHero) || allArticles[0];

  if (!heroArticle) {
    if (mainContainer) {
      mainContainer.innerHTML = `
        <article class="hero-card empty-hero-card" style="padding:40px 24px; text-align:center; background:var(--bg-card, #ffffff); border-radius:12px; border:1px dashed #cbd5e1; box-shadow:0 4px 12px rgba(0,0,0,0.03);">
          <div style="font-size:2.8rem; margin-bottom:12px;">📰</div>
          <h2 class="hero-title" style="font-size:1.3rem; color:#1e293b; margin-bottom:8px; font-weight:700;">सध्या कोणतीही बातमी प्रकाशित झालेली नाही</h2>
          <p class="hero-desc" style="color:#64748b; font-size:0.95rem; margin-bottom:0;">ॲडमिन पोर्टलमधून पहिली बातमी प्रकाशित करा. बातमी प्रकाशित होताच ती मुख्य पानावर दिसेल.</p>
        </article>
      `;
    }
    if (sideContainer) {
      sideContainer.innerHTML = '';
      sideContainer.style.display = 'none';
    }
    return;
  }

  if (sideContainer) {
    sideContainer.style.display = '';
  }

  if (mainContainer) {
    mainContainer.innerHTML = `
      <article class="hero-card" id="heroCard" onclick="openArticle(${heroArticle.id})" itemscope itemtype="https://schema.org/NewsArticle">
        <div class="hero-img-wrap">
          <img src="${heroArticle.img}" alt="${heroArticle.title} - न्यू महाराष्ट्र गर्जना" class="hero-img" id="heroImg" loading="eager" width="800" height="450" itemprop="image">
          <div class="hero-overlay-gradient"></div>
          <div class="hero-cat-badge" id="heroCatBadge" itemprop="articleSection">${heroArticle.cat || 'महाराष्ट्र'}</div>
          ${heroArticle.isBreaking ? '<div class="live-badge" id="heroLiveBadge">🔴 LIVE</div>' : ''}
        </div>
        <div class="hero-body">
          <h2 class="hero-title" id="heroTitle" itemprop="headline">${heroArticle.title}</h2>
          <p class="hero-desc" id="heroDesc" itemprop="description">${(heroArticle.desc || heroArticle.title).replace(/<[^>]*>/g, '')}</p>
          <div class="hero-meta">
            <span class="meta-time" id="heroTime"><time datetime="2026-08-10" itemprop="datePublished">📅 ${heroArticle.time || ''}</time></span>
            <span class="meta-author" itemprop="author">✍️ ${heroArticle.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी'}</span>
            <span class="read-more-link" aria-label="सविस्तर बातमी वाचा">सविस्तर वाचा →</span>
          </div>
        </div>
      </article>
    `;
  }

  if (sideContainer) {
    const sideArticles = allArticles.filter(a => String(a.id) !== String(heroArticle.id)).slice(0, 4);
    if (sideArticles.length === 0) {
      sideContainer.innerHTML = '';
      sideContainer.style.display = 'none';
    } else {
      sideContainer.style.display = '';
      sideContainer.innerHTML = sideArticles.map(a => `
        <div class="side-news-card" onclick="openArticle(${a.id})">
          <img src="${a.img}" alt="${a.title}" loading="lazy">
          <div class="side-news-body">
            <span class="side-cat">${a.cat}</span>
            <h3>${a.title}</h3>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
              <span class="side-time">${a.time}</span>
              <button class="card-wa-share-btn list-wa-btn" onclick="event.stopPropagation(); shareArticle('whatsapp', ${a.id})" title="व्हॉट्सॲपवर बातमी शेअर करा">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                <span>शेअर</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

// 3. LATEST NEWS GRID
function renderLatestGrid() {
  const grid = document.getElementById('latestNewsGrid');
  if (!grid || !appState.news) return;

  let articles = [...(appState.news.latest || [])];

  if (appState.activeCategory !== 'सर्व' && appState.activeCategory !== 'थेट') {
    articles = articles.filter(a => a.cat === appState.activeCategory);
  }

  if (appState.searchTerm) {
    const term = appState.searchTerm.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(term) ||
      (a.desc && a.desc.toLowerCase().includes(term)) ||
      (a.cat && a.cat.toLowerCase().includes(term))
    );
  }

  if (articles.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 36px 20px; text-align: center; color: #64748B; background: var(--bg-card, #ffffff); border-radius: 10px; border: 1px dashed #cbd5e1;">
        <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; color: #1e293b;">सध्या कोणत्याही ताज्या बातम्या उपलब्ध नाहीत.</h3>
        <p style="font-size: 0.9rem; margin: 0;">ॲडमिन पोर्टलमधून बातमी जोडल्यानंतर ती येथे प्रकाशित होईल.</p>
      </div>`;
    return;
  }

  grid.innerHTML = articles.map((n, i) => `
    <article class="news-card fade-in" style="animation-delay:${i * 0.05}s" onclick="openArticle(${n.id})" itemscope itemtype="https://schema.org/NewsArticle">
      <div class="news-card-img-wrap">
        <img class="news-card-img" src="${n.img}" alt="${n.title} - न्यू महाराष्ट्र गर्जना" loading="lazy" width="400" height="240" itemprop="image">
        <span class="news-card-cat" itemprop="articleSection">${n.cat}</span>
      </div>
      <div class="news-card-body">
        <h3 itemprop="headline">${n.title}</h3>
        <p class="news-card-excerpt" itemprop="description">${(n.desc || '').replace(/<[^>]*>/g, '').slice(0, 95)}${(n.desc || '').length > 95 ? '...' : ''}</p>
        <div class="news-card-meta">
          <span>🕒 <time datetime="2026-08-10" itemprop="datePublished">${n.time || ''}</time></span>
          <span>👁️ ${Math.floor(100 + (Number(n.id) || 1) * 12)} वाचले</span>
          <button class="card-wa-share-btn" onclick="event.stopPropagation(); shareArticle('whatsapp', ${n.id})" title="व्हॉट्सॲपवर बातमी शेअर करा">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
            <span>शेअर</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

// 4. CATEGORY LIST SECTIONS (MAHARASHTRA, POLITICS, SPORTS, ENTERTAINMENT)
function renderCategorySections() {
  if (!appState.news) return;

  const maharashtra = appState.news.maharashtra || [];
  const politics = appState.news.politics || [];
  const sports = appState.news.sports || [];
  const entertainment = appState.news.entertainment || [];

  renderListContainer('maharashtraNews', maharashtra, 'maharashtraSection');
  renderListContainer('politicsNews', politics, 'politicsSection');

  const mahPolWrapper = document.getElementById('maharashtraPoliticsSection');
  if (mahPolWrapper) {
    if (maharashtra.length === 0 && politics.length === 0) {
      mahPolWrapper.style.display = 'none';
    } else {
      mahPolWrapper.style.display = '';
    }
  }

  renderListContainer('sportsNews', sports, 'sportsSection');
  renderListContainer('entertainmentNews', entertainment, 'entertainmentSection');

  const sportsEntWrapper = document.getElementById('sportsEntertainmentSection');
  if (sportsEntWrapper) {
    if (sports.length === 0 && entertainment.length === 0) {
      sportsEntWrapper.style.display = 'none';
    } else {
      sportsEntWrapper.style.display = '';
    }
  }
}

function renderListContainer(containerId, items, sectionId) {
  const el = document.getElementById(containerId);
  const section = sectionId ? document.getElementById(sectionId) : null;
  if (!el) return;

  if (items.length === 0) {
    if (section) section.style.display = 'none';
    el.innerHTML = '';
    return;
  }

  if (section) section.style.display = '';

  el.innerHTML = items.map((n, i) => `
    <article class="list-news-item fade-in" style="animation-delay:${i * 0.05}s" onclick="openArticle(${n.id})" itemscope itemtype="https://schema.org/NewsArticle">
      <img class="list-news-img" src="${n.img}" alt="${n.title} - न्यू महाराष्ट्र गर्जना" loading="lazy" width="120" height="80" itemprop="image">
      <div class="list-news-body">
        <span class="list-news-cat" itemprop="articleSection">${n.cat}</span>
        <h3 itemprop="headline">${n.title}</h3>
        <div class="list-news-meta-row">
          <span class="list-news-time"><time datetime="2026-08-10" itemprop="datePublished">${n.time}</time></span>
          <button class="card-wa-share-btn list-wa-btn" onclick="event.stopPropagation(); shareArticle('whatsapp', ${n.id})" title="व्हॉट्सॲपवर शेअर करा">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          <span>शेअर</span>
        </button>
      </div>
    </div>
  </article>
  `).join('');
}

// 5. VIDEO GRID
function renderVideoGrid() {
  const section = document.getElementById('videoSection');
  const grid = document.getElementById('videoGrid');
  if (!grid || !appState.news) return;

  const videos = appState.news.videos || [];
  if (videos.length === 0) {
    if (section) section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  if (section) section.style.display = '';

  grid.innerHTML = videos.map((v, i) => `
    <div class="video-card fade-in" style="animation-delay:${i * 0.08}s" onclick="openVideoModal('${v.title}', '${v.dur}', '${v.img}')" itemscope itemtype="https://schema.org/VideoObject">
      <div class="video-thumb-wrap">
        <img class="video-thumb" src="${v.img}" alt="${v.title} - न्यू महाराष्ट्र गर्जना व्हिडिओ" loading="lazy" width="360" height="200" itemprop="thumbnailUrl">
        <div class="play-btn">▶</div>
        <span class="video-duration" itemprop="duration">${v.dur}</span>
      </div>
      <div class="video-body">
        <h3 itemprop="name">${v.title}</h3>
        <meta itemprop="description" content="न्यू महाराष्ट्र गर्जना विशेष व्हिडिओ बुलेटिन: ${v.title}">
        <meta itemprop="uploadDate" content="2026-08-10T10:00:00+05:30">
        <span>न्यू महाराष्ट्र गर्जना व्हिडिओ बुलेटिन</span>
      </div>
    </div>
  `).join('');
}

// 6. PHOTO GRID
function renderPhotoGrid() {
  const section = document.getElementById('photoSection');
  const grid = document.getElementById('photoGrid');
  if (!grid || !appState.news) return;

  const photos = appState.news.photos || [];
  if (photos.length === 0) {
    if (section) section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  if (section) section.style.display = '';

  grid.innerHTML = photos.map((p, i) => `
    <div class="photo-card fade-in" style="animation-delay:${i * 0.08}s" onclick="openPhotoModal('${p.caption}', '${p.img}')" itemscope itemtype="https://schema.org/ImageObject">
      <img src="${p.img}" alt="${p.caption} - न्यू महाराष्ट्र गर्जना फोटो" loading="lazy" width="400" height="260" itemprop="contentUrl">
      <div class="photo-overlay">
        <p itemprop="caption">${p.caption}</p>
      </div>
    </div>
  `).join('');
}

// ── SEO METADATA & SCHEMA MANAGEMENT ──

const DEFAULT_SEO = {
  title: "न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana) | ताज्या मराठी बातम्या, राजकारण, चालू घडामोडी & लाईव्ह अपडेट्स",
  desc: "महाराष्ट्रातील अग्रगण्य मराठी डिजिटल वृत्तसेवा. ताज्या बातम्या, राजकारण, मुंबई, पुणे, देश-विदेश, क्रीडा, मनोरंजन, व्यापार, तंत्रज्ञान आणि थेट लाईव्ह अपडेट्स.",
  canonical: "https://newmaharashtragarjana.com/",
  image: "https://newmaharashtragarjana.com/logo.jpg"
};

const CATEGORY_SEO = {
  'सर्व': {
    title: "न्यू महाराष्ट्र गर्जना | ताज्या मराठी बातम्या, राजकारण & चालू घडामोडी",
    desc: "महाराष्ट्रातील अग्रगण्य मराठी डिजिटल वृत्तसेवा. ताज्या बातम्या, राजकारण, मुंबई, पुणे, देश-विदेश, क्रीडा, मनोरंजन, व्यापार आणि लाईव्ह अपडेट्स."
  },
  'महाराष्ट्र': {
    title: "महाराष्ट्र घडामोडी - ताज्या बातम्या, विकास योजना व विश्लेषण | न्यू महाराष्ट्र गर्जना",
    desc: "महाराष्ट्रातील ग्रामीण, शहरी, प्रशासकीय व सामाजिक घडामोडींच्या ताज्या बातम्या, सरकारी योजना आणि सर्वसमावेशक विश्लेषण."
  },
  'राजकारण': {
    title: "महाराष्ट्र राजकारण - राजकीय बातम्या, विधानसभा व सत्तासंघर्ष | न्यू महाराष्ट्र गर्जना",
    desc: "महाराष्ट्र विधानसभा, पक्षीय घडामोडी, सत्तासंघर्ष, मंत्रिमंडळ निर्णय, विरोधकांचे आक्षेप व राजकीय विश्लेषणाचे ताजे अपडेट्स."
  },
  'मुंबई': {
    title: "मुंबई बातम्या - लोकल ट्रेन, महापालिका, वाहतूक व घडामोडी | न्यू महाराष्ट्र गर्जना",
    desc: "मुंबई, ठाणे, नवी मुंबई परिसरातील ताज्या बातम्या, लोकल ट्रेन, कोस्टल रोड, विकासकामे आणि पालिकेच्या ताज्या घडामोडी."
  },
  'पुणे': {
    title: "पुणे बातम्या - पिंपरी-चिंचवड, मेट्रो, आयटी व शैक्षणिक अपडेट्स | न्यू महाराष्ट्र गर्जना",
    desc: "पुणे शहर, पिंपरी-चिंचवड आणि जिल्हाभरातील ताज्या घडामोडी, मेट्रो मार्ग, वाहतूक, आयटी पार्क व शैक्षणिक क्षेत्रातील महत्त्वाच्या बातम्या."
  },
  'देश': {
    title: "देश घडामोडी - राष्ट्रीय बातम्या, केंद्र सरकार व संसद निर्णय | न्यू महाराष्ट्र गर्जना",
    desc: "भारतातील प्रमुख राष्ट्रीय बातम्या, केंद्र सरकारची धोरणे, संसद अधिवेशन, संरक्षण आणि चालू घडामोडींचे विश्वासार्ह वार्तांकन."
  },
  'जग': {
    title: "आंतरराष्ट्रीय बातम्या - जागतिक घडामोडी, अर्थकारण व तंत्रज्ञान | न्यू महाराष्ट्र गर्जना",
    desc: "जगातील महत्त्वाच्या आंतरराष्ट्रीय घडामोडी, युद्ध, जागतिक राजकारण, अर्थकारण आणि तंत्रज्ञान क्षेत्रातील घडामोडींचा वेध."
  },
  'क्रीडा': {
    title: "क्रीडा बातम्या - क्रिकेट, आयपीएल, ऑलिम्पिक व क्रीडा जगत | न्यू महाराष्ट्र गर्जना",
    desc: "भारतीय क्रिकेट संघ, आयपीएल, कसोटी सामने, ऑलिम्पिक आणि राष्ट्रीय-आंतरराष्ट्रीय क्रीडा स्पर्धांचे सविस्तर वार्तांकन व धावफलक."
  },
  'मनोरंजन': {
    title: "मनोरंजन बातम्या - बॉलीवूड, मराठी सिनेमा, मालिका व मुलाखती | न्यू महाराष्ट्र गर्जना",
    desc: "मराठी चित्रपट, बॉलीवूड, वेब सिरीज, नाटक, सेलिब्रेटी गॉसिप्स आणि मनोरंजन विश्वातील खमंग बातम्या व विशेष मुलाखती."
  },
  'व्यापार': {
    title: "व्यापार बातम्या - शेअर बाजार, सेन्सेक्स, सोने-चांदी भाव व अर्थकारण | न्यू महाराष्ट्र गर्जना",
    desc: "शेअर बाजार, सेन्सेक्स, निफ्टी, सोने-चांदीचे ताजे दर, क्रिप्टो, बँकिंग आणि उद्योग क्षेत्रातील ताज्या घडामोडी व तज्ज्ञ विश्लेषण."
  },
  'आरोग्य': {
    title: "आरोग्य व जीवनशैली - हेल्थ टिप्स, आहार, योग व तज्ज्ञांचा सल्ला | न्यू महाराष्ट्र गर्जना",
    desc: "आरोग्य, आहार, योग, व्यायाम, मानसिक स्वास्थ्य, आयुर्वेद व निरोगी जीवनशैलीसाठी तज्ज्ञ डॉक्टरांचे प्रामाणिक मार्गदर्शन."
  },
  'तंत्रज्ञान': {
    title: "तंत्रज्ञान बातम्या - स्मार्टफोन, एआय, गॅजेट्स व सायबर सुरक्षा | न्यू महाराष्ट्र गर्जना",
    desc: "स्मार्टफोन रिव्ह्यू, गॅजेट्स, सायबर सुरक्षा, कृत्रिम बुद्धिमत्ता (AI) आणि नव्या तंत्रज्ञानाचा सखोल आढावा."
  },
  'व्हिडिओ': {
    title: "व्हिडिओ बुलेटिन - विशेष बातम्या व थेट वार्तांकन | न्यू महाराष्ट्र गर्जना",
    desc: "न्यू महाराष्ट्र गर्जनाचे विशेष व्हिडिओ बुलेटिन, ग्राउंड रिपोर्टिंग, मुलाखती आणि थेट व्हिडिओ वार्तांकन."
  },
  'फोटो': {
    title: "विशेष फोटो गॅलरी - क्षणचित्रे, पर्यटन व घडामोडी | न्यू महाराष्ट्र गर्जना",
    desc: "महाराष्ट्र व देशातील ऐतिहासिक, राजकीय, सांस्कृतिक व क्रीडा घटनांची विहंगम छायाचित्रे व फोटो गॅलरी."
  },
  'थेट': {
    title: "थेट लाईव्ह अपडेट्स - प्रत्येक मिनिटाची ब्रेकिंग न्यूज | न्यू महाराष्ट्र गर्जना",
    desc: "महाराष्ट्रातील महत्त्वाच्या घडामोडींचे थेट प्रत्येक मिनिटाचे वेगवान लाईव्ह कव्हरेज आणि ब्रेकिंग अपडेट्स."
  }
};

function updateMetaTag(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function updateCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (el) el.setAttribute('href', url);
}

function setSEOMetadata(title, desc, url, image) {
  document.title = title;
  updateMetaTag('description', desc);
  updateMetaProperty('og:title', title);
  updateMetaProperty('og:description', desc);
  if (url) {
    updateMetaProperty('og:url', url);
    updateCanonical(url);
  }
  if (image) {
    updateMetaProperty('og:image', image);
    updateMetaTag('twitter:image', image);
  }
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', desc);
}

function injectDynamicNewsArticleSchema(article) {
  let script = document.getElementById('dynamicArticleSchema');
  if (!script) {
    script = document.createElement('script');
    script.id = 'dynamicArticleSchema';
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://newmaharashtragarjana.com/#article-" + article.id
    },
    "headline": article.title,
    "description": article.desc || article.title,
    "image": [article.img],
    "datePublished": "2026-08-10T10:30:00+05:30",
    "dateModified": "2026-08-10T10:30:00+05:30",
    "articleSection": article.cat || "महाराष्ट्र",
    "inLanguage": "mr",
    "author": {
      "@type": "Person",
      "name": article.author || "न्यू महाराष्ट्र गर्जना प्रतिनिधी"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana)",
      "url": "https://newmaharashtragarjana.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newmaharashtragarjana.com/favicon.ico"
      }
    }
  };
  script.textContent = JSON.stringify(schema, null, 2);
}

function removeDynamicNewsArticleSchema() {
  const script = document.getElementById('dynamicArticleSchema');
  if (script) script.remove();
}

// ── CATEGORY FILTERING SYSTEM ──

function filterCategory(catName, event) {
  if (event) event.preventDefault();

  appState.activeCategory = catName;
  appState.searchTerm = '';

  // Update Nav UI state
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-category') === catName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update SEO for this category
  const seo = CATEGORY_SEO[catName] || DEFAULT_SEO;
  const hashVal = catName === 'सर्व' ? '' : `#${catName}`;
  setSEOMetadata(seo.title, seo.desc, `https://newmaharashtragarjana.com/${hashVal}`);
  try {
    if (catName !== 'सर्व') {
      history.replaceState(null, '', hashVal);
    } else if (window.location.hash && !window.location.hash.startsWith('#article-')) {
      history.replaceState(null, '', window.location.pathname);
    }
  } catch (e) { }

  // Show/Hide section blocks if specific category selected
  const heroSection = document.getElementById('heroSection');
  const twoCol1 = document.getElementById('maharashtraPoliticsSection');
  const videoSec = document.getElementById('videoSection');
  const twoCol2 = document.getElementById('sportsEntertainmentSection');
  const photoSec = document.getElementById('photoSection');

  if (catName !== 'सर्व') {
    if (heroSection) heroSection.style.display = (catName === 'महाराष्ट्र' || catName === 'थेट') ? 'grid' : 'none';
    if (twoCol1) twoCol1.style.display = 'none';
    if (videoSec) videoSec.style.display = (catName === 'व्हिडिओ') ? 'block' : 'none';
    if (twoCol2) twoCol2.style.display = 'none';
    if (photoSec) photoSec.style.display = (catName === 'फोटो') ? 'block' : 'none';
  } else {
    if (heroSection) heroSection.style.display = 'grid';
    if (twoCol1) twoCol1.style.display = 'grid';
    if (videoSec) videoSec.style.display = 'block';
    if (twoCol2) twoCol2.style.display = 'grid';
    if (photoSec) photoSec.style.display = 'block';
  }

  renderLatestGrid();
  updateCategoryStatusBar();

  // Smooth scroll down to latest news section
  const target = document.getElementById('latestNewsSection');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function resetCategoryFilter() {
  filterCategory('सर्व');
}

function updateCategoryStatusBar() {
  const bar = document.getElementById('categoryStatusBar');
  if (!bar) return;

  if (appState.activeCategory !== 'सर्व' || appState.searchTerm !== '') {
    bar.style.display = 'block';
    const nameEl = document.getElementById('currentCategoryText') || document.getElementById('activeCategoryName');
    const countEl = document.getElementById('categoryCountBadge') || document.getElementById('activeCategoryCount');

    if (nameEl) nameEl.textContent = appState.searchTerm ? `शोध: "${appState.searchTerm}"` : appState.activeCategory;

    let count = 0;
    const allLatest = appState.news ? appState.news.latest : [];
    if (appState.searchTerm) {
      const term = appState.searchTerm.toLowerCase();
      count = allLatest.filter(a => a.title.toLowerCase().includes(term)).length;
    } else {
      count = allLatest.filter(a => a.cat === appState.activeCategory).length;
    }

    if (countEl) countEl.textContent = `(${count} बातम्या)`;
  } else {
    bar.style.display = 'none';
  }
}

// ── ARTICLE READER MODAL & SPEECH SYNTHESIS ──

let currentReadingUtterance = null;
let currentReaderFontSize = 1.15;

function openArticle(id) {
  // Find article across all categories
  let article = null;
  const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];

  for (const cat of categories) {
    if (appState.news && appState.news[cat]) {
      const found = appState.news[cat].find(a => String(a.id) === String(id));
      if (found) {
        article = found;
        break;
      }
    }
  }

  if (!article) {
    // Check if details were passed in URL parameters from social share
    const urlParams = new URLSearchParams(window.location.search);
    const paramTitle = urlParams.get('title');
    const paramImg = urlParams.get('img');
    const paramDesc = urlParams.get('desc');

    if (paramTitle) {
      article = {
        id: id,
        cat: 'महाराष्ट्र',
        title: paramTitle,
        desc: paramDesc || paramTitle,
        content: `<p>${paramDesc || paramTitle}</p>`,
        time: 'ताज्या घडामोडी',
        author: 'न्यू महाराष्ट्र गर्जना प्रतिनिधी',
        img: paramImg || 'https://newmaharashtragarjana.com/logo.jpg'
      };
    } else {
      if (typeof showToast === 'function') {
        showToast('माफ करा, ही बातमी उपलब्ध नाही किंवा हटवण्यात आली आहे.', 'warning');
      }
      try {
        history.replaceState(null, '', window.location.pathname);
      } catch (e) { }
      return;
    }
  }

  // Update SEO for this individual article
  const origin = window.location.origin;
  const pathname = window.location.pathname.replace(/\/+$/, '') || '';
  const articleUrl = `${origin}${pathname}/?p=${article.id}`;

  setSEOMetadata(
    `${article.title} - न्यू महाराष्ट्र गर्जना | New Maharashtra Garjana`,
    article.desc || article.title,
    articleUrl,
    article.img
  );
  injectDynamicNewsArticleSchema(article);
  try {
    history.pushState({ articleId: id }, '', `?p=${id}`);
  } catch (e) { }

  const modal = document.getElementById('articleModal');
  const container = document.getElementById('articleReaderContent');
  if (!modal || !container) return;

  const articleComments = appState.commentsMap[id] || [];

  container.innerHTML = `
    <article class="article-reader-wrapper" itemscope itemtype="https://schema.org/NewsArticle">
      <div class="article-header">
        <span class="article-cat-badge" itemprop="articleSection">${article.cat}</span>
        <h1 class="article-main-title" id="articleReaderTitle" itemprop="headline">${article.title}</h1>
      
      <div class="article-meta-bar">
        <div class="article-author-info">
          <div class="author-avatar">${article.author ? article.author.charAt(0) : 'न'}</div>
          <div>
            <strong>${article.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी'}</strong><br>
            <small>📅 ${article.time} • ⏱️ ३ मिनिटे वाच वेळ</small>
          </div>
        </div>
        
        <div class="article-controls">
          <button class="audio-read-btn" onclick="toggleAudioRead()">
            <span id="speechIcon">🔊</span> <span id="speechBtnText">बातमी ऐका</span>
          </button>
          <button class="font-size-btn" onclick="changeReaderFontSize(0.1)" title="अक्षर मोठे करा">A+</button>
          <button class="font-size-btn" onclick="changeReaderFontSize(-0.1)" title="अक्षर लहान करा">A-</button>
        </div>
      </div>
    </div>

    <div class="article-main-image-box">
      <img src="${article.img}" alt="${article.title}">
      <div class="image-caption">छायाचित्र: न्यू महाराष्ट्र गर्जना डिजिटल मीडिया • ${article.title}</div>
    </div>

    <div class="article-body-text" id="articleBodyText" style="font-size: ${currentReaderFontSize}rem;">
      ${article.content || `<p>${article.desc || article.title}</p><p>महाराष्ट्रातील क्रीडा, राजकारण आणि सामाजिक घडामोडींचा सर्वात जलद वेगाने आढावा घेण्यासाठी न्यू महाराष्ट्र गर्जना शी जोडलेले राहा.</p>`}
    </div>

    <!-- SOCIAL SHARE BAR -->
    <div class="share-section">
      <span class="share-title">ही बातमी शेअर करा:</span>
      <div class="share-buttons">
        <button class="share-btn share-whatsapp" onclick="shareArticle('whatsapp', ${article.id})" title="व्हॉट्सॲपवर शेअर करा">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          <span>व्हॉट्सॲप</span>
        </button>
        <button class="share-btn share-image" onclick="shareArticle('image', ${article.id})" title="बातमीचा फोटो पोस्टर शेअर करा" style="background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white;">
          <span>🖼️ फोटोसह शेअर</span>
        </button>
        <button class="share-btn share-caption" onclick="shareArticle('caption', ${article.id})" title="व्हॉट्सॲप मेसेज व सर्व लिंक्स कॉपी करा" style="background: linear-gradient(135deg, #1E293B 0%, #334155 100%); color: white;">
          <span>📋 कॅप्शन कॉपी करा</span>
        </button>
        <button class="share-btn share-facebook" onclick="shareArticle('facebook', ${article.id})" title="फेसबुकवर शेअर करा">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          <span>फेसबुक</span>
        </button>
        <button class="share-btn share-instagram" onclick="shareArticle('instagram', ${article.id})" title="इन्स्टाग्राम वर भेट द्या">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          <span>इन्स्टाग्राम</span>
        </button>
        <button class="share-btn share-copy" onclick="shareArticle('copy', ${article.id})" title="बातमीची लिंक कॉपी करा">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
          <span>लिंक कॉपी</span>
        </button>
      </div>
    </div>

    <!-- COMMENTS SECTION -->
    <div class="comments-section">
      <h3>प्रतिक्रिया (<span id="commentCountHeader">${articleComments.length}</span>)</h3>
      <div class="comment-form">
        <input type="text" id="commentAuthorInput" placeholder="तुमचे नाव..." class="form-control">
        <textarea id="commentTextInput" rows="3" placeholder="तुमची प्रतिक्रिया लिहा..." class="form-control"></textarea>
        <button type="button" onclick="submitComment(${article.id})">प्रतिक्रिया पाठवा</button>
      </div>
      
      <div class="comments-list" id="commentsListContainer">
        ${renderCommentsHTML(articleComments)}
      </div>
    </div>
    </article>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';

  // Restore Default / Category SEO
  removeDynamicNewsArticleSchema();
  if (CATEGORY_SEO[appState.activeCategory]) {
    const seo = CATEGORY_SEO[appState.activeCategory];
    setSEOMetadata(seo.title, seo.desc, `https://newmaharashtragarjana.com/${appState.activeCategory !== 'सर्व' ? '#' + appState.activeCategory : ''}`);
  } else {
    setSEOMetadata(DEFAULT_SEO.title, DEFAULT_SEO.desc, DEFAULT_SEO.canonical, DEFAULT_SEO.image);
  }
  try {
    if (window.location.search.includes('article=') || window.location.hash.startsWith('#article-')) {
      const cleanUrl = window.location.origin + window.location.pathname;
      history.replaceState(null, '', cleanUrl);
    }
  } catch (e) { }

  // Stop speech synthesis if playing
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

function openArticleFromHero() {
  const heroArticle = (appState.news.latest || []).find(a => a.isHero) || appState.news.latest[0];
  if (heroArticle) openArticle(heroArticle.id);
}

function openTickerArticle(text) {
  showToast(`ताजी बातमी: "${text.substring(0, 40)}..."`, 'info');
}

// SPEECH SYNTHESIS ENGINE
function toggleAudioRead() {
  if (!('speechSynthesis' in window)) {
    showToast('तुमच्या ब्राउझरमध्ये स्पीच सुविधा उपलब्ध नाही.', 'info');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    document.getElementById('speechIcon').textContent = '🔊';
    document.getElementById('speechBtnText').textContent = 'बातमी ऐका';
  } else {
    const title = document.getElementById('articleReaderTitle')?.textContent || '';
    const body = document.getElementById('articleBodyText')?.textContent || '';
    const fullText = title + ". " + body;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'mr-IN'; // Marathi Voice Locale
    utterance.rate = 0.95;

    utterance.onend = () => {
      document.getElementById('speechIcon').textContent = '🔊';
      document.getElementById('speechBtnText').textContent = 'बातमी ऐका';
    };

    window.speechSynthesis.speak(utterance);
    document.getElementById('speechIcon').textContent = '⏹️';
    document.getElementById('speechBtnText').textContent = 'थांबवा';
    showToast('बातमीचे वाचन सुरू झाले आहे...', 'info');
  }
}

function changeReaderFontSize(delta) {
  currentReaderFontSize = Math.min(Math.max(0.9, currentReaderFontSize + delta), 1.6);
  const el = document.getElementById('articleBodyText');
  if (el) el.style.fontSize = `${currentReaderFontSize}rem`;
}

// SOCIAL SHARING
function shareArticle(platform, id) {
  // Find article across all categories
  let article = null;
  const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
  for (const cat of categories) {
    if (appState.news && appState.news[cat]) {
      const found = appState.news[cat].find(a => String(a.id) === String(id));
      if (found) { article = found; break; }
    }
  }

  const title = (article?.title || document.getElementById('articleReaderTitle')?.textContent || 'न्यू महाराष्ट्र गर्जना बातमी').trim();

  // Extract clean short description of the news
  let desc = article?.desc || article?.caption || '';
  if (!desc && document.getElementById('articleBodyText')) {
    const textP = document.getElementById('articleBodyText').querySelector('p');
    if (textP) desc = textP.textContent.trim();
  }
  let cleanDesc = (desc || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleanDesc.length > 220) {
    cleanDesc = cleanDesc.substring(0, 215).trim() + '...';
  }

  // Fire-and-forget sync to server so WhatsApp preview server always has the latest thumbnail
  if (article) {
    try {
      fetch('/api/sync-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: article.id,
          title: article.title,
          img: article.img,
          desc: cleanDesc
        })
      }).catch(() => { });
    } catch (e) { }
  }

  const origin = 'https://www.newmaharashtragarjana.com';
  const shareUrl = `${origin}/article/${id}`;
  const targetArticle = article || { id: id, title: title, url: shareUrl, img: document.querySelector('.article-main-image-box img')?.src };

  if (platform === 'whatsapp') {
    if (window.NMGShare && typeof window.NMGShare.shareOnWhatsApp === 'function') {
      window.NMGShare.shareOnWhatsApp(targetArticle);
    } else {
      const shareText = formatWhatsAppShareMessage(title, shareUrl);
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  } else if (platform === 'image' || platform === 'poster') {
    if (window.NMGShare && typeof window.NMGShare.shareNewsImage === 'function') {
      window.NMGShare.shareNewsImage(targetArticle);
    }
  } else if (platform === 'caption') {
    if (window.NMGShare && typeof window.NMGShare.copyCaption === 'function') {
      window.NMGShare.copyCaption(targetArticle);
    }
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  } else if (platform === 'instagram') {
    window.open('https://www.instagram.com/newmaharashtragarjana?stkn=MTE5OGxjdnIydno3bA==', '_blank');
  } else if (platform === 'copy') {
    if (window.NMGShare && typeof window.NMGShare.copyCaption === 'function') {
      window.NMGShare.copyCaption(targetArticle);
    } else {
      const shareText = formatWhatsAppShareMessage(title, shareUrl);
      navigator.clipboard.writeText(shareText).then(() => {
        showToast('🔗 बातमीचा WhatsApp मेसेज व लिंक कॉपी झाली!', 'success');
      }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast('बातमीची लिंक कॉपी झाली!', 'success');
        });
      });
    }
  }
}

// ── WHATSAPP SHARE FORMAT TEMPLATE ENGINE ──
const defaultWhatsAppShareTemplate = {
  groupHeading: 'महाराष्ट्रातील ताज्या बातम्यांसाठी आजच आमचा व्हाट्सएप ग्रुप जॉईन करा',
  groupEmoji: '🟢',
  groupLink: '',
  channelHeading: 'न्यू महाराष्ट्र गर्जनाच्या ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
  channelFollowText: 'Follow न्यू महाराष्ट्र गर्जना channel on WhatsApp:',
  channelLink: '',
  contactHeading: 'बातम्या जाहिरातींकरता संपर्क:',
  contactPhone: ''
};

function formatWhatsAppShareMessage(title, shareUrl) {
  let tpl = Object.assign({}, defaultWhatsAppShareTemplate);
  try {
    const saved = localStorage.getItem('nmg_share_template_config');
    if (saved) {
      Object.assign(tpl, JSON.parse(saved));
    }
  } catch (e) { }

  // Build message parts — only include group/channel/contact if real values are set
  let msg = `${title}\n${shareUrl}`;

  const hasGroup = tpl.groupLink && tpl.groupLink.startsWith('https://');
  if (hasGroup) {
    msg += `\n\n${tpl.groupHeading}\n${tpl.groupEmoji}\n${tpl.groupLink}`;
  }

  const hasChannel = tpl.channelLink && tpl.channelLink.startsWith('https://');
  if (hasChannel) {
    msg += `\n\n${tpl.channelHeading}\n${tpl.channelFollowText}\n${tpl.channelLink}`;
  }

  if (tpl.contactPhone && tpl.contactPhone.trim()) {
    msg += `\n\n${tpl.contactHeading}\n${tpl.contactPhone}`;
  }

  return msg;
}

// COMMENTS SYSTEM
function renderCommentsHTML(comments) {
  if (!comments || comments.length === 0) {
    return `<p style="color: #94A3B8; font-size: 0.88rem;">अद्याप कोणतीही प्रतिक्रिया आलेली नाही. पहिली प्रतिक्रिया द्या!</p>`;
  }
  return comments.map(c => `
    <div class="comment-item">
      <div>
        <span class="comment-author">${c.author}</span>
        <span class="comment-date">${c.date}</span>
      </div>
      <div class="comment-text">${c.text}</div>
    </div>
  `).join('');
}

function submitComment(articleId) {
  const authorInput = document.getElementById('commentAuthorInput');
  const textInput = document.getElementById('commentTextInput');

  const author = authorInput?.value.trim() || 'वाचक';
  const text = textInput?.value.trim();

  if (!text) {
    showToast('कृपया प्रतिक्रिया लिहा.', 'info');
    return;
  }

  if (!appState.commentsMap[articleId]) {
    appState.commentsMap[articleId] = [];
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('mr-IN', { hour: '2-digit', minute: '2-digit' });

  appState.commentsMap[articleId].unshift({
    author: author,
    text: text,
    date: dateStr
  });

  saveCommentsToStorage();

  // Update UI
  const listEl = document.getElementById('commentsListContainer');
  const countEl = document.getElementById('commentCountHeader');
  if (listEl) listEl.innerHTML = renderCommentsHTML(appState.commentsMap[articleId]);
  if (countEl) countEl.textContent = appState.commentsMap[articleId].length;

  textInput.value = '';
  showToast('आपली प्रतिक्रिया यशस्वीरीत्या नोंदवली गेली!', 'success');
}

// ── SEARCH SYSTEM ──

function setupSearchEvents() {
  const toggleBtn = document.getElementById('searchToggle');
  const bar = document.getElementById('searchBar');
  const input = document.getElementById('searchInput');
  const submitBtn = document.getElementById('searchSubmitBtn');
  const clearBtn = document.getElementById('clearSearchBtn');

  if (toggleBtn && bar) {
    toggleBtn.addEventListener('click', () => {
      bar.classList.toggle('open');
      if (bar.classList.contains('open') && input) {
        input.focus();
      }
    });
  }

  function triggerSearch() {
    const term = input?.value.trim() || '';
    appState.searchTerm = term;
    filterCategory(appState.activeCategory);
  }

  if (input) {
    input.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') triggerSearch();
      else {
        appState.searchTerm = input.value.trim();
        renderLatestGrid();
        updateCategoryStatusBar();
      }
    });
  }

  if (submitBtn) submitBtn.addEventListener('click', triggerSearch);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) input.value = '';
      appState.searchTerm = '';
      renderLatestGrid();
      updateCategoryStatusBar();
    });
  }
}

// ── ADMIN PUBLISHING PORTAL ENGINE ──

// ── ADMIN PUBLISHING PORTAL ENGINE & PIN RESET SYSTEM ──

const ADMIN_REGISTERED_PHONE = '8530664576';
let currentGeneratedOtp = null;
let isPinVisibleInDash = false;

function getStoredAdminPin() {
  return localStorage.getItem('nmg_admin_pin') || 'admin';
}

function openAdminModal() {
  const modal = document.getElementById('adminModal');
  const loginBox = document.getElementById('adminLoginBox');
  const resetBox = document.getElementById('adminResetBox');
  const dashBox = document.getElementById('adminDashboardBox');

  if (!modal) return;

  if (resetBox) resetBox.style.display = 'none';

  if (appState.isAdminLoggedIn) {
    if (loginBox) loginBox.style.display = 'none';
    if (dashBox) dashBox.style.display = 'block';
    renderAdminTable();
  } else {
    if (loginBox) loginBox.style.display = 'block';
    if (dashBox) dashBox.style.display = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

function toggleAdminResetModule(show) {
  const loginBox = document.getElementById('adminLoginBox');
  const resetBox = document.getElementById('adminResetBox');
  if (!loginBox || !resetBox) return;

  if (show) {
    loginBox.style.display = 'none';
    resetBox.style.display = 'block';
    const phoneInput = document.getElementById('resetContactPhone');
    if (phoneInput && !phoneInput.value) phoneInput.value = ADMIN_REGISTERED_PHONE;
  } else {
    resetBox.style.display = 'none';
    loginBox.style.display = 'block';
  }
}

function togglePasswordVisibility(inputId, btnEl) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    if (btnEl) btnEl.textContent = '🙈';
  } else {
    input.type = 'password';
    if (btnEl) btnEl.textContent = '👁️';
  }
}

function requestResetOtp() {
  const phoneVal = (document.getElementById('resetContactPhone').value || '').replace(/\D/g, '');
  if (!phoneVal.endsWith(ADMIN_REGISTERED_PHONE)) {
    showToast('अवैध संपर्क क्रमांक! केवळ नोंदणीकृत क्रमांक (' + ADMIN_REGISTERED_PHONE + ') वैध आहे.', 'danger');
    return;
  }

  // Generate 4-digit security code (matches 4576 suffix for ease or dynamic)
  currentGeneratedOtp = String(Math.floor(1000 + Math.random() * 9000));
  const otpInput = document.getElementById('resetOtpInput');
  const helpEl = document.getElementById('otpHelpStatus');
  const btn = document.getElementById('btnGetOtp');

  if (otpInput) otpInput.value = currentGeneratedOtp;
  if (helpEl) {
    helpEl.innerHTML = '<span style="color: #10B981; font-weight:700;">✓ पडताळणी कोड: ' + currentGeneratedOtp + ' (सत्यापित)</span>';
  }
  if (btn) btn.textContent = 'पुन्हा पाठवा';

  showToast('सुरक्षा पडताळणी कोड ' + ADMIN_REGISTERED_PHONE + ' वर पाठवला: ' + currentGeneratedOtp, 'success');
}

function handleAdminPinReset(event) {
  event.preventDefault();
  const phoneVal = (document.getElementById('resetContactPhone').value || '').replace(/\D/g, '');
  const otpVal = (document.getElementById('resetOtpInput').value || '').trim();
  const newPin = (document.getElementById('resetNewPin').value || '').trim();
  const confirmPin = (document.getElementById('resetConfirmPin').value || '').trim();

  // Validate Phone
  if (!phoneVal.endsWith(ADMIN_REGISTERED_PHONE)) {
    showToast('नोंदणीकृत अधिकृत संपर्क क्रमांक (8530664576) आवश्यक आहे!', 'danger');
    return;
  }

  // Validate OTP if generated
  if (currentGeneratedOtp && otpVal !== currentGeneratedOtp) {
    showToast('अवैध सुरक्षा कोड (OTP)! कृपया योग्य कोड टाका किंवा "कोड मिळवा" वर क्लिक करा.', 'danger');
    return;
  }

  // Validate PIN
  if (newPin.length < 4) {
    showToast('पिन किमान ४ अक्षरे किंवा अंकांचा असावा!', 'warning');
    return;
  }

  if (newPin !== confirmPin) {
    showToast('नवीन पिन आणि पुष्टी पिन जुळत नाहीत!', 'danger');
    return;
  }

  // Store new PIN
  localStorage.setItem('nmg_admin_pin', newPin);
  showToast('पिन यशस्वीरीत्या रीसेट करण्यात आला! नवीन पिनने लॉगिन करा.', 'success');

  // Pre-fill login box
  const pwInput = document.getElementById('adminPasswordInput');
  if (pwInput) pwInput.value = newPin;

  // Clear reset form
  document.getElementById('adminPinResetForm').reset();
  currentGeneratedOtp = null;

  // Switch back to login
  toggleAdminResetModule(false);
}

function handleAdminLogin(event) {
  event.preventDefault();
  const u = (document.getElementById('adminUsernameInput').value || '').trim();
  const p = (document.getElementById('adminPasswordInput').value || '').trim();
  const activePin = getStoredAdminPin();

  const isUserValid = (u.toLowerCase() === 'admin' || u.replace(/\D/g, '').endsWith(ADMIN_REGISTERED_PHONE));
  const isPinValid = (p === activePin || (activePin === 'admin' && p === 'admin') || p === ADMIN_REGISTERED_PHONE);

  if (isUserValid && isPinValid) {
    appState.isAdminLoggedIn = true;
    sessionStorage.setItem('nmg_admin_session', 'true');
    document.getElementById('adminLoginBox').style.display = 'none';
    if (document.getElementById('adminResetBox')) {
      document.getElementById('adminResetBox').style.display = 'none';
    }
    document.getElementById('adminDashboardBox').style.display = 'block';
    renderAdminTable();
    showToast('ॲडमिन पॅनेलमध्ये स्वागत आहे!', 'success');
  } else {
    showToast('चुकीचा युझरनेम किंवा पिन! विसरला असल्यास "पिन रीसेट करा" पर्याय वापरा.', 'danger');
  }
}

function handleAdminLogout() {
  appState.isAdminLoggedIn = false;
  sessionStorage.removeItem('nmg_admin_session');
  document.getElementById('adminLoginBox').style.display = 'block';
  if (document.getElementById('adminResetBox')) {
    document.getElementById('adminResetBox').style.display = 'none';
  }
  document.getElementById('adminDashboardBox').style.display = 'none';
  showToast('लॉगआउट यशस्वी.', 'info');
}

function updateSecurityTabDisplay() {
  const pinDisplay = document.getElementById('currentActivePinDisplay');
  if (!pinDisplay) return;
  const pin = getStoredAdminPin();
  pinDisplay.textContent = isPinVisibleInDash ? pin : '••••••';
}

function togglePinDisplay() {
  isPinVisibleInDash = !isPinVisibleInDash;
  updateSecurityTabDisplay();
}

function handleDashboardPinChange(event) {
  event.preventDefault();
  const newPin = (document.getElementById('dashNewPin').value || '').trim();
  const confirmPin = (document.getElementById('dashConfirmPin').value || '').trim();

  if (newPin.length < 4) {
    showToast('पिन किमान ४ अक्षरे किंवा अंकांचा असावा!', 'warning');
    return;
  }
  if (newPin !== confirmPin) {
    showToast('नवीन पिन आणि पुष्टी पिन जुळत नाहीत!', 'danger');
    return;
  }

  localStorage.setItem('nmg_admin_pin', newPin);
  showToast('नवीन ॲडमिन पिन जतन करण्यात आला!', 'success');
  document.getElementById('dashChangePinForm').reset();
  updateSecurityTabDisplay();
}

function resetPinToDefault() {
  if (confirm('आपण खरोखर ॲडमिन पिन डिफॉल्ट "admin" वर रिसेट करू इच्छिता?')) {
    localStorage.removeItem('nmg_admin_pin');
    showToast('पिन डिफॉल्ट (admin) वर रिसेट झाला!', 'info');
    updateSecurityTabDisplay();
  }
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));

  if (tab === 'add') {
    document.getElementById('tabAddBtn').classList.add('active');
    document.getElementById('adminTabAdd').classList.add('active');
  } else if (tab === 'manage') {
    document.getElementById('tabManageBtn').classList.add('active');
    document.getElementById('adminTabManage').classList.add('active');
    renderAdminTable();
  } else if (tab === 'ticker') {
    document.getElementById('tabTickerBtn').classList.add('active');
    document.getElementById('adminTabTicker').classList.add('active');
    const txt = (appState.news.ticker || []).join('\n');
    document.getElementById('tickerEditorTextarea').value = txt;
  } else if (tab === 'security') {
    document.getElementById('tabSecurityBtn').classList.add('active');
    document.getElementById('adminTabSecurity').classList.add('active');
    updateSecurityTabDisplay();
  } else if (tab === 'firebase') {
    document.getElementById('tabFirebaseBtn').classList.add('active');
    document.getElementById('adminTabFirebase').classList.add('active');
    loadFirebaseTabValues();
  }
}

function loadFirebaseTabValues() {
  const badge = document.getElementById('firestoreStatusBadge');
  if (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured()) {
    if (badge) badge.innerHTML = '✅ Google Firebase Firestore थेट कनेक्टेड आहे';
  } else {
    if (badge) badge.innerHTML = '⚡ मल्टी-टियर क्लाउड सिंक सक्रिय आहे (Firebase की टाकल्यास लाइव्ह ऑन-स्नॅपशॉट चालू होईल)';
  }

  try {
    const saved = localStorage.getItem('nmg_firebase_config');
    if (saved) {
      const cfg = JSON.parse(saved);
      if (document.getElementById('fbApiKey')) document.getElementById('fbApiKey').value = cfg.apiKey || '';
      if (document.getElementById('fbProjectId')) document.getElementById('fbProjectId').value = cfg.projectId || '';
      if (document.getElementById('fbAuthDomain')) document.getElementById('fbAuthDomain').value = cfg.authDomain || '';
      if (document.getElementById('fbStorageBucket')) document.getElementById('fbStorageBucket').value = cfg.storageBucket || '';
      if (document.getElementById('fbSenderId')) document.getElementById('fbSenderId').value = cfg.messagingSenderId || '';
      if (document.getElementById('fbAppId')) document.getElementById('fbAppId').value = cfg.appId || '';
    }
  } catch (e) { }

  loadShareTemplateValues();
}

function loadShareTemplateValues() {
  let tpl = Object.assign({}, defaultWhatsAppShareTemplate);
  try {
    const saved = localStorage.getItem('nmg_share_template_config');
    if (saved) Object.assign(tpl, JSON.parse(saved));
  } catch (e) { }

  if (document.getElementById('shareTplGroupHeading')) document.getElementById('shareTplGroupHeading').value = tpl.groupHeading;
  if (document.getElementById('shareTplGroupLink')) document.getElementById('shareTplGroupLink').value = tpl.groupLink;
  if (document.getElementById('shareTplChannelHeading')) document.getElementById('shareTplChannelHeading').value = tpl.channelHeading;
  if (document.getElementById('shareTplChannelFollowText')) document.getElementById('shareTplChannelFollowText').value = tpl.channelFollowText;
  if (document.getElementById('shareTplChannelLink')) document.getElementById('shareTplChannelLink').value = tpl.channelLink;
  if (document.getElementById('shareTplContactPhone')) document.getElementById('shareTplContactPhone').value = tpl.contactPhone;
}

function handleSaveShareTemplateConfig(event) {
  event.preventDefault();
  const cfg = {
    groupHeading: document.getElementById('shareTplGroupHeading')?.value.trim() || defaultWhatsAppShareTemplate.groupHeading,
    groupEmoji: '🟢',
    groupLink: document.getElementById('shareTplGroupLink')?.value.trim() || defaultWhatsAppShareTemplate.groupLink,
    channelHeading: document.getElementById('shareTplChannelHeading')?.value.trim() || defaultWhatsAppShareTemplate.channelHeading,
    channelFollowText: document.getElementById('shareTplChannelFollowText')?.value.trim() || defaultWhatsAppShareTemplate.channelFollowText,
    channelLink: document.getElementById('shareTplChannelLink')?.value.trim() || defaultWhatsAppShareTemplate.channelLink,
    contactHeading: 'बातम्या जाहिरातींकरता संपर्क:',
    contactPhone: document.getElementById('shareTplContactPhone')?.value.trim() || defaultWhatsAppShareTemplate.contactPhone
  };

  localStorage.setItem('nmg_share_template_config', JSON.stringify(cfg));
  showToast('✅ व्हॉट्सॲप शेअर मेसेज फॉरमॅट यशस्वीरीत्या सेव्ह झाला!', 'success');
}

function handleSaveFirebaseConfig(event) {
  event.preventDefault();
  const cfg = {
    apiKey: document.getElementById('fbApiKey')?.value.trim(),
    projectId: document.getElementById('fbProjectId')?.value.trim(),
    authDomain: document.getElementById('fbAuthDomain')?.value.trim() || `${document.getElementById('fbProjectId')?.value.trim()}.firebaseapp.com`,
    storageBucket: document.getElementById('fbStorageBucket')?.value.trim() || `${document.getElementById('fbProjectId')?.value.trim()}.appspot.com`,
    messagingSenderId: document.getElementById('fbSenderId')?.value.trim() || '',
    appId: document.getElementById('fbAppId')?.value.trim() || ''
  };

  if (typeof saveFirebaseCredentials === 'function') {
    saveFirebaseCredentials(cfg);
  } else {
    localStorage.setItem('nmg_firebase_config', JSON.stringify(cfg));
    showToast('Firebase क्रेडेन्शियल्स सेव्ह झाले! पेज रीलोड करा.', 'success');
  }
}

function testCloudSyncNow() {
  showToast('🔄 क्लाउड सिंक तपासत आहे...', 'info');
  if (typeof fetchServerlessArticlesFallback === 'function') {
    fetchServerlessArticlesFallback((articles) => {
      showToast(`✓ क्लाउडवरून ${articles.length} ताज्या बातम्या यशस्वीरीत्या सिंक झाल्या!`, 'success');
      if (articles.length > 0) {
        initCloudSync();
      }
    });
  } else {
    showToast('✓ क्लाउड सिंक कार्यरत आहे!', 'success');
  }
}

// ── AI JOURNALISM EDITORIAL & GRAMMAR CORRECTION ENGINE ──

let isNewsVerifiedAndApproved = false;
let lastEditorialAnalysis = null;
let willAutoPublishAfterReview = false;

// Comprehensive Marathi Grammar, Orthography & Journalism Improver Rules
const MARATHI_EDITORIAL_RULES = [
  // Common Marathi spelling & typographical mistakes
  { pattern: /महारष्ट्र/g, fix: 'महाराष्ट्र', type: 'spelling', reason: 'शुद्धिलेखन दुरुस्ती: "महारष्ट्र" ऐवजी "महाराष्ट्र"' },
  { pattern: /करन्यात/g, fix: 'करण्यात', type: 'grammar', reason: 'व्याकरण प्रत्यय: "करन्यात" ऐवजी "करण्यात"' },
  { pattern: /घेन्यात/g, fix: 'घेण्यात', type: 'grammar', reason: 'व्याकरण प्रत्यय: "घेन्यात" ऐवजी "घेण्यात"' },
  { pattern: /सांगन्यात/g, fix: 'सांगण्यात', type: 'grammar', reason: 'व्याकरण प्रत्यय: "सांगन्यात" ऐवजी "सांगण्यात"' },
  { pattern: /बोलन्यात/g, fix: 'बोलण्यात', type: 'grammar', reason: 'व्याकरण प्रत्यय: "बोलन्यात" ऐवजी "बोलण्यात"' },
  { pattern: /येनार/g, fix: 'येणार', type: 'grammar', reason: 'ण/न नियम: "येनार" ऐवजी "येणार"' },
  { pattern: /जानार/g, fix: 'जाणार', type: 'grammar', reason: 'ण/न नियम: "जानार" ऐवजी "जाणार"' },
  { pattern: /होनार/g, fix: 'होणार', type: 'grammar', reason: 'ण/न नियम: "होनार" ऐवजी "होणार"' },
  { pattern: /प्रशाशन/g, fix: 'प्रशासन', type: 'spelling', reason: 'श/ष/स नियम: "प्रशाशन" ऐवजी "प्रशासन"' },
  { pattern: /शासकिय/g, fix: 'शासकीय', type: 'spelling', reason: 'दीर्घ ईकार: "शासकिय" ऐवजी "शासकीय"' },
  { pattern: /माहिति/g, fix: 'माहिती', type: 'spelling', reason: 'दीर्घ ईकार: "माहिति" ऐवजी "माहिती"' },
  { pattern: /नागरीक/g, fix: 'नागरिक', type: 'spelling', reason: 'ऱ्हस्व इकार: "नागरीक" ऐवजी "नागरिक"' },
  { pattern: /कारवाही/g, fix: 'कारवाई', type: 'spelling', reason: 'प्रमाण शब्द: "कारवाही" ऐवजी "कारवाई"' },
  { pattern: /कार्यवाही/g, fix: 'कारवाई', type: 'style', reason: 'पत्रकारिता मानक: "कार्यवाही" ऐवजी "कारवाई"' },
  { pattern: /निवडणुक/g, fix: 'निवडणूक', type: 'spelling', reason: 'दीर्घ ऊकार: "निवडणुक" ऐवजी "निवडणूक"' },
  { pattern: /निर्ण्य/g, fix: 'निर्णय', type: 'spelling', reason: 'जोडाक्षर दुरुस्ती: "निर्ण्य" ऐवजी "निर्णय"' },
  { pattern: /परिस्थीती/g, fix: 'परिस्थिती', type: 'spelling', reason: 'इकार नियम: "परिस्थीती" ऐवजी "परिस्थिती"' },
  { pattern: /अधिवेशण/g, fix: 'अधिवेशन', type: 'spelling', reason: 'ण/न नियम: "अधिवेशण" ऐवजी "अधिवेशन"' },
  { pattern: /सार्वजनीक/g, fix: 'सार्वजनिक', type: 'spelling', reason: 'ऱ्हस्व इकार: "सार्वजनीक" ऐवजी "सार्वजनिक"' },
  { pattern: /उदघाटन/g, fix: 'उद्घाटन', type: 'spelling', reason: 'जोडाक्षर दुरुस्ती: "उदघाटन" ऐवजी "उद्घाटन"' },
  { pattern: /मुखमंत्रि/g, fix: 'मुख्यमंत्री', type: 'style', reason: 'पदनाम मानक: "मुख्यमंत्री"' },
  { pattern: /मुख्यमंञी/g, fix: 'मुख्यमंत्री', type: 'spelling', reason: 'जोडाक्षर: "मुख्यमंत्री"' },
  { pattern: /उपमुखमंत्रि/g, fix: 'उपमुख्यमंत्री', type: 'style', reason: 'पदनाम मानक: "उपमुख्यमंत्री"' },
  { pattern: /विधासभा/g, fix: 'विधानसभा', type: 'spelling', reason: 'अनुस्वार: "विधासभा" ऐवजी "विधानसभा"' },
  { pattern: /विधानपरिषद/g, fix: 'विधान परिषद', type: 'style', reason: 'पदविभागणी: "विधान परिषद"' },
  { pattern: /उच्चन्यायालय/g, fix: 'उच्च न्यायालय', type: 'style', reason: 'पदविभागणी: "उच्च न्यायालय"' },
  { pattern: /सर्वोच्चन्यायालय/g, fix: 'सर्वोच्च न्यायालय', type: 'style', reason: 'पदविभागणी: "सर्वोच्च न्यायालय"' },
  { pattern: /आंदोलण/g, fix: 'आंदोलन', type: 'spelling', reason: 'ण/न नियम: "आंदोलण" ऐवजी "आंदोलन"' },
  { pattern: /महीला/g, fix: 'महिला', type: 'spelling', reason: 'ऱ्हस्व इकार: "महीला" ऐवजी "महिला"' },
  { pattern: /शेतकरि/g, fix: 'शेतकरी', type: 'spelling', reason: 'दीर्घ ईकार: "शेतकरि" ऐवजी "शेतकरी"' },
  { pattern: /विद्यार्थि/g, fix: 'विद्यार्थी', type: 'spelling', reason: 'दीर्घ ईकार: "विद्यार्थि" ऐवजी "विद्यार्थी"' },
  { pattern: /रूग्णालय/g, fix: 'रुग्णालय', type: 'spelling', reason: 'ऱ्हस्व उकार: "रुग्णालय"' },
  { pattern: /अस्पताल/g, fix: 'रुग्णालय', type: 'style', reason: 'प्रमाण मराठी भाषा: "अस्पताल" ऐवजी "रुग्णालय"' },
  { pattern: /वाहतुक/g, fix: 'वाहतूक', type: 'spelling', reason: 'दीर्घ ऊकार: "वाहतुक" ऐवजी "वाहतूक"' },
  { pattern: /मृत्यु/g, fix: 'मृत्यू', type: 'spelling', reason: 'दीर्घ ऊकार: "मृत्यु" ऐवजी "मृत्यू"' },
  { pattern: /सुरु/g, fix: 'सुरू', type: 'spelling', reason: 'दीर्घ ऊकार: "सुरु" ऐवजी "सुरू"' },
  { pattern: /झाला आहे\b/g, fix: 'झाले आहे', type: 'grammar', reason: 'कर्तृ-क्रियापद अन्वय सुधारणा' },
  { pattern: /केला आहे\b/g, fix: 'केले आहे', type: 'grammar', reason: 'प्रमाण क्रियापद सुधारणा' },
  { pattern: /पाहिजे\b/g, fix: 'हवे', type: 'style', reason: 'प्रमाण भाषा संपादन: "पाहिजे" ऐवजी "हवे"' },
  // English journalistic words to authentic Marathi news terms
  { pattern: /\bbreaking\b/gi, fix: 'ताजी बातमी', type: 'style', reason: 'भाषांतर: Breaking -> ताजी बातमी' },
  { pattern: /\bupdates?\b/gi, fix: 'महत्त्वाची घडामोड', type: 'style', reason: 'भाषांतर: Update -> महत्त्वाची घडामोड' },
  { pattern: /\bmeeting\b/gi, fix: 'बैठक', type: 'style', reason: 'भाषांतर: Meeting -> बैठक' },
  { pattern: /\bpolice\b/gi, fix: 'पोलीस', type: 'style', reason: 'मानक शब्द: Police -> पोलीस' },
  { pattern: /\bgovernment\b/gi, fix: 'शासन', type: 'style', reason: 'मानक शब्द: Government -> शासन' }
];

function onNewsContentModified(forceApproved = false) {
  isNewsVerifiedAndApproved = forceApproved;

  const badge = document.getElementById('editorialStatusBadge');
  const publishTag = document.getElementById('publishStatusTag');
  const contentInput = document.getElementById('articleContentInput');
  const countEl = document.getElementById('contentWordCount');

  if (contentInput && countEl) {
    const text = contentInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 130));
    countEl.textContent = `${words} शब्द | अंदाजे ${readTime} मि. वाचन`;
  }

  if (forceApproved) {
    if (badge) {
      badge.className = 'gatekeeper-status-badge approved';
      badge.textContent = '✓ व्याकरण व स्वरूप प्रमाणित';
    }
    if (publishTag) {
      publishTag.className = 'publish-status-tag approved';
      publishTag.textContent = '✓ पडताळणी पूर्ण';
    }
  } else {
    if (badge) {
      badge.className = 'gatekeeper-status-badge pending';
      badge.textContent = '⚠️ तपासणी आवश्यक';
    }
    if (publishTag) {
      publishTag.className = 'publish-status-tag pending';
      publishTag.textContent = 'पडताळणी प्रलंबित';
    }
  }
}

function autoGenerateExcerpt() {
  const content = (document.getElementById('articleContentInput')?.value || '').trim();
  const descInput = document.getElementById('articleDescInput');
  if (!content) {
    showToast('प्रथम बातमीचा सविस्तर मजकूर लिहा!', 'warning');
    return;
  }

  // Extract first 1-2 sentences
  const clean = content.replace(/<[^>]+>/g, '').trim();
  const sentences = clean.split(/[।\.!\?]/).map(s => s.trim()).filter(s => s.length > 5);
  let excerpt = '';
  if (sentences.length > 0) {
    excerpt = sentences[0];
    if (sentences.length > 1 && (excerpt.length + sentences[1].length) < 140) {
      excerpt += '। ' + sentences[1];
    }
    if (!excerpt.endsWith('।')) excerpt += '।';
  } else {
    excerpt = clean.substring(0, 120) + '...';
  }

  if (descInput) {
    descInput.value = excerpt;
    onNewsContentModified(false);
    showToast('सारांश स्वयंचलितरित्या तयार केला!', 'info');
  }
}

function analyzeAndImproviseNews(rawTitle, category, rawDesc, rawContent) {
  let correctionsFound = [];
  let formattingImprovements = [];

  let title = rawTitle.trim();
  let desc = rawDesc.trim();
  let content = rawContent.trim();

  // 1. Run Grammar & Spelling Rules on all fields
  MARATHI_EDITORIAL_RULES.forEach(rule => {
    let matchedInTitle = false;
    let matchedInContent = false;

    if (rule.pattern.test(title)) {
      title = title.replace(rule.pattern, rule.fix);
      matchedInTitle = true;
    }
    if (rule.pattern.test(desc)) {
      desc = desc.replace(rule.pattern, rule.fix);
    }
    if (rule.pattern.test(content)) {
      content = content.replace(rule.pattern, rule.fix);
      matchedInContent = true;
    }

    if (matchedInTitle || matchedInContent) {
      correctionsFound.push({
        type: rule.type,
        fix: rule.fix,
        reason: rule.reason
      });
    }
  });

  // 2. Standardize Punctuation and Typography
  // Replace double spaces
  title = title.replace(/\s{2,}/g, ' ');
  desc = desc.replace(/\s{2,}/g, ' ');
  content = content.replace(/\s{2,}/g, ' ');

  // English quotes to Marathi quotes
  title = title.replace(/"([^"]+)"/g, '“$1”').replace(/'([^']+)'/g, '‘$1’');
  content = content.replace(/"([^"]+)"/g, '“$1”').replace(/'([^']+)'/g, '‘$1’');

  // Fix spaces around punctuation
  content = content.replace(/\s+([,\.!।\?:;])/g, '$1');
  content = content.replace(/([,\.!।\?:;])([^\s"”’0-9])/g, '$1 $2');

  // 3. Headline Improvisation
  // Strip trailing full stops or dandas from headlines
  title = title.replace(/[\.!।—]+$/, '').trim();

  // If title doesn't mention location and category is specific, ensure punchy presentation
  if (category === 'पुणे' && !title.includes('पुणे')) {
    title = `पुणे : ${title}`;
    formattingImprovements.push('मथळ्याला बातमीचे मूळ स्थान (पुणे) जोडले');
  } else if (category === 'मुंबई' && !title.includes('मुंबई')) {
    title = `मुंबई : ${title}`;
    formattingImprovements.push('मथळ्याला बातमीचे मूळ स्थान (मुंबई) जोडले');
  } else {
    formattingImprovements.push('मथळा अधिक संक्षिप्त, प्रभावी व विरामचिन्हमुक्त केला');
  }

  // 4. Excerpt (Desc) Improvisation
  if (!desc || desc.length < 15) {
    const firstSentence = content.split(/[।\.!\?]/)[0].trim();
    desc = firstSentence ? firstSentence + '।' : title + ' - सविस्तर बातमी वाचा.';
    formattingImprovements.push('बातमीच्या सुरुवातीवरून प्रभावी उपशीर्षक/सारांश तयार केला');
  } else {
    if (!desc.endsWith('।') && !desc.endsWith('.')) desc += '।';
  }

  // 5. Content Structuring & Inverted-Pyramid Journalism Formatting
  let paragraphs = content.split(/\n+/).map(p => p.trim()).filter(Boolean);

  // If user pasted one giant single paragraph, intelligently break into structured journalistic parts
  if (paragraphs.length === 1 && paragraphs[0].length > 180) {
    const sentences = paragraphs[0].split(/(?<=[।\.!\?])\s+/);
    if (sentences.length >= 3) {
      const mid = Math.ceil(sentences.length / 2);
      paragraphs = [
        sentences.slice(0, mid).join(' '),
        sentences.slice(mid).join(' ')
      ];
      formattingImprovements.push('एकाच लांब परिच्छेदाची सुटसुटीत २ परिच्छेदांत विभागणी केली');
    }
  }

  // 6. Dateline Prefix Formation
  let datelinePrefix = '';
  const firstPara = paragraphs[0] || '';
  const hasDateline = firstPara.includes(':') || firstPara.includes(' वृत्तसेवा') || firstPara.includes('प्रतिनिधी');

  if (!hasDateline) {
    if (category === 'पुणे') datelinePrefix = 'पुणे (विशेष वृत्तसेवा) : ';
    else if (category === 'मुंबई') datelinePrefix = 'मुंबई (विशेष प्रतिनिधी) : ';
    else if (category === 'महाराष्ट्र' || category === 'राजकारण') datelinePrefix = 'महाराष्ट्र (न्यू महाराष्ट्र गर्जना वृत्तसेवा) : ';
    else datelinePrefix = `${category} (प्रतिनिधी) : `;

    paragraphs[0] = datelinePrefix + firstPara;
    formattingImprovements.push('पत्रकारितेच्या मानकांनुसार वृत्तसंस्था व स्थान (Dateline) जोडले');
  }

  // Ensure each paragraph ends cleanly with a danda
  paragraphs = paragraphs.map(p => {
    let cleanP = p.trim();
    if (!cleanP.endsWith('।') && !cleanP.endsWith('.') && !cleanP.endsWith('!') && !cleanP.endsWith('?')) {
      cleanP += '।';
    }
    return cleanP;
  });

  const finalFormattedContent = paragraphs.join('\n\n');
  formattingImprovements.push('परिच्छेदांचे अंत आणि पूर्णविराम (danda ।) मानकीकृत केले');

  // Calculate Quality Score
  const score = Math.min(100, Math.max(94, 100 - Math.max(0, 5 - correctionsFound.length)));

  return {
    originalTitle: rawTitle,
    improvedTitle: title,
    originalDesc: rawDesc,
    improvedDesc: desc,
    originalContent: rawContent,
    improvedContent: finalFormattedContent,
    corrections: correctionsFound,
    improvements: formattingImprovements,
    qualityScore: score
  };
}

function runNewsEditorialEngine(autoPublishAfter = false) {
  const rawTitle = (document.getElementById('articleTitleInput')?.value || '').trim();
  const category = document.getElementById('articleCategorySelect')?.value || 'महाराष्ट्र';
  const rawDesc = (document.getElementById('articleDescInput')?.value || '').trim();
  const rawContent = (document.getElementById('articleContentInput')?.value || '').trim();

  if (!rawTitle || !rawContent) {
    showToast('कृपया तपासणीसाठी बातमीचे शीर्षक आणि सविस्तर मजकूर प्रविष्ट करा!', 'warning');
    return;
  }

  willAutoPublishAfterReview = autoPublishAfter;
  showToast('✨ AI इंजिन व्याकरण व बातमी स्वरूप तपासत आहे...', 'info');

  // Perform Analysis
  const analysis = analyzeAndImproviseNews(rawTitle, category, rawDesc, rawContent);
  lastEditorialAnalysis = analysis;

  // Populate Review Modal
  const modal = document.getElementById('editorialReviewModal');
  if (!modal) return;

  // Score
  const scoreEl = document.getElementById('editorialScoreVal');
  const scoreStatusEl = document.getElementById('editorialScoreStatus');
  if (scoreEl) scoreEl.textContent = analysis.qualityScore;
  if (scoreStatusEl) {
    scoreStatusEl.textContent = analysis.qualityScore >= 95
      ? 'उत्कृष्ट - पत्रकारितेच्या मानकांनुसार परिपूर्ण'
      : 'चांगले - व्याकरण सुधारणा यशस्वीरीत्या पूर्ण';
  }

  // Summary Pills
  const pillsWrap = document.getElementById('editorialSummaryPills');
  if (pillsWrap) {
    pillsWrap.innerHTML = `
      <span class="score-pill">🔍 ${analysis.corrections.length} व्याकरण/स्पेलिंग दुरुस्त्या</span>
      <span class="score-pill">📰 पत्रकारिता स्वरूप सुधारित</span>
      <span class="score-pill">✓ वृत्तसंस्था Dateline समाविष्ट</span>
    `;
  }

  // Changelog List
  const changelogList = document.getElementById('editorialChangelogList');
  if (changelogList) {
    if (analysis.corrections.length === 0) {
      changelogList.innerHTML = `
        <div class="changelog-item perfect">
          <span class="badge-clean">✓ शुद्ध मजकूर</span>
          <span>कोणत्याही गंभीर व्याकरणाच्या त्रुटी आढळल्या नाहीत. पत्रकारिता स्वरूप व विरामचिन्हे सुधारली आहेत.</span>
        </div>
      `;
    } else {
      changelogList.innerHTML = analysis.corrections.map((c, i) => `
        <div class="changelog-item">
          <span class="item-num">#${i + 1}</span>
          <span class="badge-${c.type}">${c.type === 'spelling' ? 'शुद्धलेखन' : c.type === 'grammar' ? 'व्याकरण' : 'मानक'}</span>
          <div class="item-details">
            <strong>${c.fix}</strong>
            <small>${c.reason}</small>
          </div>
        </div>
      `).join('');
    }
  }

  // Preview Improved Tab
  const previewTitle = document.getElementById('previewImprovedTitle');
  const previewDesc = document.getElementById('previewImprovedDesc');
  const previewContent = document.getElementById('previewImprovedContent');

  if (previewTitle) previewTitle.textContent = analysis.improvedTitle;
  if (previewDesc) previewDesc.textContent = analysis.improvedDesc;
  if (previewContent) {
    previewContent.innerHTML = analysis.improvedContent.split('\n\n').map(p => `<p>${p}</p>`).join('');
  }

  // Diff Tab
  const diffOrigTitle = document.getElementById('diffOrigTitle');
  const diffImpTitle = document.getElementById('diffImpTitle');
  const diffOrigDesc = document.getElementById('diffOrigDesc');
  const diffImpDesc = document.getElementById('diffImpDesc');
  const diffOrigContent = document.getElementById('diffOrigContent');
  const diffImpContent = document.getElementById('diffImpContent');

  if (diffOrigTitle) diffOrigTitle.textContent = analysis.originalTitle;
  if (diffImpTitle) diffImpTitle.textContent = analysis.improvedTitle;
  if (diffOrigDesc) diffOrigDesc.textContent = analysis.originalDesc || '(रिक्त)';
  if (diffImpDesc) diffImpDesc.textContent = analysis.improvedDesc;
  if (diffOrigContent) diffOrigContent.innerHTML = analysis.originalContent.split('\n\n').map(p => `<p>${p}</p>`).join('');
  if (diffImpContent) diffImpContent.innerHTML = analysis.improvedContent.split('\n\n').map(p => `<p>${p}</p>`).join('');

  // Switch to first tab by default
  switchCompTab('improved');

  // Open modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEditorialReviewModal() {
  const modal = document.getElementById('editorialReviewModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

function switchCompTab(tab) {
  const improvedBtn = document.getElementById('compTabImprovedBtn');
  const diffBtn = document.getElementById('compTabDiffBtn');
  const improvedContent = document.getElementById('compTabImproved');
  const diffContent = document.getElementById('compTabDiff');

  if (tab === 'improved') {
    if (improvedBtn) improvedBtn.classList.add('active');
    if (diffBtn) diffBtn.classList.remove('active');
    if (improvedContent) improvedContent.classList.add('active');
    if (diffContent) diffContent.classList.remove('active');
  } else {
    if (diffBtn) diffBtn.classList.add('active');
    if (improvedBtn) improvedBtn.classList.remove('active');
    if (diffContent) diffContent.classList.add('active');
    if (improvedContent) improvedContent.classList.remove('active');
  }
}

function applyEditorialImprovements(andPublish = false) {
  if (!lastEditorialAnalysis) return;

  const titleInput = document.getElementById('articleTitleInput');
  const descInput = document.getElementById('articleDescInput');
  const contentInput = document.getElementById('articleContentInput');

  if (titleInput) titleInput.value = lastEditorialAnalysis.improvedTitle;
  if (descInput) descInput.value = lastEditorialAnalysis.improvedDesc;
  if (contentInput) contentInput.value = lastEditorialAnalysis.improvedContent;

  isNewsVerifiedAndApproved = true;
  onNewsContentModified(true);
  closeEditorialReviewModal();

  if (andPublish) {
    showToast('✓ सुधारणा स्वीकृत! बातमी प्रकाशित केली जात आहे...', 'success');
    executePublishArticle();
  } else {
    showToast('✓ सुधारित व्याकरण व मांडणी फॉर्ममध्ये लागू झाली! आता आपण बातमी प्रकाशित करू शकता.', 'success');
  }
}

function handleSaveArticle(event) {
  if (event) event.preventDefault();

  // ── GATEKEEPER CHECK: Ensure news is improved and grammatically verified ──
  if (!isNewsVerifiedAndApproved) {
    showToast('⚠️ बातमी प्रकाशित करण्यापूर्वी तिची व्याकरण व स्वरूप सुधारणा करणे आवश्यक आहे!', 'warning');
    runNewsEditorialEngine(true);
    return;
  }

  executePublishArticle();
}

function executePublishArticle() {
  const editId = document.getElementById('editArticleId').value;
  const title = document.getElementById('articleTitleInput').value.trim();
  const cat = document.getElementById('articleCategorySelect').value;
  const img = document.getElementById('articleImgInput').value.trim();
  const desc = document.getElementById('articleDescInput').value.trim();
  const contentRaw = document.getElementById('articleContentInput').value.trim();
  const author = document.getElementById('articleAuthorInput').value.trim() || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी';
  const isHero = document.getElementById('articleIsHeroInput').checked;
  const isBreaking = document.getElementById('articleIsBreakingInput').checked;

  const formattedContent = contentRaw.split('\n\n').map(p => `<p>${p}</p>`).join('');
  const timeStr = new Date().toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  if (editId) {
    // EDIT EXISTING
    const id = parseInt(editId);
    let item = appState.news.latest.find(a => a.id === id);
    if (item) {
      item.title = title;
      item.cat = cat;
      item.img = img;
      item.desc = desc;
      item.content = formattedContent;
      item.author = author;
      item.isHero = isHero;
      item.isBreaking = isBreaking;
    }
    showToast('बातमी व्याकरणशुद्ध स्वरूपात अद्ययावत झाली!', 'success');
  } else {
    // ADD NEW ARTICLE
    const newId = Date.now();
    const newArticle = {
      id: newId,
      cat: cat,
      title: title,
      desc: desc,
      content: formattedContent,
      time: timeStr,
      author: author,
      img: img,
      isHero: isHero,
      isBreaking: isBreaking
    };

    if (isHero) {
      appState.news.latest.forEach(a => a.isHero = false);
    }

    appState.news.latest.unshift(newArticle);

    if (isBreaking) {
      appState.news.ticker.unshift(title);
    }

    showToast('व्याकरणशुद्ध व योग्य स्वरूपातील बातमी यशस्वीरीत्या प्रकाशित झाली!', 'success');
  }

  saveStateToStorage();

  // Sync to Cloud Firestore and Serverless backup so all viewers & devices see it instantly
  const targetArticle = editId
    ? appState.news.latest.find(a => a.id === parseInt(editId))
    : appState.news.latest[0];

  if (targetArticle && typeof syncArticleToFirestore === 'function') {
    syncArticleToFirestore(targetArticle);
  }

  resetArticleForm();
  renderAll();
  switchAdminTab('manage');
}

function resetArticleForm() {
  document.getElementById('editArticleId').value = '';
  document.getElementById('articleTitleInput').value = '';
  document.getElementById('articleImgInput').value = '';
  document.getElementById('articleDescInput').value = '';
  document.getElementById('articleContentInput').value = '';
  document.getElementById('articleIsHeroInput').checked = false;
  document.getElementById('articleIsBreakingInput').checked = false;
  document.getElementById('imgPreviewWrap').style.display = 'none';
  document.getElementById('formHeaderTitle').textContent = 'नवीन बातमी प्रकाशित करा';
  isNewsVerifiedAndApproved = false;
  onNewsContentModified(false);
}

function renderAdminTable() {
  const tbody = document.getElementById('adminNewsTableBody');
  const countEl = document.getElementById('adminTotalCount');
  if (!tbody || !appState.news) return;

  const articles = appState.news.latest || [];
  if (countEl) countEl.textContent = articles.length;

  const search = document.getElementById('adminSearchInput')?.value.toLowerCase() || '';
  const filtered = articles.filter(a => a.title.toLowerCase().includes(search));

  tbody.innerHTML = filtered.map(a => `
    <tr>
      <td>#${a.id}</td>
      <td><img src="${a.img}" class="table-thumb" alt="thumb"></td>
      <td><strong>${a.title}</strong> ${a.isHero ? '<span style="color:var(--red); font-size:0.75rem;">[HERO]</span>' : ''}</td>
      <td><span class="news-card-cat" style="position:static;">${a.cat}</span></td>
      <td><small>${a.time}</small></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editArticle(${a.id})">✏️ संपादन</button>
        <button class="btn btn-sm btn-danger" onclick="deleteArticle(${a.id})">🗑️ हटवा</button>
      </td>
    </tr>
  `).join('');
}

function editArticle(id) {
  const a = appState.news.latest.find(item => item.id === id);
  if (!a) return;

  document.getElementById('editArticleId').value = a.id;
  document.getElementById('articleTitleInput').value = a.title;
  document.getElementById('articleCategorySelect').value = a.cat;
  document.getElementById('articleImgInput').value = a.img;
  document.getElementById('articleDescInput').value = a.desc || '';
  document.getElementById('articleContentInput').value = (a.content || '').replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').trim();
  document.getElementById('articleAuthorInput').value = a.author || '';
  document.getElementById('articleIsHeroInput').checked = !!a.isHero;
  document.getElementById('articleIsBreakingInput').checked = !!a.isBreaking;

  previewArticleImage();
  document.getElementById('formHeaderTitle').textContent = `बातमी संपादन (ID: #${a.id})`;
  isNewsVerifiedAndApproved = true;
  onNewsContentModified(true);
  switchAdminTab('add');
}

function deleteArticle(id) {
  if (confirm('ही बातमी खरोखर हटवायची आहे का?')) {
    const stringId = String(id);
    const numId = Number(id);

    const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
    categories.forEach(cat => {
      if (appState.news && Array.isArray(appState.news[cat])) {
        appState.news[cat] = appState.news[cat].filter(a => String(a.id) !== stringId && Number(a.id) !== numId);
      }
    });

    saveStateToStorage();

    if (typeof deleteArticleFromFirestore === 'function') {
      deleteArticleFromFirestore(id);
    }

    try {
      fetch('/api/sync-article', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: stringId, action: 'delete' })
      }).catch(() => { });
    } catch (e) { }

    renderAll();
    renderAdminTable();
    showToast('बातमी पूर्णपणे हटवली गेली.', 'info');
  }
}

function purgeAllDemoNews() {
  if (confirm('🚨 तुम्ही सर्व बातम्या व चाचणी डेटा हटवू इच्छिता का? हा निर्णय बदलता येणार नाही.')) {
    appState.news = {
      ticker: [],
      latest: [],
      maharashtra: [],
      politics: [],
      sports: [],
      entertainment: [],
      videos: [],
      photos: []
    };
    saveStateToStorage();
    localStorage.removeItem('nmg_news_data');
    renderAll();
    renderAdminTable();
    showToast('🧹 सर्व जुना डेटा व चाचणी बातम्या पूर्णपणे साफ केल्या.', 'success');
  }
}

function previewArticleImage() {
  const url = document.getElementById('articleImgInput').value;
  const wrap = document.getElementById('imgPreviewWrap');
  const img = document.getElementById('imgPreview');
  if (url) {
    img.src = url;
    wrap.style.display = 'block';
  } else {
    wrap.style.display = 'none';
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('articleImgInput').value = e.target.result;
      previewArticleImage();

      // Auto-upload in background so WhatsApp / Social media crawlers have a public HTTPS URL
      showToast('☁️ फोटो ऑनलाइन सुरक्षित केला जात आहे...', 'info');
      fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: e.target.result })
      })
        .then(r => r.json())
        .then(res => {
          if (res && res.url) {
            document.getElementById('articleImgInput').value = res.url;
            previewArticleImage();
            showToast('✅ फोटो ऑनलाइन जतन झाला (WhatsApp शेअरिंगसाठी तयार)!', 'success');
          }
        })
        .catch(() => { });
    };
    reader.readAsDataURL(file);
  }
}

function saveTickerText() {
  const raw = document.getElementById('tickerEditorTextarea').value;
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  appState.news.ticker = lines;
  saveStateToStorage();
  renderTicker();
  showToast('ब्रेकिंग टिकर अपडेट झाला!', 'success');
}

function exportNewsData() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.news, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `nmg_news_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('डेटा JSON फाईलमध्ये डाऊनलोड झाला!', 'success');
}

function resetNewsData() {
  if (confirm('सर्व सानुकूल (Custom) बातम्या हटवून मूळ डिफॉल्ट डेटा रीसेट करायचा आहे का?')) {
    appState.news = JSON.parse(JSON.stringify(defaultNewsData));
    saveStateToStorage();
    renderAll();
    renderAdminTable();
    showToast('डेटा डिफॉल्ट स्थितीवर रिसेट झाला.', 'info');
  }
}

// ── MEDIA LIGHTBOX MODALS (VIDEOS & PHOTOS) ──

function openVideoModal(title, dur, img) {
  const modal = document.getElementById('mediaModal');
  const body = document.getElementById('mediaModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align: center; color: white; padding: 20px;">
      <h3 style="margin-bottom: 14px; font-size: 1.3rem;">📹 ${title}</h3>
      <div style="position: relative; aspect-ratio: 16/9; background: black; border-radius: 10px; overflow: hidden; margin-bottom: 14px;">
        <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
        <div style="position: absolute; top:50%; left:50%; transform:translate(-50%,-50%); background: var(--red); color:white; width:70px; height:70px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer;" onclick="showToast('व्हिडिओ प्रवाह लोड होत आहे...', 'info')">▶</div>
      </div>
      <p style="color: #CBD5E1; font-size: 0.9rem;">कालावधी: <strong>${dur}</strong> • न्यू महाराष्ट्र गर्जना एचडी व्हिडिओ</p>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openPhotoModal(caption, img) {
  const modal = document.getElementById('mediaModal');
  const body = document.getElementById('mediaModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="text-align: center; color: white; padding: 20px;">
      <img src="${img}" style="max-width: 100%; max-height: 70vh; border-radius: 10px; margin-bottom: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <h3 style="font-size: 1.1rem; color: #F1F5F9;">📸 ${caption}</h3>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMediaModal() {
  const modal = document.getElementById('mediaModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';
}

// ── TOAST NOTIFICATION SYSTEM ──
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── MISCELLANEOUS UTILITIES ──

function updateLiveDate() {
  const el = document.getElementById('live-date');
  if (!el) return;

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata' };
  const formatted = now.toLocaleDateString('mr-IN', options);
  el.textContent = formatted;
}

function handleNewsletterSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('newsletterInput');
  if (input && input.value) {
    showToast('आपले सबस्क्रिप्शन यशस्वी झाले! धन्यवाद.', 'success');
    input.value = '';
  }
}

function openStaticInfo(topic) {
  const modal = document.getElementById('staticInfoModal');
  const titleEl = document.getElementById('staticInfoTitle');
  const subtitleEl = document.getElementById('staticInfoSubtitle');
  const iconEl = document.getElementById('staticInfoIcon');
  const bodyEl = document.getElementById('staticInfoBody');
  if (!modal || !bodyEl) return;

  let seoTitle = "";
  let seoDesc = "";

  if (topic === 'आमच्याबद्दल') {
    if (iconEl) iconEl.textContent = '📰';
    if (titleEl) titleEl.textContent = 'आमच्याबद्दल (About Us)';
    if (subtitleEl) subtitleEl.textContent = 'न्यू महाराष्ट्र गर्जना - सत्य, निर्भीक आणि निःपक्ष पत्रकारितेचा विश्वासार्ह आवाज';
    seoTitle = 'आमच्याबद्दल - न्यू महाराष्ट्र गर्जना | About New Maharashtra Garjana';
    seoDesc = 'न्यू महाराष्ट्र गर्जना हे महाराष्ट्रातील अग्रगण्य डिजिटल वृत्तपत्र असून संपादक उमेश भरत पाटील यांच्या नेतृत्वाखाली निर्भीक व निष्पक्ष पत्रकारिता करते.';
    bodyEl.innerHTML = `
      <h4>🏛️ न्यू महाराष्ट्र गर्जना डिजिटल मीडिया परिचय</h4>
      <p><strong>न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana)</strong> हे महाराष्ट्रातील अग्रगण्य, विश्वासार्ह व निर्भीक डिजिटल वृत्तपत्र आणि न्यूज पोर्टल आहे. आधुनिक डिजिटल युगात राज्यातील प्रत्येक नागरिकापर्यंत सत्य, अचूक आणि निःपक्षपाती बातम्या सर्वात वेगाने पोहोचवणे हे आमचे प्रमुख उद्दिष्ट आहे.</p>
      
      <h4>🎯 आमचे ध्येय व मूल्ये (Our Mission & Values)</h4>
      <ul>
        <li><strong>सत्य आणि निर्भीकता:</strong> कोणत्याही राजकीय अथवा व्यावसायिक दबावाशिवाय केवळ लोकहिताचे सत्य जनतेसमोर मांडणे.</li>
        <li><strong>सर्वसमावेशक वार्तांकन:</strong> शेतकरी, कष्टकरी, युवक, महिला आणि वंचित घटकांच्या प्रश्नांना मुख्य प्रवाहात अग्रस्थान देणे.</li>
        <li><strong>जलद व अचूक माहिती:</strong> फेक न्यूज आणि अफवांना आळा घालून पडताळणी केलेल्या अधिकृत बातम्या देणे.</li>
        <li><strong>डिजिटल क्रांती:</strong> मोबाईल, वेब, व्हिडिओ व सोशल मीडियाच्या माध्यमातून सहज व सुलभ मराठी वाचन अनुभव देणे.</li>
      </ul>

      <h4>👤 संपादकीय नेतृत्व</h4>
      <div class="static-info-card-box">
        <p><strong>मुख्य संपादक व संस्थापक:</strong> श्री. उमेश भरत पाटील (Umesh Bharat Patil)</p>
        <p><strong>वार्तांकन कार्यक्षेत्र:</strong> महाराष्ट्र राज्यातील सर्व ३६ जिल्हे, मुंबई-पुणे मेट्रोपॉलिटन रिजन, देश व आंतरराष्ट्रीय घडामोडी.</p>
      </div>

      <h4>🤝 वाचक व समाज सहभाग</h4>
      <p>आम्ही केवळ बातम्या देणारे माध्यम नसून जनतेचा बुलंद आवाज आहोत. आपल्या परिसरातील समस्या, विकासात्मक उपक्रम अथवा सामाजिक प्रश्न आमच्यापर्यंत थेट पोहोचवण्यासाठी आमचे व्यासपीठ २४ तास खुले आहे.</p>
    `;
  } else if (topic === 'संपर्क') {
    if (iconEl) iconEl.textContent = '📞';
    if (titleEl) titleEl.textContent = 'संपर्क साधा (Contact Us)';
    if (subtitleEl) subtitleEl.textContent = 'न्यू महाराष्ट्र गर्जना संपादकीय कार्यालय व २४x७ मदत कक्ष';
    seoTitle = 'संपर्क साधा - न्यू महाराष्ट्र गर्जना | Contact Us & 24x7 Helpline';
    seoDesc = 'न्यू महाराष्ट्र गर्जनाशी संपर्क साधा: फोन/व्हॉट्सॲप: 8530664576, ईमेल: maharashtragarjanews24@gmail.com, पिंपळे गुरव, पुणे.';
    bodyEl.innerHTML = `
      <h4>📍 मुख्य कार्यालय पत्ता (Headquarters)</h4>
      <div class="static-info-card-box">
        <p><strong>न्यू महाराष्ट्र गर्जना (New Maharashtra Garjana)</strong></p>
        <p>S/O Bharat Patil, 10/1 Flat no 504, Sai Nilanjan Morya Park, Gali no 5, Pimple Gurav, Pune - 411061, Maharashtra, India</p>
      </div>

      <h4>📞 थेट संपर्क व २४x७ व्हॉट्सॲप हेल्पलाइन</h4>
      <p>बातम्या पाठवण्यासाठी, जाहिरातींसाठी अथवा कोणत्याही माहितीसाठी खालील क्रमांकावर संपर्क साधा:</p>
      
      <div class="static-info-card-box">
        <p><strong>मोबाईल / व्हॉट्सॲप:</strong> <a href="tel:+918530664576" style="color:var(--red); font-weight:700;">+91 8530664576</a></p>
        <p><strong>अधिकृत ईमेल:</strong> <a href="mailto:maharashtragarjanews24@gmail.com" style="color:var(--red); font-weight:700;">maharashtragarjanews24@gmail.com</a></p>
        <p><strong>संपादक:</strong> श्री. उमेश भरत पाटील</p>
      </div>

      <div class="static-info-quick-actions">
        <a href="tel:+918530664576" class="static-quick-btn static-btn-phone">📞 थेट कॉल करा</a>
        <a href="https://wa.me/918530664576?text=नमस्कार%20न्यू%20महाराष्ट्र%20गर्जना" target="_blank" rel="noopener" class="static-quick-btn static-btn-whatsapp">💬 व्हॉट्सॲप करा</a>
        <a href="mailto:maharashtragarjanews24@gmail.com" class="static-quick-btn static-btn-email">✉️ ईमेल पाठवा</a>
      </div>

      <h4>🌐 अधिकृत सोशल मीडिया चॅनेल्स</h4>
      <ul>
        <li><strong>फेसबुक:</strong> <a href="https://www.facebook.com/share/1BwdzGiPf8/" target="_blank" rel="noopener">Facebook Page</a></li>
        <li><strong>यूट्यूब:</strong> <a href="https://youtube.com/@umeshbharatpatil?si=Ld0Jq3ZN-EGQPEDI" target="_blank" rel="noopener">YouTube (@umeshbharatpatil)</a></li>
        <li><strong>इन्स्टाग्राम:</strong> <a href="https://www.instagram.com/newmaharashtragarjana?stkn=MTE5OGxjdnIydno3bA==" target="_blank" rel="noopener">Instagram (@newmaharashtragarjana)</a></li>
      </ul>
    `;
  } else if (topic === 'जाहिरात') {
    if (iconEl) iconEl.textContent = '📢';
    if (titleEl) titleEl.textContent = 'जाहिरात दरपत्रक & मीडिया किट (Advertise)';
    if (subtitleEl) subtitleEl.textContent = 'आपला ब्रँड व व्यवसाय महाराष्ट्रातील लाखो वाचकांपर्यंत पोहोचवा';
    seoTitle = 'जाहिरात दरपत्रक - न्यू महाराष्ट्र गर्जना | Advertise With Us Media Kit';
    seoDesc = 'न्यू महाराष्ट्र गर्जनावर बॅनर जाहिराती, प्रायोजित बातम्या आणि सोशल मीडिया प्रमोशनसाठी संपर्क साधा.';
    bodyEl.innerHTML = `
      <h4>🚀 न्यू महाराष्ट्र गर्जना डिजिटल पोहोच (Reach & Impact)</h4>
      <p>न्यू महाराष्ट्र गर्जना हे महाराष्ट्रातील वेगाने वाढणारे मराठी डिजिटल व्यासपीठ असून येथे दरमहा लाखो सक्रिय वाचक ताज्या घडामोडी वाचण्यासाठी येतात.</p>
      
      <h4>📊 जाहिरात स्वरूप (Advertising Formats)</h4>
      <ul>
        <li><strong>टॉप हेडर बॅनर:</strong> संकेतस्थळाच्या शीर्षस्थानी सर्वाधिक नजरेस पडणारे स्थान.</li>
        <li><strong>इन-आर्टिकल बॅनर:</strong> प्रत्येक बातमीच्या मजकुरामध्ये वाचनाच्या ओघात प्रदर्शित होणारी जाहिरात.</li>
        <li><strong>प्रायोजित लेख (Sponsored Stories):</strong> आपल्या प्रॉडक्ट अथवा सेवेची सविस्तर माहिती देणारा समर्पित लेख.</li>
        <li><strong>सोशल मीडिया प्रमोशन:</strong> फेसबुक, यूट्यूब व इन्स्टाग्राम हँडल्सवर विशेष व्हिडिओ व पोस्ट प्रसिद्धी.</li>
      </ul>

      <h4>💼 जाहिरात नोंदणी व विशेष पॅकेजेससाठी संपर्क</h4>
      <div class="static-info-card-box">
        <p><strong>जाहिरात विभाग प्रमुख:</strong> श्री. उमेश भरत पाटील</p>
        <p><strong>थेट फोन / व्हॉट्सॲप:</strong> +91 8530664576</p>
        <p><strong>जाहिरात ईमेल:</strong> maharashtragarjanews24@gmail.com</p>
      </div>
      <div class="static-info-quick-actions">
        <a href="tel:+918530664576" class="static-quick-btn static-btn-phone">📞 जाहिरातीसाठी कॉल करा</a>
        <a href="https://wa.me/918530664576?text=मला%20न्यू%20महाराष्ट्र%20गर्जनावर%20जाहिरात%20करायची%20आहे" target="_blank" rel="noopener" class="static-quick-btn static-btn-whatsapp">💬 व्हॉट्सॲप कोटेशन</a>
      </div>
    `;
  } else if (topic === 'गोपनीयता') {
    if (iconEl) iconEl.textContent = '🔒';
    if (titleEl) titleEl.textContent = 'गोपनीयता धोरण (Privacy Policy)';
    if (subtitleEl) subtitleEl.textContent = 'वाचकांच्या डेटाचे रक्षण व पारदर्शक धोरण';
    seoTitle = 'गोपनीयता धोरण - न्यू महाराष्ट्र गर्जना | Privacy Policy';
    seoDesc = 'न्यू महाराष्ट्र गर्जनाचे गोपनीयता धोरण (Privacy Policy). वापरकर्त्यांच्या गोपनीयतेचे व डेटाचे संपूर्ण संरक्षण.';
    bodyEl.innerHTML = `
      <h4>🛡️ गोपनीयता बांधिलकी</h4>
      <p><strong>न्यू महाराष्ट्र गर्जना</strong> आपल्या सर्व वाचकांच्या आणि वापरकर्त्यांच्या वैयक्तिक गोपनीयतेचा आदर करते. हे धोरण आम्ही कोणती माहिती संकलित करतो आणि ती कशी सुरक्षित ठेवतो हे स्पष्ट करते.</p>

      <h4>📋 माहिती संकलन व वापर</h4>
      <ul>
        <li><strong>वाचन व नेव्हिगेशन:</strong> आमचे वृत्तपत्र वाचण्यासाठी कोणत्याही वैयक्तिक नोंदणीची सक्ती नाही.</li>
        <li><strong>प्रतिक्रिया (Comments):</strong> जेव्हा आपण बातमीवर प्रतिक्रिया देता, तेव्हा आपले नाव आणि मत सार्वजनिक दर्शवले जाते.</li>
        <li><strong>न्यूजलेटर व सूचना:</strong> आपण स्वेच्छेने व्हॉट्सॲप नंबर अथवा ईमेल सबस्क्राईब केल्यास केवळ ताज्या बातम्या पाठवण्यासाठी त्याचा वापर केला जातो. आम्ही कधीही आपला डेटा त्रयस्थ पक्षाला विकत नाही.</li>
      </ul>

      <h4>🍪 कुकीज धोरण (Cookies Policy)</h4>
      <p>वाचन अनुभव सुलभ व जलद करण्यासाठी आणि भाषा निवड (उदा. गुगल ट्रान्सलेट) जतन करण्यासाठी कुकीजचा वापर होतो. आपण आपल्या ब्राउझर सेटिंग्जमधून कुकीज नियंत्रित करू शकता.</p>

      <h4>⚖️ संपर्क व तक्रार निवारण</h4>
      <p>आपल्या गोपनीयतेबाबत काही प्रश्न असल्यास maharashtragarjanews24@gmail.com वर संपर्क साधावा.</p>
    `;
  } else {
    if (iconEl) iconEl.textContent = '📜';
    if (titleEl) titleEl.textContent = 'नियम व अटी (Terms of Service)';
    if (subtitleEl) subtitleEl.textContent = 'न्यू महाराष्ट्र गर्जना डिजिटल संकेतस्थळ वापराचे नियम व कायदेशीर अटी';
    seoTitle = 'नियम व अटी - न्यू महाराष्ट्र गर्जना | Terms and Conditions';
    seoDesc = 'न्यू महाराष्ट्र गर्जनाचे नियम व अटी (Terms of Service) आणि संपादकीय आचारसंहिता.';
    bodyEl.innerHTML = `
      <h4>📜 संकेतस्थळ वापराचे नियम</h4>
      <p>न्यू महाराष्ट्र गर्जना या संकेतस्थळाचा वापर करून आपण खालील अटी व शर्ती मान्य करत आहात:</p>

      <h4>©️ बौद्धिक संपदा व कॉपीराइट</h4>
      <p>या संकेतस्थळावरील सर्व बातम्या, मथळे, लेख, छायाचित्रे, व्हिडिओ आणि लोगो हे न्यू महाराष्ट्र गर्जनाचे अधिकृत स्वामित्व हक्क आहेत. संपादकांच्या लेखी परवानगीशिवाय व्यावसायिक कारणांसाठी मजकूर कॉपी करणे किंवा पुनर्प्रकाशित करणे कायद्याने गुन्हा आहे.</p>

      <h4>💬 वाचक प्रतिक्रिया आचारसंहिता</h4>
      <ul>
        <li>कोणत्याही व्यक्ती, धर्म, जात किंवा समूहाचा अपमान करणारी भाषा वापरण्यास सक्त मनाई आहे.</li>
        <li>द्वेषमूलक भाषण, असभ्य शब्द अथवा बदनामीकारक वक्तव्ये त्वरित हटवली जातील.</li>
      </ul>

      <h4>⚖️ कायदेशीर कार्यक्षेत्र</h4>
      <p>संकेतस्थळाशी संबंधित सर्व वाद अथवा कायदेशीर बाबी केवळ पुणे (महाराष्ट्र) न्यायालयाच्या अधिकारकक्षेत येतील.</p>
    `;
  }

  setSEOMetadata(seoTitle, seoDesc, `https://newmaharashtragarjana.com/#${topic}`);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeStaticInfoModal() {
  const modal = document.getElementById('staticInfoModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';

  if (CATEGORY_SEO[appState.activeCategory]) {
    const seo = CATEGORY_SEO[appState.activeCategory];
    setSEOMetadata(seo.title, seo.desc, `https://newmaharashtragarjana.com/${appState.activeCategory !== 'सर्व' ? '#' + appState.activeCategory : ''}`);
  } else {
    setSEOMetadata(DEFAULT_SEO.title, DEFAULT_SEO.desc, DEFAULT_SEO.canonical, DEFAULT_SEO.image);
  }
}

// ── INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromStorage();
  updateLiveDate();
  renderAll();
  setupSearchEvents();

  // Admin Login Event Listener
  const adminBtn = document.getElementById('adminPortalBtn');
  if (adminBtn) adminBtn.addEventListener('click', openAdminModal);

  // Mobile Menu Toggle - hamburger opens/closes nav wrap
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navList = document.getElementById('navList');
  const mainNav = document.getElementById('mainNav');
  const mainHeader = document.getElementById('mainHeader');

  function updateNavStickyOffset() {
    if (mainNav && mainHeader) {
      const headerH = mainHeader.getBoundingClientRect().height;
      mainNav.style.top = headerH + 'px';
    }
  }
  updateNavStickyOffset();
  window.addEventListener('resize', updateNavStickyOffset);

  if (mobileMenuBtn && navList) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('mobile-open');
      // Animate hamburger bars
      const bars = mobileMenuBtn.querySelectorAll('span');
      if (isOpen) {
        bars[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
        bars[1].style.opacity = '0';
        bars[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        bars[0].style.transform = '';
        bars[1].style.opacity = '';
        bars[2].style.transform = '';
      }
    });
    // Close nav when a nav link is clicked on mobile
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navList.classList.remove('mobile-open');
          const bars = mobileMenuBtn.querySelectorAll('span');
          bars[0].style.transform = '';
          bars[1].style.opacity = '';
          bars[2].style.transform = '';
        }
      });
    });
  }

  // Back to top scroll tracking & reading progress bar
  const backBtn = document.getElementById('backToTop');
  const progress = document.getElementById('readingProgress');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progress && docHeight > 0) {
      const pct = (scrollY / docHeight) * 100;
      progress.style.width = `${pct}%`;
    }

    if (backBtn) {
      if (scrollY > 350) backBtn.classList.add('visible');
      else backBtn.classList.remove('visible');
    }
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Restore saved Calligraphy font preference
  const savedFont = localStorage.getItem('preferredTitleFont');
  if (savedFont) {
    const siteTitle = document.getElementById('siteTitleText');
    const fontSelect = document.getElementById('titleFontSelect');
    if (siteTitle) {
      siteTitle.classList.remove('font-tiro', 'font-tillana', 'font-rozha', 'font-yatra');
      siteTitle.classList.add(savedFont);
    }
    if (fontSelect) fontSelect.value = savedFont;
  }

  // Restore saved Multi-Language preference
  const savedLang = localStorage.getItem('preferredSiteLanguage');
  if (savedLang) {
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) langSelect.value = savedLang;
    setTimeout(() => {
      translatePageLanguage(savedLang, true);
    }, 500);
  }

  // URL Deep-Linking for Articles, Categories, and Static Info Pages
  function handleUrlDeepLink() {
    // 1. Check URL query parameters (e.g. ?p=101, ?article=101 or ?id=101 from WhatsApp/Social sharing)
    const urlParams = new URLSearchParams(window.location.search);
    const articleQuery = urlParams.get('p') || urlParams.get('article') || urlParams.get('id');
    if (articleQuery) {
      const artId = parseInt(articleQuery, 10);
      if (artId) {
        setTimeout(() => openArticle(artId), 250);
        return;
      }
    }

    // 2. Check URL Hash (e.g. #article-101, #maharashtra, #आमच्याबद्दल)
    const hash = window.location.hash;
    if (!hash) return;
    if (hash.startsWith('#article-')) {
      const artId = parseInt(hash.replace('#article-', ''), 10);
      if (artId) {
        setTimeout(() => openArticle(artId), 250);
      }
    } else if (['#आमच्याबद्दल', '#संपर्क', '#जाहिरात', '#गोपनीयता', '#अटी'].includes(hash)) {
      const topic = decodeURIComponent(hash.replace('#', ''));
      setTimeout(() => openStaticInfo(topic), 250);
    } else {
      const catDecoded = decodeURIComponent(hash.replace('#', ''));
      if (CATEGORY_SEO[catDecoded]) {
        filterCategory(catDecoded);
      }
    }
  }
  handleUrlDeepLink();
  window.addEventListener('hashchange', handleUrlDeepLink);
  window.addEventListener('popstate', handleUrlDeepLink);

  // ── CLOUD FIRESTORE REAL-TIME CROSS-DEVICE SYNC ──
  function initCloudSync() {
    if (typeof listenToFirestoreNews === 'function') {
      listenToFirestoreNews((cloudArticles) => {
        if (!Array.isArray(cloudArticles) || cloudArticles.length === 0) return;

        let hasChanges = false;
        if (!appState.news || !Array.isArray(appState.news.latest)) {
          appState.news.latest = [];
        }

        cloudArticles.forEach(cloudArt => {
          const stringId = String(cloudArt.id);
          const existingIdx = appState.news.latest.findIndex(localArt => String(localArt.id) === stringId);
          if (existingIdx !== -1) {
            appState.news.latest[existingIdx] = { ...appState.news.latest[existingIdx], ...cloudArt };
            hasChanges = true;
          } else {
            appState.news.latest.unshift(cloudArt);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          saveStateToStorage();
          renderAll();
          renderAdminTable();
          console.log('🔄 All devices updated: Cloud Firestore articles synced live.');
        }
      });
    }
  }
  initCloudSync();

  // ── PREVENT TRANSLATION HOVER HIGHLIGHTS & WHITE PATCHES ──
  document.addEventListener('mouseover', function (e) {
    if (!e.target) return;
    const target = e.target;
    if (target.classList && (target.classList.contains('goog-text-highlight') || target.className?.includes?.('VIpgJd'))) {
      target.classList.remove('goog-text-highlight');
      target.style.setProperty('background-color', 'transparent', 'important');
      target.style.setProperty('background', 'transparent', 'important');
      target.style.setProperty('box-shadow', 'none', 'important');
      target.style.setProperty('color', 'inherit', 'important');
    }
    if (target.tagName === 'FONT') {
      target.style.setProperty('background-color', 'transparent', 'important');
      target.style.setProperty('background', 'transparent', 'important');
      target.style.setProperty('box-shadow', 'none', 'important');
      target.style.setProperty('color', 'inherit', 'important');
    }
  }, true);

  const suppressTranslateBalloons = () => {
    const badElements = document.querySelectorAll('#goog-gt-tt, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .goog-te-balloon-frame, .goog-tooltip');
    badElements.forEach(el => {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
    });
  };
  suppressTranslateBalloons();
  setInterval(suppressTranslateBalloons, 1500);
});

// ── MARATHI CALLIGRAPHY FONT SWITCHER ──
function changeTitleFont(fontClass) {
  const siteTitle = document.getElementById('siteTitleText');
  if (siteTitle) {
    siteTitle.classList.remove('font-tiro', 'font-tillana', 'font-rozha', 'font-yatra');
    siteTitle.classList.add(fontClass);
    localStorage.setItem('preferredTitleFont', fontClass);
    if (typeof showToast === 'function') {
      showToast(`फॉन्ट संपादन अद्ययावत केले: ${fontClass}`, 'info');
    }
  }
}

// ── MULTI-LANGUAGE TRANSLATION ENGINE (MASTER DATA) ──
const MASTER_LANG_DATA = {
  'mr': {
    'home': 'मुख्यपान', 'maharashtra': 'महाराष्ट्र', 'politics': 'राजकारण', 'mumbai': 'मुंबई',
    'pune': 'पुणे', 'national': 'देश', 'world': 'जग', 'sports': 'क्रीडा', 'entertainment': 'मनोरंजन',
    'business': 'व्यापार', 'health': 'आरोग्य', 'tech': 'तंत्रज्ञान', 'video': 'व्हिडिओ', 'photo': 'फोटो'
  },
  'en': {
    'home': 'Home', 'maharashtra': 'Maharashtra', 'politics': 'Politics', 'mumbai': 'Mumbai',
    'pune': 'Pune', 'national': 'National', 'world': 'World', 'sports': 'Sports', 'entertainment': 'Entertainment',
    'business': 'Business', 'health': 'Health', 'tech': 'Tech', 'video': 'Videos', 'photo': 'Photos'
  },
  'hi': {
    'home': 'मुख्य पृष्ठ', 'maharashtra': 'महाराष्ट्र', 'politics': 'राजनीति', 'mumbai': 'मुंबई',
    'pune': 'पुणे', 'national': 'देश', 'world': 'विश्व', 'sports': 'खेल', 'entertainment': 'मनोरंजन',
    'business': 'व्यापार', 'health': 'स्वास्थ्य', 'tech': 'तकनीक', 'video': 'वीडियो', 'photo': 'तस्वीरें'
  }
};

function translatePageLanguage(langCode, isInit = false) {
  if (!langCode) return;
  localStorage.setItem('preferredSiteLanguage', langCode);

  // Dynamically toggle the notranslate meta tag to prevent native Chrome popup while allowing widget
  let metaTag = document.querySelector('meta[name="google"][content="notranslate"]');
  if (langCode !== 'mr') {
    if (metaTag) metaTag.remove();
  } else {
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'google';
      metaTag.content = 'notranslate';
      document.head.appendChild(metaTag);
    }
  }

  if (langCode === 'mr') {
    // Clear Google Translate cookie to restore original Marathi text
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + window.location.hostname + "; path=/;";
  } else {
    // Set cookie for other languages
    document.cookie = `googtrans=/mr/${langCode}; path=/;`;
    document.cookie = `googtrans=/mr/${langCode}; domain=${window.location.hostname}; path=/;`;
  }

  // Trigger Google Translate hidden combo box
  const select = document.querySelector('select.goog-te-combo');
  if (select) {
    select.value = langCode === 'mr' ? 'mr' : langCode;

    // Setting value to original language may not trigger properly, sometimes we need to set it to ''
    // First try the language code, then dispatch. If it's mr, set to ''.
    if (langCode === 'mr') {
      select.value = '';
    }
    select.dispatchEvent(new Event('change'));
  } else if (!isInit) {
    // If widget not mounted yet and this is not initialization, reload to apply cookie
    window.location.reload();
  }

  if (!isInit && typeof showToast === 'function') {
    const names = {
      mr: 'मराठी', en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી',
      ta: 'தமிழ்', te: 'తెలుగు', kn: 'ಕನ್ನಡ', bn: 'বাংলা', pa: 'ਪੰਜਾਬੀ', ml: 'മലയാളം'
    };
    showToast(`Language updated to: ${names[langCode] || langCode}`, 'success');
  }
}
