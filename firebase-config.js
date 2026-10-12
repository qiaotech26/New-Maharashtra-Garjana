/**
 * ============================================================================
 * NEW MAHARASHTRA GARJANA - CLOUD FIRESTORE REAL-TIME SYNCHRONIZATION ENGINE
 * Syncs published news across all viewers, mobile phones, laptops & devices.
 * ============================================================================
 */

// 1. YOUR FIREBASE CONFIGURATION
// Project: newmaharashtragarjan (Project Number: 916193008761)
const firebaseConfig = {
  apiKey: "AIzaSyCfpS92nkZt5K0062DwJCpLEuq_jFmEc_I",
  authDomain: "newmaharashtragarjan.firebaseapp.com",
  projectId: "newmaharashtragarjan",
  storageBucket: "newmaharashtragarjan.firebasestorage.app",
  messagingSenderId: "916193008761",
  appId: "1:916193008761:web:4b90aefc79a6a48da288a8",
  measurementId: "G-Y477NEWLJ8"
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
} catch (e) { }

let firestoreDb = null;
let isFirestoreInitialized = false;

function saveFirebaseCredentials(cfg) {
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    if (typeof showToast === 'function') {
      showToast('कृपया किमान API Key आणि Project ID प्रविष्ट करा.', 'warning');
    } else {
      alert('कृपया किमान API Key आणि Project ID प्रविष्ट करा.');
    }
    return false;
  }
  try {
    localStorage.setItem('nmg_firebase_config', JSON.stringify(cfg));
  } catch (e) { }

  if (typeof showToast === 'function') {
    showToast('✅ Firebase क्रेडेन्शियल्स यशस्वीरीत्या सेव्ह झाले! थेट कनेक्ट करत आहे...', 'success');
  } else {
    alert('✅ Firebase क्रेडेन्शियल्स यशस्वीरीत्या सेव्ह झाले!');
  }

  // Attempt dynamic re-init
  initFirebase();
  return true;
}

// Check if actual credentials have been entered (not placeholder)
function isFirebaseConfigured() {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes('DummyKey') &&
    firebaseConfig.projectId &&
    firebaseConfig.projectId !== 'new-maharashtra-garjana-dummy'
  );
}

// 2. INITIALIZE FIREBASE & FIRESTORE
function initFirebase() {
  try {
    // Re-check localStorage
    const savedCfg = localStorage.getItem('nmg_firebase_config');
    if (savedCfg) {
      const parsed = JSON.parse(savedCfg);
      if (parsed && parsed.apiKey) {
        Object.assign(firebaseConfig, parsed);
      }
    }

    if (typeof firebase !== 'undefined' && isFirebaseConfigured()) {
      if (!firebase.apps || !firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      firestoreDb = firebase.firestore();
      window.db = firestoreDb; // CRITICAL: Expose for whatsapp-share.js

      // Enable offline persistence so news is cached locally on reader devices
      firestoreDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
        if (err.code === 'failed-precondition' || err.code === 'unimplemented') {
          // Multi-tab or unsupported browser, fallback to normal memory cache
        }
      });

      isFirestoreInitialized = true;
      console.log('✅ Firebase Cloud Firestore initialized successfully.');
      return true;
    } else {
      console.log('ℹ️ Firebase credentials pending. Falling back to multi-tier cloud sync API.');
      return false;
    }
  } catch (e) {
    console.warn('Firebase initialization error, using serverless fallback:', e);
    return false;
  }
}

// Auto-run initFirebase
initFirebase();

// 3. FIRESTORE HEALTH CHECK & DIAGNOSTICS
async function testFirestoreConnection() {
  if (!isFirestoreInitialized || !firestoreDb) {
    initFirebase();
  }
  if (!firestoreDb) {
    return {
      ok: false,
      status: 'unconfigured',
      message: 'Firebase SDK अद्याप सुरू झालेले नाही. कृपया API Key आणि Project ID तपासा.'
    };
  }

  try {
    const snap = await firestoreDb.collection('news_articles').limit(5).get();
    return {
      ok: true,
      status: 'connected',
      count: snap.size,
      message: `Cloud Firestore थेट कनेक्टेड आहे (${snap.size} बातम्या उपलब्ध).`
    };
  } catch (err) {
    console.warn('Firestore connection test note:', err);
    let errMsg = err.message || '';
    let isApiDisabled = errMsg.includes('has not been used') || errMsg.includes('disabled') || err.code === 'permission-denied' || errMsg.includes('PERMISSION_DENIED');
    return {
      ok: false,
      status: isApiDisabled ? 'api_disabled' : 'error',
      code: err.code || 'UNKNOWN',
      rawMessage: errMsg,
      message: isApiDisabled
        ? '⚠️ Cloud Firestore API चालू नाही किंवा Database तयार केलेले नाही. Firebase Console (console.firebase.google.com) वर जाऊन Firestore Database "Create" करा व Rules मध्ये "allow read, write: if true;" सेट करा.'
        : `⚠️ Firestore त्रुटी: ${errMsg}`
    };
  }
}

