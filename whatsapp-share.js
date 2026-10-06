/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Shares the NEWS PHOTO + caption (links) as ONE WhatsApp message.

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>

   Use on a button:  onclick="shareOnWhatsApp(123)"   or   shareOnWhatsApp(articleObject)
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template';
    var SITE_BASE = 'https://newmaharashtragarjana.com/';
    var WA_LINK = 'https://whatsapp.com/channel/0029VagqNfx59PwNTUXxto3t';

    // Old / wrong links that must never be used (ignored if found in saved settings)
    var OLD_LINKS = [
        'https://chat.whatsapp.com/I0UaexFFIbZ06FoHHrvmp3',
        'https://whatsapp.com/channel/0029VazsOCg8KMqs4yeUu50Q',
        'https://whatsapp.com/channel/0029VaqqNfx59PwNTUXxto3t'
    ];

    var DEFAULT_TEMPLATE = {
        groupHeading: 'पुणे पिंपरी चिंचवड शहर जिल्हा ब्रेकिंग न्यूज साठी आजच व्हाट्सएप ग्रुप जॉईन करा',
        groupLink: WA_LINK,
        channelHeading: 'पुणे पिंपरी चिंचवड ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelFollowText: 'Follow न्यू महाराष्ट्र गर्जना channel on WhatsApp:',
        channelLink: WA_LINK,
        contactLabel: 'बातम्या जाहिरातींकरता संपर्क:',
        contactPhone: '8530664576',
        includeSocial: false,
        facebook: 'https://www.facebook.com/share/1BwdzGiPf8/',
        instagram: 'https://www.instagram.com/newmaharashtragarjana',
        youtube: 'https://youtube.com/@umeshbharatpatil',
        website: 'https://newmaharashtragarjana.com/'
    };

    // Admin form field id -> template key
    var FIELD_MAP = {
        shareTplGroupHeading: 'groupHeading',
        shareTplGroupLink: 'groupLink',
        shareTplChannelHeading: 'channelHeading',
        shareTplChannelFollowText: 'channelFollowText',
        shareTplChannelLink: 'channelLink',
        shareTplContactPhone: 'contactPhone'
    };

    /* ---------------- template storage ---------------- */

    function getShareTemplate() {
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { saved = {}; }
        var tpl = Object.assign({}, DEFAULT_TEMPLATE, saved);
        // Ignore old/wrong saved links — always force the correct channel link
        if (OLD_LINKS.indexOf(tpl.groupLink) !== -1) tpl.groupLink = DEFAULT_TEMPLATE.groupLink;
        if (OLD_LINKS.indexOf(tpl.channelLink) !== -1) tpl.channelLink = DEFAULT_TEMPLATE.channelLink;
        return tpl;
    }

    function saveShareTemplate(tpl) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl));
        try {
            if (window.db && typeof window.db.collection === 'function') {
                window.db.collection('settings').doc('shareTemplate').set(tpl, { merge: true });
            }
        } catch (e) { /* localStorage is enough */ }
    }

    function loadShareTemplateConfigIntoForm() {
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = tpl[FIELD_MAP[id]] || '';
        });
    }

    // <form onsubmit="handleSaveShareTemplateConfig(event)"> in index.html
    window.handleSaveShareTemplateConfig = function (event) {
        if (event) event.preventDefault();
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) tpl[FIELD_MAP[id]] = el.value.trim();
        });
        saveShareTemplate(tpl);
        toast('✅ शेअर फॉरमॅट सेव्ह झाला.');
    };

    /* ---------------- caption + JSON ---------------- */

    function getArticleUrl(article) {
        if (article && article.url) return article.url;
        return SITE_BASE + '?p=' + encodeURIComponent(article ? article.id : '');
    }

    function buildCaption(article, override) {
        var t = Object.assign({}, getShareTemplate(), override || {});
        var title = (article && article.title ? String(article.title) : '').trim();

        var blocks = [
            title + '\n🔗 पूर्ण बातमी वाचा: ' + getArticleUrl(article),
            '*' + t.groupHeading + '*\n' + t.groupLink,
            '*' + t.channelHeading + '*\n' + t.channelFollowText + '\n' + t.channelLink
        ];

        if (t.includeSocial) {
            blocks.push(
                '*आम्हाला फॉलो करा:*\n' +
                '📘 Facebook: ' + t.facebook + '\n' +
                '📸 Instagram: ' + t.instagram + '\n' +
                '▶️ YouTube: ' + t.youtube + '\n' +
                '🌐 Website: ' + t.website
            );
        }

        blocks.push('*' + t.contactLabel + '*\n*' + t.contactPhone + '*');
        return blocks.join('\n\n');
    }

    // Alias so app.js buildShareMessage calls still work
    var buildShareMessage = buildCaption;

    function buildShareJSON(article, override) {
        var t = Object.assign({}, getShareTemplate(), override || {});
        var caption = buildCaption(article, t);
        return {
            articleId: article && article.id,
            title: article && article.title,
            url: getArticleUrl(article),
            image: getImageUrl(article),
            group: { heading: t.groupHeading, link: t.groupLink },
            channel: { heading: t.channelHeading, followText: t.channelFollowText, link: t.channelLink },
            socialLinks: { facebook: t.facebook, instagram: t.instagram, youtube: t.youtube, website: t.website },
            contact: { label: t.contactLabel, phone: t.contactPhone },
            caption: caption,
            whatsappUrl: 'https://wa.me/?text=' + encodeURIComponent(caption)
        };
    }

    /* ---------------- image helpers ---------------- */

    function getImageUrl(article) {
        if (!article) return '';
        return article.image || article.img || article.imageUrl || article.photo || article.thumbnail || '';
    }

    // Load any image URL → JPEG Blob (safe for WhatsApp)
    function imageToJpegBlob(src) {
        return new Promise(function (resolve, reject) {
            if (!src) return reject(new Error('no image'));
            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                try {
                    var maxW = 1280;
                    var w = img.naturalWidth, h = img.naturalHeight;
                    if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
                    var c = document.createElement('canvas');
                    c.width = w; c.height = h;
                    var ctx = c.getContext('2d');
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(0, 0, w, h);
                    ctx.drawImage(img, 0, 0, w, h);
                    c.toBlob(function (b) { b ? resolve(b) : reject(new Error('blob failed')); }, 'image/jpeg', 0.9);
                } catch (e) { reject(e); }
            };
            img.onerror = function () { reject(new Error('image load failed')); };
            img.src = src;
        });
    }

    // Fallback plain fetch if canvas is CORS-blocked
    function fetchBlob(src) {
        return fetch(src, { mode: 'cors' }).then(function (r) {
            if (!r.ok) throw new Error('fetch failed');
            return r.blob();
        });
    }

    function getImageBlob(article) {
        var src = getImageUrl(article);
        return imageToJpegBlob(src).catch(function () { return fetchBlob(src); });
    }

    function imageToBlobPng(jpegBlob, cb) {
        var url = URL.createObjectURL(jpegBlob);
        var img = new Image();
        img.onload = function () {
            var c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            c.toBlob(function (b) { URL.revokeObjectURL(url); cb(b); }, 'image/png');
        };
        img.src = url;
    }

    /* ---------------- UI helpers ---------------- */

    function toast(msg) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, 'info');
            return;
        }
        var el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;' +
            'padding:12px 18px;border-radius:10px;z-index:99999;font:600 14px "Noto Sans Devanagari",sans-serif;' +
            'max-width:90%;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.35)';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 4500);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        ta.remove();
        return Promise.resolve();
    }

    function downloadBlob(blob, name) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }

    function findArticleById(id) {
        // Search appState first (used by app.js)
        if (window.appState && window.appState.news) {
            var cats = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
            for (var c = 0; c < cats.length; c++) {
                var list = window.appState.news[cats[c]];
                if (Array.isArray(list)) {
                    for (var j = 0; j < list.length; j++) {
                        if (String(list[j].id) === String(id)) return list[j];
                    }
                }
            }
        }
        // Fallback globals
        var globalList = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < globalList.length; i++) {
            if (String(globalList[i].id) === String(id)) return globalList[i];
        }
        return null;
    }

    /* ---------------- MAIN: share news photo + caption as ONE message ---------------- */

    window.shareOnWhatsApp = async function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) { toast('बातमी सापडली नाही.'); return; }

        var caption = buildCaption(article);
        var blob = null;
        try { blob = await getImageBlob(article); } catch (e) { blob = null; }

        var file = blob ? new File([blob], 'news-' + article.id + '.jpg', { type: 'image/jpeg' }) : null;

        // 1) Mobile: one single message = news photo on top + caption (links) below
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file], text: caption });   // ONLY files + text (no title/url)
                return buildShareJSON(article);
            } catch (e) {
                if (e && e.name === 'AbortError') return;                  // user cancelled — do nothing
                // Non-abort error → fall through to desktop fallback
            }
        }

        // 2) Desktop / unsupported fallback: copy caption + download image, open WhatsApp Web
        await copyText(caption);
        var copiedImage = false;
        if (blob && window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
            try {
                var png = await new Promise(function (res) { imageToBlobPng(blob, res); });
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
                copiedImage = true;
            } catch (e) { copiedImage = false; }
        }
        if (blob && !copiedImage) downloadBlob(blob, 'news-' + article.id + '.jpg');

        window.open('https://web.whatsapp.com/', '_blank', 'noopener');
        toast('फोटो व कॅप्शन कॉपी झाले – व्हॉट्सॲपमध्ये आधी फोटो पेस्ट करा, नंतर कॅप्शन पेस्ट करा');
        return buildShareJSON(article);
    };

    // Alias: app.js calls NMGShare.shareNewsImage for 'image'/'poster' platform
    window.shareNewsImage = window.shareOnWhatsApp;

    // 📋 Copy caption only (no image sharing)
    window.copyCaption = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return null;
        var captionText = buildCaption(article);
        copyText(captionText).then(function () {
            toast('📋 व्हॉट्सॲप मेसेज आणि लिंक्स कॉपी झाल्या!');
        });
        return captionText;
    };

    // Alias for button: onclick="copyShareCaption(id)"
    window.copyShareCaption = window.copyCaption;

    // Copy full JSON payload
    window.copyShareJSON = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        copyText(json).then(function () { toast('✅ JSON पेलोड कॉपी झाला!'); });
        return json;
    };

    // Global namespace — matches what app.js expects
    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildShareMessage: buildShareMessage,   // alias → buildCaption
        buildCaption: buildCaption,
        buildShareJSON: buildShareJSON,
        getArticleUrl: getArticleUrl,
        shareOnWhatsApp: window.shareOnWhatsApp,
        shareNewsImage: window.shareNewsImage,
        copyCaption: window.copyCaption,
        copyShareJSON: window.copyShareJSON
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();

/* ------------------------------------------------------------
   Button examples in article card / reader modal (app.js):

   <button onclick="shareOnWhatsApp(${article.id})">📲 व्हॉट्सॲप शेअर</button>
   <button onclick="copyShareCaption(${article.id})">📋 कॅप्शन कॉपी करा</button>

   Include social links in caption (Facebook / Instagram / YouTube / Website):
   localStorage.setItem('nmg_share_template', JSON.stringify({ includeSocial: true }))
   ------------------------------------------------------------ */
