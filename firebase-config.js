/**
 * ============================================================================
 * NEW MAHARASHTRA GARJANA - CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION ENGINE
 * Syncs published news across all viewers, mobile phones, laptops & devices.
 * ============================================================================
 */

// 1. YOUR FIREBASE CONFIGURATION
// Replace the values below with your Firebase Project details from:
// https://console.firebase.google.com -> Project Settings -> General -> Your apps -> Web app
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey_ReplaceWithYourFirebaseApiKey",
  authDomain: "new-maharashtra-garjana.firebaseapp.com",
  projectId: "new-maharashtra-garjana",
  storageBucket: "new-maharashtra-garjana.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Check if credentials were saved via Admin UI
try {
  const savedCfg = localStorage.getItem('nmg_firebase_config');
  if (savedCfg) {
    const parsed = JSON.parse(savedCfg);
    if (parsed && parsed.apiKey) {
      Object.assign(firebaseConfig, parsed);
    }
  }
} catch (e) {}

let firestoreDb = null;
let isFirestoreInitialized = false;

function saveFirebaseCredentials(cfg) {
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    alert('कृपया किमान API Key आणि Project ID प्रविष्ट करा.');
    return false;
  }
  localStorage.setItem('nmg_firebase_config', JSON.stringify(cfg));
  alert('✅ Firebase क्रेडेन्शियल्स यशस्वीरीत्या सेव्ह झाले! पेज रीलोड होत आहे...');
  window.location.reload();
  return true;
}

// Check if actual credentials have been entered (not placeholder)
function isFirebaseConfigured() {
  return firebaseConfig.apiKey && 
         !firebaseConfig.apiKey.includes('DummyKey') && 
         firebaseConfig.projectId && 
         firebaseConfig.projectId !== 'new-maharashtra-garjana-dummy';
}

// 2. INITIALIZE FIREBASE & FIRESTORE
try {
  if (typeof firebase !== 'undefined' && isFirebaseConfigured()) {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    firestoreDb = firebase.firestore();
    
    // Enable offline persistence so news is cached locally on reader devices
    firestoreDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
        // Multi-tab or unsupported browser, fallback to normal memory cache
      }
    });

    isFirestoreInitialized = true;
    console.log('✅ Firebase Cloud Firestore initialized successfully.');
  } else {
    console.log('ℹ️ Firebase credentials pending. Falling back to multi-tier cloud sync API.');
  }
} catch (e) {
  console.warn('Firebase initialization error, using serverless fallback:', e);
}

// 3. REALTIME NEWS SYNC - WRITE ARTICLE TO FIRESTORE
async function syncArticleToFirestore(article) {
  if (!article || !article.id) return false;

  const docData = {
    id: String(article.id),
    numericId: Number(article.id) || Date.now(),
    title: article.title || '',
    cat: article.cat || 'महाराष्ट्र',
    desc: article.desc || article.caption || '',
    content: article.content || '',
    author: article.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी',
    time: article.time || new Date().toLocaleDateString('mr-IN'),
    img: article.img || '',
    isHero: Boolean(article.isHero),
    isBreaking: Boolean(article.isBreaking),
    updatedAt: firebase?.firestore?.FieldValue?.serverTimestamp?.() || new Date().toISOString()
  };

  // If Firestore is ready, save directly to Cloud Firestore collection
  if (isFirestoreInitialized && firestoreDb) {
    try {
      await firestoreDb.collection('news_articles').doc(String(article.id)).set(docData, { merge: true });
      console.log(`☁️ Article #${article.id} synced to Cloud Firestore.`);
    } catch (err) {
      console.error('Firestore write error:', err);
    }
  }

  // Also sync to serverless fallback (/api/sync-article) for WhatsApp preview bots
  try {
    fetch('/api/sync-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    }).catch(() => {});
  } catch (e) {}

  return true;
}

// 4. REALTIME NEWS SYNC - DELETE ARTICLE FROM FIRESTORE
async function deleteArticleFromFirestore(articleId) {
  if (!articleId) return;

  if (isFirestoreInitialized && firestoreDb) {
    try {
      await firestoreDb.collection('news_articles').doc(String(articleId)).delete();
      console.log(`🗑️ Article #${articleId} deleted from Cloud Firestore.`);
    } catch (err) {
      console.error('Firestore delete error:', err);
    }
  }
}

// 5. REALTIME LISTENER - PUSH UPDATES TO ALL VIEWERS INSTANTLY
function listenToFirestoreNews(onUpdate) {
  if (isFirestoreInitialized && firestoreDb) {
    try {
      return firestoreDb.collection('news_articles')
        .orderBy('numericId', 'desc')
        .limit(100)
        .onSnapshot((snapshot) => {
          const articles = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            articles.push({
              ...data,
              id: Number(data.numericId || data.id) || data.id
            });
          });
          if (typeof onUpdate === 'function') {
            onUpdate(articles);
          }
        }, (error) => {
          console.warn('Firestore snapshot listener warning:', error);
          fetchServerlessArticlesFallback(onUpdate);
        });
    } catch (e) {
      console.warn('Error attaching Firestore listener:', e);
      fetchServerlessArticlesFallback(onUpdate);
    }
  } else {
    // If Firebase keys are not yet configured, fetch from serverless cloud store
    fetchServerlessArticlesFallback(onUpdate);
  }
  return null;
}

// 6. SERVERLESS CLOUD FALLBACK LOADER
async function fetchServerlessArticlesFallback(callback) {
  try {
    // 1. Try /api/sync-article
    const res = await fetch('/api/sync-article');
    if (res.ok) {
      const store = await res.json();
      const articles = Object.values(store || {}).map(a => ({
        ...a,
        id: Number(a.id) || a.id
      }));
      if (articles.length > 0 && typeof callback === 'function') {
        callback(articles);
        return;
      }
    }
  } catch (e) {}

  try {
    // 2. Try raw GitHub store
    const rawRes = await fetch('https://raw.githubusercontent.com/qiaotech26/New-Maharashtra-Garjana/main/articles_store.json', { cache: 'no-cache' });
    if (rawRes.ok) {
      const store = await rawRes.json();
      const articles = Object.values(store || {}).map(a => ({
        ...a,
        id: Number(a.id) || a.id
      }));
      if (articles.length > 0 && typeof callback === 'function') {
        callback(articles);
      }
    }
  } catch (e) {}
}