// 4. REALTIME NEWS SYNC - WRITE ARTICLE TO FIRESTORE & SERVERLESS BACKUP
async function syncArticleToFirestore(article) {
  if (!article || !article.id) return { success: false, error: 'No article data' };

  const docId = String(article.id);
  const docData = {
    id: docId,
    numericId: Number(article.numericId || article.id) || Date.now(),
    title: article.title || '',
    cat: article.cat || 'महाराष्ट्र',
    desc: article.desc || article.caption || '',
    content: article.content || '',
    author: article.author || 'न्यू महाराष्ट्र गर्जना प्रतिनिधी',
    time: article.time || new Date().toLocaleDateString('mr-IN'),
    img: article.img || '',
    isHero: Boolean(article.isHero),
    isBreaking: Boolean(article.isBreaking),
    updatedAt: (typeof firebase !== 'undefined' && firebase.firestore?.FieldValue?.serverTimestamp)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString()
  };

  let firestoreSuccess = false;
  let firestoreErrorMsg = null;

  // Step 1: Write directly to Cloud Firestore collection if available
  if (isFirestoreInitialized && firestoreDb) {
    try {
      await firestoreDb.collection('news_articles').doc(docId).set(docData, { merge: true });
      firestoreSuccess = true;
      console.log(`☁️ Article #${docId} synced to Cloud Firestore.`);
    } catch (err) {
      firestoreErrorMsg = err.message || 'Firestore write rejected';
      console.warn('Firestore write warning:', err);
    }
  }

  // Step 2: ALWAYS sync to Serverless Store (/api/sync-article) for persistence & WhatsApp preview bots
  let serverlessSuccess = false;
  try {
    const apiRes = await fetch('/api/sync-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData)
    });
    if (apiRes.ok) {
      serverlessSuccess = true;
      console.log(`⚡ Article #${docId} synced to Serverless API.`);
    }
  } catch (e) { }

  return {
    success: firestoreSuccess || serverlessSuccess,
    firestore: firestoreSuccess,
    serverless: serverlessSuccess,
    error: firestoreErrorMsg
  };
}

// 5. REALTIME NEWS SYNC - DELETE ARTICLE FROM FIRESTORE
async function deleteArticleFromFirestore(articleId) {
  if (!articleId) return;
  const docId = String(articleId);

  if (isFirestoreInitialized && firestoreDb) {
    try {
      await firestoreDb.collection('news_articles').doc(docId).delete();
      console.log(`🗑️ Article #${docId} deleted from Cloud Firestore.`);
    } catch (err) {
      console.warn('Firestore delete error:', err);
    }
  }

  try {
    fetch('/api/sync-article', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: docId, action: 'delete' })
    }).catch(() => { });
  } catch (e) { }
}

// 6. REALTIME LISTENER - PUSH UPDATES TO ALL VIEWERS INSTANTLY
let fallbackPollInterval = null;

function listenToFirestoreNews(onUpdate) {
  if (!isFirestoreInitialized) {
    initFirebase();
  }

  if (isFirestoreInitialized && firestoreDb) {
    try {
      const unsubscribe = firestoreDb.collection('news_articles')
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
          if (articles.length > 0 && typeof onUpdate === 'function') {
            onUpdate(articles);
          }
        }, (error) => {
          console.warn('Firestore snapshot listener warning:', error);
          fetchServerlessArticlesFallback(onUpdate);
          startFallbackPolling(onUpdate);
        });

      return unsubscribe;
    } catch (e) {
      console.warn('Error attaching Firestore listener:', e);
      fetchServerlessArticlesFallback(onUpdate);
      startFallbackPolling(onUpdate);
    }
  } else {
    // If Firebase keys are not yet configured or pending, fetch from serverless cloud store
    fetchServerlessArticlesFallback(onUpdate);
    startFallbackPolling(onUpdate);
  }
  return null;
}

function startFallbackPolling(onUpdate) {
  if (fallbackPollInterval) return;
  // Poll fallback API every 25 seconds so all devices stay in sync even without Firestore
  fallbackPollInterval = setInterval(() => {
    fetchServerlessArticlesFallback(onUpdate);
  }, 25000);
}

// 7. SERVERLESS CLOUD FALLBACK LOADER
async function fetchServerlessArticlesFallback(callback) {
  if (typeof callback !== 'function') return;

  try {
    // 1. Try /api/sync-article
    const res = await fetch('/api/sync-article');
    if (res.ok) {
      const store = await res.json();
      let articles = Array.isArray(store)
        ? store
        : Object.values(store || {});
      articles = articles.map(a => ({
        ...a,
        id: Number(a.numericId || a.id) || a.id
      }));
      // Sort newest first
      articles.sort((a, b) => (Number(b.numericId || b.id) || 0) - (Number(a.numericId || a.id) || 0));
      if (articles.length > 0) {
        callback(articles);
        return;
      }
    }
  } catch (e) { }

  try {
    // 2. Try local news_data.json
    const localRes = await fetch('news_data.json');
    if (localRes.ok) {
      const localData = await localRes.json();
      if (localData && Array.isArray(localData.latest) && localData.latest.length > 0) {
        callback(localData.latest);
        return;
      }
    }
  } catch (e) { }

  try {
    // 3. Try raw GitHub store
    const rawRes = await fetch('https://raw.githubusercontent.com/qiaotech26/New-Maharashtra-Garjana/main/articles_store.json', { cache: 'no-cache' });
    if (rawRes.ok) {
      const store = await rawRes.json();
      let articles = Array.isArray(store)
        ? store
        : Object.values(store || {});
      articles = articles.map(a => ({
        ...a,
        id: Number(a.numericId || a.id) || a.id
      }));
      articles.sort((a, b) => (Number(b.numericId || b.id) || 0) - (Number(a.numericId || a.id) || 0));
      if (articles.length > 0) {
        callback(articles);
      }
    }
  } catch (e) { }
}

// Expose on global window scope
window.initFirebase = initFirebase;
window.saveFirebaseCredentials = saveFirebaseCredentials;
window.isFirebaseConfigured = isFirebaseConfigured;
window.testFirestoreConnection = testFirestoreConnection;
window.syncArticleToFirestore = syncArticleToFirestore;
window.deleteArticleFromFirestore = deleteArticleFromFirestore;
window.listenToFirestoreNews = listenToFirestoreNews;
window.fetchServerlessArticlesFallback = fetchServerlessArticlesFallback;

