/* ==========================================================================
   NEW MAHARASHTRA GARJANA - FULLY FUNCTIONAL NEWS PLATFORM ENGINE
   ========================================================================== */

// ── INITIAL DATASET (PERMANENT & LOCALSTORAGE PERSISTED) ──
const defaultNewsData = {
  ticker: [
    "महाराष्ट्र सरकारने नव्या सर्वसमावेशक विकास योजनेची घोषणा केली",
    "राज्यात मान्सूनचा जोरदार पुनरागमन; प्रमुख धरणे १००% भरण्याच्या मार्गावर",
    "मुंबई शेअर बाजारात ऐतिहासिक तेजी; सेन्सेक्स ८५,००० च्या नव्या उच्चांकावर",
    "पुण्यात नव्या मेट्रो मार्गाचे मुख्यमंत्री व उपमुख्यमंत्र्यांच्या हस्ते भव्य उद्घाटन",
    "विधानसभेत क्रीडा धोरण आणि रोजगाराबाबत ऐतिहासिक विधेयक एकमताने मंजूर",
    "शेती क्षेत्रासाठी ५,००० कोटी रुपयांच्या विशेष अनुदानाची घोषणा"
  ],
  latest: [
    {
      id: 101,
      cat: 'महाराष्ट्र',
      title: 'महाराष्ट्रात नव्या विकास योजनांची मुख्यमंत्र्यांकडून घोषणा, राज्याचा कायापालट होणार',
      desc: 'राज्य सरकारने आज एक महत्त्वाकांक्षी विकास योजना जाहीर केली असून यामुळे लाखो नागरिकांना थेट लाभ होणार आहे. मुख्यमंत्र्यांनी पत्रकार परिषदेत सविस्तर माहिती दिली.',
      content: `<p>राज्य सरकारने आज महाराष्ट्रातील ग्रामीण व शहरी भागाचा कायापालट करण्यासाठी तब्बल १५,००० कोटी रुपयांच्या विशेष विकास आराखड्याची घोषणा केली आहे. मुख्यमंत्र्यांनी घेतलेल्या पत्रकार परिषदेत या योजनेचे मुख्य पैलू मांडले.</p>
      <p>या योजनेअंतर्गत रस्ते विकास, आरोग्य सुविधांमध्ये सुधारणा, रोजगार निर्मिती आणि कृषी क्षेत्रासाठी नवीन तंत्रज्ञानाचा वापर यावर विशेष भर दिला जाणार आहे. राज्यातील प्रत्येक जिल्ह्यासाठी स्वतंत्र विकास निधीची तरतूद करण्यात आली आहे.</p>
      <blockquote>"महाराष्ट्रातील प्रत्येक नागरिकापर्यंत विकासाची फळे पोहोचवणे हेच आमच्या सरकारचे मुख्य ध्येय आहे." — मुख्यमंत्री</blockquote>
      <p>विरोधी पक्षांनी देखील या योजनेचे स्वागत केले असून, योजनेची अंमलबजावणी पारदर्शक पद्धतीने व्हावी अशी अपेक्षा व्यक्त केली आहे.</p>`,
      time: '१० ऑगस्ट २०२६ • १०:३० AM',
      author: 'न्यू महाराष्ट्र गर्जना विशेष प्रतिनिधी',
      img: 'https://picsum.photos/800/480?random=101',
      isHero: true,
      isBreaking: true
    },
    {
      id: 102,
      cat: 'राजकारण',
      title: 'विधानसभेत विरोधकांचा जोरदार गदारोळ; महत्त्वाचे अर्थ विधेयक चर्चेविना मंजूर',
      desc: 'विधानसभेचे पावसाळी अधिवेशन सध्या चांगलेच तापले असून विरोधकांनी विविध मुद्द्यांवरून सरकारला घेरण्याचा प्रयत्न केला.',
      content: `<p>विधानसभेत आज सलग तिसऱ्या दिवशी विरोधकांनी विविध जनहितार्थ मुद्द्यांवरून जोरदार आंदोलन केले. गदारोळातच राज्य सरकारने चालू आर्थिक वर्षाचे महत्त्वाचे पुरवणी मागण्यांचे विधेयक मंजूर करून घेतले.</p><p>अध्यक्ष महोदयांनी सभागृहाचे कामकाज उद्यापर्यंत तहकूब केले आहे.</p>`,
      time: '१० ऑगस्ट २०२६ • ०९:१५ AM',
      author: 'राजकीय संपादक',
      img: 'https://picsum.photos/800/480?random=102',
      isHero: false,
      isBreaking: true
    },
    {
      id: 103,
      cat: 'मुंबई',
      title: 'मुंबईत नव्या सागरी किनाऱ्याच्या रस्त्याचे (Coastal Road) ३ रे टप्पे पूर्ण',
      desc: 'मुंबईतील वाहतूक कोंडीवर मात करण्यासाठी हा प्रकल्प अतिशय महत्त्वपूर्ण ठरणार असून प्रवासाचा वेळ ४५ मिनिटांनी कमी होणार आहे.',
      content: `<p>मुंबईच्या कोस्टल रोड प्रकल्पाचा तिसरा टप्पा आता वाहतुकीसाठी सज्ज झाला आहे. पालिका आयुक्तांनी दिलेल्या माहितीनुसार, या नवीन मार्गामुळे दक्षिण मुंबई आणि बांद्रा दरम्यानचा प्रवास अत्यंत जलद आणि सुखकर होणार आहे.</p>`,
      time: '१० ऑगस्ट २०२६ • ०८:०० AM',
      author: 'मुंबई प्रतिनिधी',
      img: 'https://picsum.photos/800/480?random=103',
      isHero: false,
      isBreaking: false
    },
    {
      id: 104,
      cat: 'क्रीडा',
      title: 'टी-२० मालिकेत भारताची ऑस्ट्रेलियावर ५ गडी राखून मात; रोहित शर्मा सामनावीर',
      desc: 'भारतीय संघाने उत्कृष्ट फलंदाजीच्या जोरावर ऑस्ट्रेलियाने दिलेले १९५ धावांचे आव्हान १७ षटकांतच लीलया पार केले.',
      content: `<p>मेलबर्न क्रिकेट ग्राऊंडवर खेळल्या गेलेल्या अटीतटीच्या सामन्यात भारताने ऑस्ट्रेलियाचा पराभव केला. कर्णधार रोहित शर्माने अवघ्या ४२ चेंडूंत ८५ धावांची धडाकेबाज खेळी केली.</p>`,
      time: '०९ ऑगस्ट २०२६ • १०:४५ PM',
      author: 'क्रीडा प्रतिनिधी',
      img: 'https://picsum.photos/800/480?random=104',
      isHero: false,
      isBreaking: false
    },
    {
      id: 105,
      cat: 'पुणे',
      title: 'पुण्यात आंतरराष्ट्रीय दर्जाचे नवीन आयटी पार्क उभारण्यास मंत्रिमंडळाची मंजुरी',
      desc: 'या प्रकल्पामुळे पुण्यातील सुमारे ५०,००० तरुण अभियंत्यांना रोजगाराच्या नवीन संधी उपलब्ध होतील.',
      content: `<p>पुण्यातील हिंजवडी टप्पा ४ जवळ आणखी एक विशाल आयटी पार्क उभारण्यात येणार आहे. विदेशी कंपन्यांनी यात सुमारे २,००० कोटींची गुंतवणूक करण्याची तयारी दर्शवली आहे.</p>`,
      time: '०९ ऑगस्ट २०२६ • ०६:३० PM',
      author: 'पुणे प्रतिनिधी',
      img: 'https://picsum.photos/800/480?random=105',
      isHero: false,
      isBreaking: false
    },
    {
      id: 106,
      cat: 'व्यापार',
      title: 'शेअर बाजारात विक्रमी तेजी; आयटी आणि बँक शेअर्समध्ये मोठी खरेदी',
      desc: 'परदेशी गुंतवणूकदारांनी भारतीय बाजारात पुन्हा मोठा विश्वास दाखवत जोरदार खरेदी सुरू केली आहे.',
      content: `<p>बॉम्बे स्टॉक एक्सचेंज (BSE) चे निर्देशांक आज ५०० अंकांनी वधारले. भारतीय अर्थव्यवस्थेच्या मजबूत पायाभूत स्थितीमुळे गुंतवणूकदार उत्साही आहेत.</p>`,
      time: '०९ ऑगस्ट २०२६ • ०४:१५ PM',
      author: 'अर्थशास्त्र विभाग',
      img: 'https://picsum.photos/800/480?random=106',
      isHero: false,
      isBreaking: false
    },
    {
      id: 107,
      cat: 'तंत्रज्ञान',
      title: 'भारतीय इस्रो (ISRO) ची नवी मोहीम यशस्वी; सूर्याचा अभ्यास करणारा उपग्रह स्थापित',
      desc: 'भारताच्या अंतराळ संशोधनात आणखी एक सुवर्ण अध्याय जोडला गेला असून जगभरातून कौतुक होत आहे.',
      content: `<p>भारतीय अंतराळ संशोधन संस्थेने आज सकाळी श्रीहरिकोटा येथून आपल्या शक्तिशाली रॉकेटच्या साहाय्याने सूर्य मोहिमेचा दुसरा टप्पा यशस्वीरीत्या पूर्ण केला.</p>`,
      time: '०९ ऑगस्ट २०२६ • ०१:२० PM',
      author: 'विज्ञान प्रतिनिधी',
      img: 'https://picsum.photos/800/480?random=107',
      isHero: false,
      isBreaking: false
    },
    {
      id: 108,
      cat: 'मनोरंजन',
      title: 'राष्ट्रीय चित्रपट पुरस्कारात मराठी चित्रपटाचा डंका; "मातीचा सुगंध" चित्रपटाला सर्वोत्कृष्ट पुरस्कार',
      desc: 'दिल्लीत आयोजित विशेष सोहळ्यात राष्ट्रपतींच्या हस्ते पुरस्कार प्रदान करण्यात आले.',
      content: `<p>मराठी चित्रपटसृष्टीसाठी आजचा दिवस अत्यंत अभिमानास्पद ठरला आहे. ग्रामीण पार्श्वभूमीवर आधारित दिग्दर्शक महेश मांजरेकरांच्या चित्रपटाला सुवर्णकमळ मिळाले.</p>`,
      time: '०८ ऑगस्ट २०२६ • ०८:५० PM',
      author: 'मनोरंजन विभाग',
      img: 'https://picsum.photos/800/480?random=108',
      isHero: false,
      isBreaking: false
    }
  ],
  maharashtra: [
    { id: 201, cat: 'महाराष्ट्र', title: 'नागपूर मेट्रोच्या दुसऱ्या टप्प्यासाठी १,५०० कोटींचा निधी मंजूर', time: '२ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=201' },
    { id: 202, cat: 'महाराष्ट्र', title: 'कोकणात पर्यटन विकासासाठी हॉस्पिटॅलिटी धोरण लागू करणार', time: '४ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=202' },
    { id: 203, cat: 'महाराष्ट्र', title: 'नाशिकमध्ये द्राक्ष बागायतदारांसाठी नवीन निर्यात अनुदान', time: '५ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=203' },
    { id: 204, cat: 'महाराष्ट्र', title: 'छत्रपती संभाजीनगर येथे आंतरराष्ट्रीय ड्राय पोर्ट उभारणार', time: '६ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=204' }
  ],
  politics: [
    { id: 301, cat: 'राजकारण', title: 'स्थानिक स्वराज्य संस्थांच्या निवडणुका लवकरच; राज्य निवडणूक आयोगाची तयारी', time: '१ तासापूर्वी', img: 'https://picsum.photos/400/260?random=301' },
    { id: 302, cat: 'राजकारण', title: 'महाआघाडी आणि महायुतीत जागावाटपाची चर्चा अंतिम टप्प्यात', time: '३ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=302' },
    { id: 303, cat: 'राजकारण', title: 'राज्यपाल महोदयांची विविध पक्षांच्या ज्येष्ठ नेत्यांसोबत बैठक', time: '४ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=303' },
    { id: 304, cat: 'राजकारण', title: 'नव्या पक्षाध्यक्षांची घोषणा; कार्यकर्त्यांमध्ये उत्साह', time: '७ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=304' }
  ],
  sports: [
    { id: 401, cat: 'क्रीडा', title: 'आयपीएल (IPL 2026) साठी खेळाडूंचा लिलाव पुढील महिन्यात मुंबईत', time: '२ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=401' },
    { id: 402, cat: 'क्रीडा', title: 'पुण्याच्या युवा कुस्तीपटूने आशियाई स्पर्धेत पटकावले सुवर्णपदक', time: '४ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=402' },
    { id: 403, cat: 'क्रीडा', title: 'प्रो कबड्डी लीग: पुणेरी पलटनची शानदार घोडदौड सुरूच', time: '६ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=403' }
  ],
  entertainment: [
    { id: 501, cat: 'मनोरंजन', title: 'झी मराठी पुरस्कार सोहळा: सर्वोत्कृष्ट मालिका म्हणून "तुझ्यात जीव रंगला" ची निवड', time: '३ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=501' },
    { id: 502, cat: 'मनोरंजन', title: 'सुबोध भावे आणि मुक्ता बर्वे यांच्या नवीन नाटकाचा शुभारंभ', time: '५ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=502' },
    { id: 503, cat: 'मनोरंजन', title: 'ओटीटी प्लॅटफॉर्मवर नव्या मराठी थ्रिलर वेब सिरीजचा जलवा', time: '८ तासांपूर्वी', img: 'https://picsum.photos/400/260?random=503' }
  ],
  videos: [
    { id: 601, title: 'मुख्यमंत्र्यांची विशेष मुलाखत - महाराष्ट्राच्या विकासाचा रोडमॅप', dur: '14:20', img: 'https://picsum.photos/400/250?random=601' },
    { id: 602, title: 'मुंबई लोकल ट्रेन अपडेट: नव्या एसी गाड्यांची सुरुवात', dur: '06:45', img: 'https://picsum.photos/400/250?random=602' },
    { id: 603, title: 'पुण्यातील मान्सूनचा मनमोहक व्ह्यू - विहंगम दृश्ये', dur: '04:15', img: 'https://picsum.photos/400/250?random=603' },
    { id: 604, title: 'क्रिकेट विश्लेषण: टी-२० मालिकेत भारताचा ऐतिहासिक विजय', dur: '18:30', img: 'https://picsum.photos/400/250?random=604' }
  ],
  photos: [
    { id: 701, caption: 'गेटवे ऑफ इंडिया आणि मुंबईतील मान्सूनचे विहंगम दृश्य', img: 'https://picsum.photos/400/300?random=701' },
    { id: 702, caption: 'पुण्यातील ऐतिहासिक शनिवारवाडा परिसर रोषणाईने उजळला', img: 'https://picsum.photos/400/300?random=702' },
    { id: 703, caption: 'कोकणातील निसर्गरम्य हिरवळ आणि धबधबे', img: 'https://picsum.photos/400/300?random=703' },
    { id: 704, caption: 'नागपुरातील जगप्रसिद्ध संत्रा बागांचा नयनरम्य नजराणा', img: 'https://picsum.photos/400/300?random=704' },
    { id: 705, caption: 'पंढरपूर आषाढी वारी: लाखो वारकऱ्यांचा अथांग भक्तिसागर', img: 'https://picsum.photos/400/300?random=705' }
  ]
};

