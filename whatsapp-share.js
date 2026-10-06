/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Builds the WhatsApp share message (title + link + group + channel + contact)
   and the matching JSON payload.

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template';
    var SITE_BASE = 'https://newmaharashtragarjana.com/';

    // Defaults = the values already present in the admin form (Tab 5 of index.html)
    var DEFAULT_TEMPLATE = {
        groupHeading: 'पुणे पिंपरी चिंचवड शहर जिल्हा ब्रेकिंग न्यूज साठी आजच व्हाट्सएप ग्रुप जॉईन करा',
        groupLink: 'https://whatsapp.com/channel/0029VagqNfx59PwNTUXxto3t',
        channelHeading: 'पुणे पिंपरी चिंचवड ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelFollowText: 'Follow न्यू महाराष्ट्र गर्जना channel on WhatsApp:',
        channelLink: 'https://whatsapp.com/channel/0029VagqNfx59PwNTUXxto3t',
        contactLabel: 'बातम्या जाहिरातींकरता संपर्क:',
        contactPhone: '8530664576'
    };

    // Form field id  ->  template key
    var FIELD_MAP = {
        shareTplGroupHeading: 'groupHeading',
        shareTplGroupLink: 'groupLink',
        shareTplChannelHeading: 'channelHeading',
        shareTplChannelFollowText: 'channelFollowText',
        shareTplChannelLink: 'channelLink',
        shareTplContactPhone: 'contactPhone'
    };

    /* ---------- template storage ---------- */

    function getShareTemplate() {
        try {
            var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            return Object.assign({}, DEFAULT_TEMPLATE, saved);
        } catch (e) {
            return Object.assign({}, DEFAULT_TEMPLATE);
        }
    }

    function saveShareTemplate(tpl) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl));
        // Optional: also push to Firestore so every admin device shares it
        try {
            if (window.db && typeof window.db.collection === 'function') {
                window.db.collection('settings').doc('shareTemplate').set(tpl, { merge: true });
            }
        } catch (e) { /* ignore – localStorage is enough */ }
    }

    // Fills the admin form with saved values
    function loadShareTemplateConfigIntoForm() {
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = tpl[FIELD_MAP[id]] || '';
        });
    }

    // onsubmit="handleSaveShareTemplateConfig(event)" in index.html
    window.handleSaveShareTemplateConfig = function (event) {
        if (event) event.preventDefault();
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) tpl[FIELD_MAP[id]] = el.value.trim();
        });
        saveShareTemplate(tpl);
        if (typeof window.showToast === 'function') {
            window.showToast('✅ शेअर फॉरमॅट सेव्ह झाला.', 'success');
        } else {
            alert('✅ शेअर फॉरमॅट सेव्ह झाला.');
        }
    };

    /* ---------- link + message builders ---------- */

    function getArticleUrl(article) {
        if (article && article.url) return article.url;            // explicit URL wins
        var id = article && (article.id !== undefined ? article.id : '');
        return SITE_BASE + '?p=' + encodeURIComponent(id);         // e.g. https://newmaharashtragarjana.com/?p=9439
    }

    /**
     * Final WhatsApp text. Output looks like:
     *
     *   <Article title>
     *   https://newmaharashtragarjana.com/?p=9439
     *
     *   *<Group heading>*
     *   https://whatsapp.com/channel/...
     *
     *   *<Channel heading>*
     *   Follow न्यू महाराष्ट्र गर्जना channel on WhatsApp: https://whatsapp.com/channel/...
     *
     *   *बातम्या जाहिरातींकरता संपर्क:*
     *   *8530664576*
     */
    function buildShareMessage(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var url = getArticleUrl(article);
        var title = (article && article.title ? String(article.title) : '').trim();

        var blocks = [
            title + '\n' + url,
            '*' + t.groupHeading + '*\n' + t.groupLink,
            '*' + t.channelHeading + '*\n' + t.channelFollowText + ' ' + t.channelLink,
            '*' + t.contactLabel + '*\n*' + t.contactPhone + '*'
        ];
        return blocks.join('\n\n');
    }

    // JSON payload (for logging, API calls, Firestore, or sending to a bot/backend)
    function buildShareJSON(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var message = buildShareMessage(article, t);
        return {
            articleId: article && article.id,
            title: article && article.title,
            url: getArticleUrl(article),
            group: { heading: t.groupHeading, link: t.groupLink },
            channel: { heading: t.channelHeading, followText: t.channelFollowText, link: t.channelLink },
            contact: { label: t.contactLabel, phone: t.contactPhone },
            message: message,
            whatsappUrl: 'https://wa.me/?text=' + encodeURIComponent(message)
        };
    }

    /* ---------- actions ---------- */

    function findArticleById(id) {
        // Search appState first (used by app.js), then fallback globals
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
        var globalList = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < globalList.length; i++) {
            if (String(globalList[i].id) === String(id)) return globalList[i];
        }
        return null;
    }

    // Use anywhere:  onclick="shareOnWhatsApp(123)"  or  shareOnWhatsApp(articleObject)
    window.shareOnWhatsApp = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) {
            if (typeof window.showToast === 'function') {
                window.showToast('माफ करा, बातमी सापडली नाही.', 'warning');
            } else {
                alert('बातमी सापडली नाही.');
            }
            return;
        }
        var payload = buildShareJSON(article);
        window.open(payload.whatsappUrl, '_blank', 'noopener');
        return payload;
    };

    // Also expose as shareNewsImage so app.js 'image'/'poster' platform still works
    window.shareNewsImage = window.shareOnWhatsApp;

    window.copyCaption = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return null;
        var captionText = buildShareMessage(article);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(captionText).then(function () {
                if (typeof window.showToast === 'function') {
                    window.showToast('📋 व्हॉट्सॲप मेसेज आणि लिंक्स कॉपी झाल्या!', 'success');
                }
            });
        }
        return captionText;
    };

    window.copyShareJSON = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        if (navigator.clipboard) navigator.clipboard.writeText(json);
        return json;
    };

    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildShareMessage: buildShareMessage,
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
   USAGE in your article card / reader modal (app.js):

   <button onclick="shareOnWhatsApp(${article.id})">📲 व्हॉट्सॲप शेअर</button>

   Quick test in browser console:
   NMGShare.buildShareMessage({ id: 9439, title: 'जागतिक हृदयदिनी डॉ. मृणाल देशपांडे यांचे ज्येष्ठ नागरिकांना आरोग्यविषयक मार्गदर्शन' })
   ------------------------------------------------------------ */
