/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana

   Result in WhatsApp (ONE message):
   ┌──────────────────────────────┐
   │   [  Article Photo  ]        │  ← real article image
   ├──────────────────────────────┤
   │  Headline + 🔗 article link  │
   │  WhatsApp group link         │  ← all links are TAPPABLE
   │  WhatsApp channel link       │
   │  Social links (FB/IG/YT/Web) │
   │  Contact + wa.me link        │
   └──────────────────────────────┘

   Mobile  → navigator.share({ files:[image], text:caption })
             → WhatsApp: photo on top, clickable links below (1 message)
   Desktop → image downloads + WhatsApp opens with caption pre-filled

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template_config';
    var SITE_BASE = 'https://newmaharashtragarjana.com/';

    var WA_LINK = 'https://whatsapp.com/channel/0029VagqNfx59PwNTUXxto3t';
    var OLD_LINKS = [
        'https://chat.whatsapp.com/I0UaexFFIbZ06FoHHrvmp3',
        'https://whatsapp.com/channel/0029VazsOCg8KMqs4yeUu50Q',
        'https://whatsapp.com/channel/0029VaqqNfx59PwNTUXxto3t'
    ];

    var DEFAULT_TEMPLATE = {
        groupHeading: 'पुणे पिंपरी चिंचवड शहर जिल्हा ब्रेकिंग न्यूज साठी आजच व्हाट्सएप ग्रुप जॉईन करा',
        groupLink: WA_LINK,
        channelHeading: 'ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelLink: WA_LINK,
        facebookUrl: 'https://www.facebook.com/share/1BwdzGiPf8/',
        instagramUrl: 'https://www.instagram.com/newmaharashtragarjana',
        youtubeUrl: 'https://youtube.com/@umeshbharatpatil',
        websiteUrl: 'https://newmaharashtragarjana.com/',
        contactLabel: 'बातम्या / जाहिरातींकरता संपर्क:',
        contactPhone: '8530664576'
    };

    var FIELD_MAP = {
        shareTplGroupHeading: 'groupHeading',
        shareTplGroupLink: 'groupLink',
        shareTplChannelHeading: 'channelHeading',
        shareTplChannelLink: 'channelLink',
        shareTplFacebookUrl: 'facebookUrl',
        shareTplInstagramUrl: 'instagramUrl',
        shareTplYoutubeUrl: 'youtubeUrl',
        shareTplWebsiteUrl: 'websiteUrl',
        shareTplContactPhone: 'contactPhone'
    };

    /* ─────────────── template storage ─────────────── */

    function getShareTemplate() {
        var saved = {};
        try {
            saved = JSON.parse(
                localStorage.getItem(STORAGE_KEY) ||
                localStorage.getItem('nmg_share_template') || '{}'
            );
        } catch (e) { saved = {}; }
        var tpl = Object.assign({}, DEFAULT_TEMPLATE, saved);
        if (!tpl.groupLink || OLD_LINKS.indexOf(tpl.groupLink.trim()) !== -1) tpl.groupLink = WA_LINK;
        if (!tpl.channelLink || OLD_LINKS.indexOf(tpl.channelLink.trim()) !== -1) tpl.channelLink = WA_LINK;
        return tpl;
    }

    function saveShareTemplate(tpl) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl));
            localStorage.setItem('nmg_share_template', JSON.stringify(tpl));
        } catch (e) { }
        try {
            if (window.db && typeof window.db.collection === 'function') {
                window.db.collection('settings').doc('shareTemplate').set(tpl, { merge: true });
            }
        } catch (e) { }
    }

    function loadShareTemplateConfigIntoForm() {
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = tpl[FIELD_MAP[id]] || '';
        });
    }

    window.handleSaveShareTemplateConfig = function (event) {
        if (event) event.preventDefault();
        var tpl = getShareTemplate();
        Object.keys(FIELD_MAP).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) tpl[FIELD_MAP[id]] = el.value.trim();
        });
        saveShareTemplate(tpl);
        if (typeof window.showToast === 'function') {
            window.showToast('✅ व्हॉट्सॲप शेअर मेसेज फॉरमॅट सेव्ह झाला.', 'success');
        } else {
            alert('✅ शेअर फॉरमॅट सेव्ह झाला.');
        }
    };

    /* ─────────────── article finder ─────────────── */

    function findArticleById(id) {
        if (!id && id !== 0) return null;
        var sid = String(id);
        if (window.appState && window.appState.news) {
            var cats = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
            for (var c = 0; c < cats.length; c++) {
                var list = window.appState.news[cats[c]];
                if (Array.isArray(list)) {
                    for (var j = 0; j < list.length; j++) {
                        if (String(list[j].id) === sid) return list[j];
                    }
                }
            }
        }
        var gl = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < gl.length; i++) {
            if (String(gl[i].id) === sid) return gl[i];
        }
        return null;
    }

    /* ─────────────── URL / caption builders ─────────────── */

    function getArticleUrl(article) {
        if (article && article.url) return article.url;
        var id = article && (article.id !== undefined ? article.id : '');
        return SITE_BASE + '?p=' + encodeURIComponent(id);
    }

    function getImageUrl(article) {
        if (!article) return '';
        return article.image || article.img || article.imageUrl || article.photo || article.thumbnail || '';
    }

    /**
     * buildCaption — full text message with all clickable links.
     * In WhatsApp this appears as the CAPTION below the article photo.
     */
    function buildCaption(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var url = getArticleUrl(article);
        var title = (article && article.title ? String(article.title) : '').trim();

        var rawPhone = t.contactPhone || '8530664576';
        var digits = rawPhone.replace(/\D/g, '');
        if (digits.length === 10) digits = '91' + digits;
        var waMeLink = 'https://wa.me/' + digits;

        var blocks = [title + '\n🔗 पूर्ण बातमी वाचा: ' + url];

        if (t.groupHeading && t.groupLink)
            blocks.push('*' + t.groupHeading + '*\n' + t.groupLink);

        if (t.channelHeading && t.channelLink)
            blocks.push('*' + t.channelHeading + '*\n' + t.channelLink);

        var soc = ['*आम्हाला फॉलो करा:*'];
        if (t.facebookUrl) soc.push('📘 Facebook: ' + t.facebookUrl);
        if (t.instagramUrl) soc.push('📸 Instagram: ' + t.instagramUrl);
        if (t.youtubeUrl) soc.push('▶️ YouTube: ' + t.youtubeUrl);
        if (t.websiteUrl) soc.push('🌐 Website: ' + t.websiteUrl);
        if (soc.length > 1) blocks.push(soc.join('\n'));

        if (t.contactPhone) {
            var lbl = t.contactLabel || 'बातम्या / जाहिरातींकरता संपर्क:';
            blocks.push('*' + lbl + '*\n*' + t.contactPhone + '*  (' + waMeLink + ')');
        }

        return blocks.join('\n\n');
    }

    var buildShareMessage = buildCaption;

    function buildShareJSON(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var caption = buildCaption(article, t);
        var url = getArticleUrl(article);
        var id = article && (article.id !== undefined ? article.id : '');
        return {
            articleId: id,
            title: article && article.title ? article.title : '',
            url: url,
            socialLinks: {
                facebook: t.facebookUrl,
                instagram: t.instagramUrl,
                youtube: t.youtubeUrl,
                website: t.websiteUrl,
                whatsappGroup: t.groupLink,
                whatsappChannel: t.channelLink
            },
            contact: t.contactPhone,
            caption: caption,
            whatsappUrl: 'https://api.whatsapp.com/send?text=' + encodeURIComponent(caption)
        };
    }

    /* ─────────────── Image fetch helper ─────────────── */

    /**
     * Fetches the article image and returns a Blob via callback.
     * Tries canvas (crossOrigin) first, then fetch(), then gives null.
     */
    function fetchArticleImageBlob(article, callback) {
        var src = getImageUrl(article);
        if (!src) { callback(null); return; }

        var img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            try {
                var c = document.createElement('canvas');
                c.width = img.naturalWidth;
                c.height = img.naturalHeight;
                c.getContext('2d').drawImage(img, 0, 0);
                c.toBlob(function (b) { callback(b); }, 'image/jpeg', 0.92);
            } catch (e) {
                // CORS taint — fall back to fetch()
                fetch(src)
                    .then(function (r) { return r.blob(); })
                    .then(function (b) { callback(b); })
                    .catch(function () { callback(null); });
            }
        };

        img.onerror = function () {
            fetch(src)
                .then(function (r) { return r.blob(); })
                .then(function (b) { callback(b); })
                .catch(function () { callback(null); });
        };

        img.src = src;
    }

    /* ─────────────── UI helpers ─────────────── */

    function toast(msg, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type || 'info');
            return;
        }
        var el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText =
            'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);' +
            'background:#111;color:#fff;padding:12px 18px;border-radius:10px;' +
            'z-index:99999;font:600 14px "Noto Sans Devanagari",sans-serif;' +
            'max-width:90%;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.35)';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 4500);
    }

    function downloadBlob(blob, name) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        var ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { }
        ta.remove();
        return Promise.resolve();
    }

    /* ─────────────── MAIN SHARE ACTION ─────────────── */

    /**
     * doShare(article)
     * ─────────────────────────────────────────────────────
     * Sends ONE WhatsApp message structured as:
     *
     *   [Article Photo — top]          ← actual news image
     *   [Caption text  — below]        ← all links, TAPPABLE in WhatsApp
     *
     * Strategy:
     *  1. Fetch article image as Blob.
     *  2. Mobile with Web Share API Level 2:
     *       navigator.share({ files:[imageFile], text:captionText })
     *       → WhatsApp opens compose with image + caption pre-filled
     *       → user taps Send → ONE message (photo + clickable links)
     *  3. Desktop fallback:
     *       • Download article image (user attaches it in WA)
     *       • Open WhatsApp with caption pre-filled
     *       • Caption also copied to clipboard
     */
    function doShare(article) {
        var captionText = buildCaption(article);
        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);
        var fname = 'nmg-news-' + (article.id || 'share') + '.jpg';

        // Copy caption for convenience (desktop paste / fallback)
        copyText(captionText);

        fetchArticleImageBlob(article, function (imgBlob) {

            var imgFile = imgBlob
                ? new File([imgBlob], fname, { type: 'image/jpeg' })
                : null;

            /* ── Path A: Mobile — Web Share API Level 2 ──────────────────────
               Passes the image file AND the caption text together.
               WhatsApp renders this as ONE message:
                 photo on top  +  caption (with tappable links) below.
            ─────────────────────────────────────────────────────────────────── */
            if (imgFile && navigator.canShare && navigator.canShare({ files: [imgFile] }) && navigator.share) {
                navigator.share({
                    files: [imgFile],
                    text: captionText          // ← becomes the photo caption in WhatsApp
                }).then(function () {
                    toast('✅ बातमीचा फोटो व सर्व क्लिकेबल लिंक्स एकत्र शेअर झाल्या!', 'success');
                }).catch(function (err) {
                    if (err && (err.name === 'AbortError' || err.code === 20)) return; // user cancelled
                    // If image+text share fails, try text-only share via native API
                    if (navigator.share) {
                        navigator.share({
                            title: article.title || 'न्यू महाराष्ट्र गर्जना',
                            text: captionText,
                            url: getArticleUrl(article)
                        }).catch(function () { window.open(waUrl, '_blank', 'noopener'); });
                    } else {
                        window.open(waUrl, '_blank', 'noopener');
                    }
                });
                return; // ← stops here on mobile; no second action
            }

            /* ── Path B: Mobile without file share support ────────────────── */
            if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                navigator.share({
                    title: article.title || 'न्यू महाराष्ट्र गर्जना',
                    text: captionText,
                    url: getArticleUrl(article)
                }).catch(function () { window.open(waUrl, '_blank', 'noopener'); });
                return;
            }

            /* ── Path C: Desktop fallback ─────────────────────────────────────
               1. Download the article image.
               2. Open WhatsApp with caption pre-filled.
               User attaches the downloaded image inside WhatsApp and sends
               → one manual step to combine into photo + caption message.
            ─────────────────────────────────────────────────────────────────── */
            if (imgBlob) {
                downloadBlob(imgBlob, fname);
                toast(
                    '📥 फोटो डाउनलोड झाला! WhatsApp मध्ये attach करा — सर्व links clipboard मध्ये आहेत.',
                    'info'
                );
                setTimeout(function () { window.open(waUrl, '_blank', 'noopener'); }, 700);
            } else {
                window.open(waUrl, '_blank', 'noopener');
                toast('✅ व्हॉट्सॲप उघडत आहे — लिंक्स clipboard मध्ये कॉपी आहेत.', 'success');
            }
        });

        return buildShareJSON(article);
    }

    /* ─────────────── Public entry points ─────────────── */

    window.shareDirectWhatsApp = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) {
            toast('माफ करा, बातमी सापडली नाही.', 'warning');
            return;
        }
        return doShare(article);
    };

    window.sharePosterImage = window.shareDirectWhatsApp;  // same unified action
    window.shareNewsImage = window.shareDirectWhatsApp;  // same unified action

    window.shareOnWhatsApp = function (articleOrId) {
        return window.shareDirectWhatsApp(articleOrId);
    };

    /* ─────────────── Caption / JSON copy helpers ─────────────── */

    window.copyCaption = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return null;
        var captionText = buildCaption(article);
        copyText(captionText).then(function () {
            toast('📋 व्हॉट्सॲप मेसेज आणि लिंक्स कॉपी झाल्या!', 'success');
        });
        return captionText;
    };

    window.copyShareCaption = window.copyCaption;

    window.copyShareJSON = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);
        if (!article) return;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        copyText(json).then(function () {
            toast('✅ JSON पेलोड कॉपी झाला!', 'success');
        });
        return json;
    };

    /* ─────────────── Global API ─────────────── */

    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildCaption: buildCaption,
        buildShareMessage: buildCaption,
        buildShareJSON: buildShareJSON,
        getArticleUrl: getArticleUrl,
        shareOnWhatsApp: window.shareOnWhatsApp,
        shareDirectWhatsApp: window.shareDirectWhatsApp,
        sharePosterImage: window.shareDirectWhatsApp,
        shareNewsImage: window.shareDirectWhatsApp,
        copyCaption: window.copyCaption,
        copyShareCaption: window.copyCaption,
        copyShareJSON: window.copyShareJSON
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();