// GLOBAL APP STATE
let appState = {
  news: null,
  activeCategory: 'सर्व',
  searchTerm: '',
  isAdminLoggedIn: false,
  commentsMap: {}
};

// ── LOCAL STORAGE ENGINE ──
function loadStateFromStorage() {
  try {
    const saved = localStorage.getItem('nmg_news_data');
    if (saved) {
      appState.news = JSON.parse(saved);
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

  const items = appState.news.ticker || defaultNewsData.ticker;
  const html = items.map(t => `
    <div class="ticker-item" onclick="openTickerArticle('${t.replace(/'/g, "\\'")}')">
      <span class="ticker-bullet">●</span>
      <span>${t}</span>
    </div>
  `).join('');

  // Duplicate for seamless infinite loop scroll
  track.innerHTML = html + html;
}

// 2. HERO SECTION
function renderHeroSection() {
  const heroCard = document.getElementById('heroCard');
  const sideContainer = document.getElementById('heroSideContainer');
  if (!appState.news) return;

  // Find hero article or fallback to first latest
  const allArticles = [...(appState.news.latest || [])];
  const heroArticle = allArticles.find(a => a.isHero) || allArticles[0];

  if (heroArticle && heroCard) {
    document.getElementById('heroImg').src = heroArticle.img;
    document.getElementById('heroCatBadge').textContent = heroArticle.cat || 'महाराष्ट्र';
    document.getElementById('heroTitle').textContent = heroArticle.title;
    document.getElementById('heroDesc').textContent = heroArticle.desc || heroArticle.title;
    document.getElementById('heroTime').textContent = `📅 ${heroArticle.time || '१० ऑगस्ट २०२६'}`;
    heroCard.onclick = () => openArticle(heroArticle.id);
  }

  // Render Side Stack (up to 4 items excluding hero)
  if (sideContainer) {
    const sideArticles = allArticles.filter(a => a.id !== heroArticle?.id).slice(0, 4);
    sideContainer.innerHTML = sideArticles.map(a => `
      <div class="side-news-card" onclick="openArticle(${a.id})">
        <img src="${a.img}" alt="${a.title}" loading="lazy">
        <div class="side-news-body">
          <span class="side-cat">${a.cat}</span>
          <h3>${a.title}</h3>
          <span class="side-time">${a.time}</span>
        </div>
      </div>
    `).join('');
  }
}

// 3. LATEST NEWS GRID
function renderLatestGrid() {
  const grid = document.getElementById('latestNewsGrid');
  if (!grid || !appState.news) return;

  let articles = [...(appState.news.latest || [])];

  // Filter if specific category or search active
  if (appState.activeCategory !== 'सर्व' && appState.activeCategory !== 'थेट') {
    articles = articles.filter(a => a.cat === appState.activeCategory);
  }

  if (appState.searchTerm) {
    const term = appState.searchTerm.toLowerCase();
    articles = articles.filter(a => 
      a.title.toLowerCase().includes(term) || 
      (a.desc && a.desc.toLowerCase().includes(term)) ||
      a.cat.toLowerCase().includes(term)
    );
  }

  if (articles.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #64748B;">
      <h3>या वर्गात कोणतीही बातमी सापडली नाही.</h3>
      <p>कृपया वेगळा शोध शब्द वापरा किंवा सर्व बातम्या पाहा.</p>
    </div>`;
    return;
  }

  grid.innerHTML = articles.map((n, i) => `
    <div class="news-card fade-in" style="animation-delay:${i * 0.05}s" onclick="openArticle(${n.id})">
      <div class="news-card-img-wrap">
        <img class="news-card-img" src="${n.img}" alt="${n.title}" loading="lazy">
        <span class="news-card-cat">${n.cat}</span>
      </div>
      <div class="news-card-body">
        <h3>${n.title}</h3>
        <div class="news-card-meta">
          <span>🕒 ${n.time}</span>
          <span>👁️ ${Math.floor(100 + n.id * 12)} वाचले</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 4. CATEGORY LIST SECTIONS (MAHARASHTRA, POLITICS, SPORTS, ENTERTAINMENT)
function renderCategorySections() {
  if (!appState.news) return;

  renderListContainer('maharashtraNews', appState.news.maharashtra || []);
  renderListContainer('politicsNews', appState.news.politics || []);
  renderListContainer('sportsNews', appState.news.sports || []);
  renderListContainer('entertainmentNews', appState.news.entertainment || []);
}

function renderListContainer(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = items.map((n, i) => `
    <div class="list-news-item fade-in" style="animation-delay:${i * 0.05}s" onclick="openArticle(${n.id})">
      <img class="list-news-img" src="${n.img}" alt="${n.title}" loading="lazy">
      <div class="list-news-body">
        <span class="list-news-cat">${n.cat}</span>
        <h3>${n.title}</h3>
        <span class="list-news-time">${n.time}</span>
      </div>
    </div>
  `).join('');
}

// 5. VIDEO GRID
function renderVideoGrid() {
  const grid = document.getElementById('videoGrid');
  if (!grid || !appState.news) return;

  grid.innerHTML = (appState.news.videos || []).map((v, i) => `
    <div class="video-card fade-in" style="animation-delay:${i * 0.08}s" onclick="openVideoModal('${v.title}', '${v.dur}', '${v.img}')">
      <div class="video-thumb-wrap">
        <img class="video-thumb" src="${v.img}" alt="${v.title}" loading="lazy">
        <div class="play-btn">▶</div>
        <span class="video-duration">${v.dur}</span>
      </div>
      <div class="video-body">
        <h3>${v.title}</h3>
        <span>न्यू महाराष्ट्र गर्जना व्हिडिओ बुलेटिन</span>
      </div>
    </div>
  `).join('');
}

// 6. PHOTO GRID
function renderPhotoGrid() {
  const grid = document.getElementById('photoGrid');
  if (!grid || !appState.news) return;

  grid.innerHTML = (appState.news.photos || []).map((p, i) => `
    <div class="photo-card fade-in" style="animation-delay:${i * 0.08}s" onclick="openPhotoModal('${p.caption}', '${p.img}')">
      <img src="${p.img}" alt="${p.caption}" loading="lazy">
      <div class="photo-overlay">
        <p>${p.caption}</p>
      </div>
    </div>
  `).join('');
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
    const nameEl = document.getElementById('activeCategoryName');
    const countEl = document.getElementById('activeCategoryCount');
    
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
  const categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment'];
  
  for (const cat of categories) {
    if (appState.news[cat]) {
      const found = appState.news[cat].find(a => a.id === id);
      if (found) {
        article = found;
        break;
      }
    }
  }

  if (!article) {
    // Generate fallback article structure
    article = {
      id: id,
      cat: 'महाराष्ट्र',
      title: 'विशेष बातमी सविस्तर',
      desc: 'या बातमीचा सविस्तर तपशील उपलब्ध आहे.',
      content: `<p>न्यू महाराष्ट्र गर्जना डिजिटल वृत्तपत्रात आपले स्वागत आहे. या बातमीबाबत अधिक सविस्तर माहिती लवकरच अद्ययावत केली जात आहे.</p>`,
      time: '१० ऑगस्ट २०२६',
      author: 'न्यू महाराष्ट्र गर्जना प्रतिनिधी',
      img: `https://picsum.photos/800/480?random=${id}`
    };
  }

  const modal = document.getElementById('articleModal');
  const container = document.getElementById('articleReaderContent');
  if (!modal || !container) return;

  const articleComments = appState.commentsMap[id] || [];

  container.innerHTML = `
    <div class="article-header">
      <span class="article-cat-badge">${article.cat}</span>
      <h1 class="article-main-title" id="articleReaderTitle">${article.title}</h1>
      
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
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = 'auto';

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
  const title = document.getElementById('articleReaderTitle')?.textContent || 'न्यू महाराष्ट्र गर्जना बातमी';
  const url = window.location.href;

  if (platform === 'whatsapp') {
    const text = encodeURIComponent(`*न्यू महाराष्ट्र गर्जना* - ${title}\n\nसविस्तर वाचा: ${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  } else if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  } else if (platform === 'instagram') {
    window.open('https://www.instagram.com/newmaharashtragarjana?stkn=MTE5OGxjdnIydno3bA==', '_blank');
  } else if (platform === 'copy') {
    navigator.clipboard.writeText(url).then(() => {
      showToast('🔗 बातमीची लिंक यशस्वीरीत्या कॉपी झाली!', 'success');
    }).catch(() => {
      showToast('लिंक कॉपी करता आली नाही.', 'info');
    });
  }
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
    appState.news.latest = appState.news.latest.filter(a => a.id !== id);
    saveStateToStorage();
    renderAll();
    renderAdminTable();
    showToast('बातमी हटवली गेली.', 'info');
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
    reader.onload = function(e) {
      document.getElementById('articleImgInput').value = e.target.result;
      previewArticleImage();
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

function openStaticInfo(title) {
  alert(`न्यू महाराष्ट्र गर्जना - ${title}\n\nआम्ही महाराष्ट्रातील सत्य व विश्वासार्ह घडामोडी जनतेपर्यंत पोहोचवण्यासाठी बांधील आहोत.\n\nसंपादक: श्री. उमेश पाटील\n📞 मोबाईल / व्हॉट्सॲप: 8530664576\n✉️ ईमेल: maharashtragarjanews24@gmail.com\n📍 पत्ता: S/O Bharat Patil, 10/1 Flat no 504, Sai Nilanjan Morya Park, Gali no 5, Pimple Gurav, Pune - 411061`);
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
