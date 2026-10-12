/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Builds WhatsApp share image card + clickable caption text message
   with Web Share API Level 2 and Desktop fallback.

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

    // Default share template matching Admin Tab 5 defaults
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

    // Form field id -> template key
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

    /* ---------- template storage ---------- */

    function getShareTemplate() {
        var saved = {};
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || localStorage.getItem('nmg_share_template') || '{}');
        } catch (e) {
            saved = {};
        }
        var tpl = Object.assign({}, DEFAULT_TEMPLATE, saved);
        if (!tpl.groupLink || OLD_LINKS.indexOf(tpl.groupLink.trim()) !== -1) {
            tpl.groupLink = WA_LINK;
        }
        if (!tpl.channelLink || OLD_LINKS.indexOf(tpl.channelLink.trim()) !== -1) {
            tpl.channelLink = WA_LINK;
        }
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

    /* ---------- article finder ---------- */

    function findArticleById(id) {
        if (!id && id !== 0) return null;
        var stringId = String(id);

        if (window.appState && window.appState.news) {
            var categories = ['latest', 'maharashtra', 'politics', 'sports', 'entertainment', 'videos', 'photos'];
            for (var c = 0; c < categories.length; c++) {
                var list = window.appState.news[categories[c]];
                if (Array.isArray(list)) {
                    for (var j = 0; j < list.length; j++) {
                        if (String(list[j].id) === stringId) return list[j];
                    }
                }
            }
        }

        var globalList = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < globalList.length; i++) {
            if (String(globalList[i].id) === stringId) return globalList[i];
        }

        return null;
    }

    /* ---------- link + message builders ---------- */

    function getArticleUrl(article) {
        if (article && article.url) return article.url;
        var id = article && (article.id !== undefined ? article.id : '');
        return SITE_BASE + '?p=' + encodeURIComponent(id);
    }

    function getImageUrl(article) {
        if (!article) return '';
        return article.image || article.img || article.imageUrl || article.photo || article.thumbnail || '';
    }

    function buildCaption(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var url = getArticleUrl(article);
        var title = (article && article.title ? String(article.title) : '').trim();

        var rawPhone = t.contactPhone || '8530664576';
        var cleanDigits = rawPhone.replace(/\D/g, '');
        if (cleanDigits.length === 10) cleanDigits = '91' + cleanDigits;
        var waMeLink = 'https://wa.me/' + cleanDigits;

        var blocks = [
            title + '\n🔗 पूर्ण बातमी वाचा: ' + url
        ];

        if (t.groupHeading && t.groupLink) {
            blocks.push('*' + t.groupHeading + '*\n' + t.groupLink);
        }

        if (t.channelHeading && t.channelLink) {
            blocks.push('*' + t.channelHeading + '*\n' + t.channelLink);
        }

        var socialLines = ['*आम्हाला फॉलो करा:*'];
        if (t.facebookUrl) socialLines.push('📘 Facebook: ' + t.facebookUrl);
        if (t.instagramUrl) socialLines.push('📸 Instagram: ' + t.instagramUrl);
        if (t.youtubeUrl) socialLines.push('▶️ YouTube: ' + t.youtubeUrl);
        if (t.websiteUrl) socialLines.push('🌐 Website: ' + t.websiteUrl);
        if (socialLines.length > 1) {
            blocks.push(socialLines.join('\n'));
        }

        if (t.contactPhone) {
            var label = t.contactLabel || 'बातम्या / जाहिरातींकरता संपर्क:';
            blocks.push('*' + label + '*\n*' + t.contactPhone + '*  (' + waMeLink + ')');
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

    /* ---------- Canvas Share Card Poster Generator ---------- */

    function wrapText(ctx, text, maxWidth) {
        var words = text.split(/\s+/);
        var lines = [], cur = '';
        words.forEach(function (w) {
            var test = cur ? cur + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && cur) {
                lines.push(cur);
                cur = w;
            } else {
                cur = test;
            }
        });
        if (cur) lines.push(cur);
        return lines;
    }

    /**
     * Generates ONLY the branded NMG info/text card (no article image embedded).
     * callback(blob, dataUrl)
     */
    function generateShareCardCanvas(article, callback) {
        var t = getShareTemplate();

        // Card is info-panel only — full height
        var W = 1080, H = 540;

        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        // Dark background
        ctx.fillStyle = '#0E1A2B';
        ctx.fillRect(0, 0, W, H);

        // Red top accent bar
        ctx.fillStyle = '#B80F0A';
        ctx.fillRect(0, 0, W, 7);

        // Gold divider line
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, 7, W, 3);

        var pad = 38;
        var maxW = W - pad * 2;
        var y = 60;

        // Article title
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px "Noto Sans Devanagari", Arial, sans-serif';
        var titleLines = wrapText(ctx, article.title || '', maxW);
        titleLines.slice(0, 3).forEach(function (line) {
            ctx.fillText(line, pad, y);
            y += 48;
        });
        y += 8;

        // Article URL
        var articleUrl = getArticleUrl(article);
        ctx.fillStyle = '#60A5FA';
        ctx.font = '22px "Courier New", monospace';
        ctx.fillText('\uD83D\uDD17 ' + articleUrl, pad, y);
        y += 44;

        // Separator
        ctx.strokeStyle = '#1E3A5F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pad, y);
        ctx.lineTo(W - pad, y);
        ctx.stroke();
        y += 28;

        // WhatsApp Channel Call to Action
        ctx.fillStyle = '#4ADE80';
        ctx.font = 'bold 24px "Noto Sans Devanagari", Arial, sans-serif';
        var t2 = getShareTemplate();
        var grpLines = wrapText(ctx, '\uD83D\uDCF2 ' + t2.groupHeading, maxW);
        grpLines.slice(0, 2).forEach(function (line) {
            ctx.fillText(line, pad, y);
            y += 32;
        });
        ctx.fillStyle = '#86EFAC';
        ctx.font = '21px "Courier New", monospace';
        ctx.fillText(t2.channelLink, pad, y);
        y += 40;

        // Contact Info
        ctx.fillStyle = '#FCD34D';
        ctx.font = 'bold 26px "Noto Sans Devanagari", Arial, sans-serif';
        ctx.fillText('\uD83D\uDCDE ' + (t2.contactLabel || '') + '  ' + t2.contactPhone, pad, y);

        // Branding footer
        ctx.fillStyle = '#64748B';
        ctx.font = '18px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('\u0928\u094D\u092F\u0942 \u092E\u0939\u093E\u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0917\u0930\u094D\u091C\u0928\u093E  |  newmaharashtragarjana.com', W / 2, H - 18);
        ctx.textAlign = 'left';

        canvas.toBlob(function (b) {
            callback(b, canvas.toDataURL('image/jpeg', 0.93));
        }, 'image/jpeg', 0.93);
    }

    /**
     * Fetches the article image URL and returns it as a Blob via callback.
     * callback(blob)  —  blob may be null if the image is unavailable or CORS-blocked.
     */
    function fetchArticleImageBlob(article, callback) {
        var src = getImageUrl(article);
        if (!src) { callback(null); return; }

        // Try canvas-based fetch (handles crossOrigin gracefully)
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
            // Try fetch as last resort
            fetch(src)
                .then(function (r) { return r.blob(); })
                .then(function (b) { callback(b); })
                .catch(function () { callback(null); });
        };
        img.src = src;
    }

    /* ---------- UI helpers ---------- */

    function toast(msg, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(msg, type || 'info');
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

    /* ---------- MAIN SHARE ACTIONS ---------- */

    // 1. Direct WhatsApp Share: Opens WhatsApp with full text, all links, and auto-rich preview image
    window.shareDirectWhatsApp = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);

        if (!article) {
            toast('माफ करा, बातमी सापडली नाही.', 'warning');
            return;
        }

        var captionText = buildCaption(article);

        // Always copy caption to clipboard for immediate convenience
        copyText(captionText);

        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);

        // On mobile, if navigator.share is available without file restrictions, try native text share
        var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobile && navigator.share && !navigator.canShare) {
            navigator.share({
                title: article.title || 'न्यू महाराष्ट्र गर्जना',
                text: captionText,
                url: getArticleUrl(article)
            }).catch(function () {
                window.open(waUrl, '_blank');
            });
            return;
        }

        window.open(waUrl, '_blank', 'noopener');
        toast('✅ व्हॉट्सॲप उघडत आहे... बातमीची लिंक व सर्व माहिती तयार आहे!', 'success');
        return buildShareJSON(article);
    };

    // 2. Poster Image Share: Branded info card (image 1) + raw article image (image 2)
    window.sharePosterImage = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);

        if (!article) {
            toast('माफ करा, बातमी सापडली नाही.', 'warning');
            return;
        }

        var captionText = buildCaption(article);

        // Pre-copy caption text so user can easily paste if WhatsApp drops intent text
        copyText(captionText);
        toast('\uD83D\uDCCB बातमीचा मेसेज व सर्व लिंक्स कॉपी झाल्या! फोटो शेअर होत आहे...', 'info');

        // Step 1: Generate branded info-card (image 1)
        generateShareCardCanvas(article, function (cardBlob) {

            // Step 2: Fetch the raw article image as a second separate image
            fetchArticleImageBlob(article, function (articleImgBlob) {

                var cardFile = cardBlob
                    ? new File([cardBlob], 'nmg-card-' + article.id + '.jpg', { type: 'image/jpeg' })
                    : null;

                var articleFile = articleImgBlob
                    ? new File([articleImgBlob], 'news-image-' + article.id + '.jpg', { type: 'image/jpeg' })
                    : null;

                // Build file list: [branded card, article image]
                // Article image comes SECOND so it appears as the second image in WhatsApp
                var files = [];
                if (cardFile) files.push(cardFile);
                if (articleFile) files.push(articleFile);

                // 1. Mobile Web Share API Level 2 with files support
                if (files.length > 0 && navigator.canShare && navigator.canShare({ files: files }) && navigator.share) {
                    navigator.share({
                        files: files,
                        title: article.title || '\u0928\u094D\u092F\u0942 \u092E\u0939\u093E\u0930\u093E\u0937\u094D\u091F\u094D\u0930 \u0917\u0930\u094D\u091C\u0928\u093E',
                        text: captionText
                    }).then(function () {
                        toast('\u2705 \u092C\u093E\u0924\u092E\u0940\u091A\u093E \u092B\u094B\u091F\u094B \u0935 \u0932\u093F\u0902\u0915 \u092F\u0936\u0938\u094D\u0935\u0940\u0930\u0940\u0924\u094D\u092F\u093E \u0936\u0947\u0905\u0930 \u091D\u093E\u0932\u0940!', 'success');
                    }).catch(function (err) {
                        if (err && (err.name === 'AbortError' || err.code === 20)) {
                            return; // User cancelled
                        }
                        fallbackDesktopShare(cardBlob, articleImgBlob, article, captionText);
                    });
                    return;
                }

                // 2. Desktop or unsupported file sharing fallback
                fallbackDesktopShare(cardBlob, articleImgBlob, article, captionText);
            });
        });

        return buildShareJSON(article);
    };

    // 3. Unified WhatsApp Share: defaults to Direct WhatsApp with rich preview and links
    window.shareOnWhatsApp = function (articleOrId, mode) {
        if (mode === 'poster' || mode === 'image') {
            return window.sharePosterImage(articleOrId);
        }
        return window.shareDirectWhatsApp(articleOrId);
    };

    function fallbackDesktopShare(cardBlob, articleImgBlob, article, captionText) {
        // a) Download branded info card (image 1)
        if (cardBlob) {
            downloadBlob(cardBlob, 'nmg-card-' + article.id + '.jpg');
        }

        // b) Download the raw article image (image 2)
        if (articleImgBlob) {
            setTimeout(function () {
                downloadBlob(articleImgBlob, 'news-image-' + article.id + '.jpg');
            }, 400); // slight delay so browser doesn't block second download
        }

        // c) Open wa.me link with encoded caption text
        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);
        setTimeout(function () {
            window.open(waUrl, '_blank', 'noopener');
        }, 800);

        // d) Marathi guidance toast
        toast('\uD83D\uDCF7 \u0622\uCE34\u09CB\u0924\u094D\u0930 \u092B\u094B\u091F\u094B (\u0915\u093E\u0930\u094D\u0921 + \u092C\u093E\u0924\u092E\u0940 \u091A\u093F\u0924\u094D\u0930) \u0921\u093E\u0909\u0928\u0932\u094B\u0921 \u091D\u093E\u0932\u0947 \u0906\u0923\u093F \u0932\u093F\u0902\u0915\u094D\u0938 \u0935\u094D\u0939\u093E\u0911\u091F\u094D\u0938\u0910\u092A\u092E\u0927\u094D\u092F\u0947 \u091C\u094B\u0921\u0932\u094D\u092F\u093E \u0906\u0939\u0947\u0924!', 'info');
    }

    window.shareNewsImage = window.sharePosterImage;

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

    /* ---------- Export Global API ---------- */

    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildCaption: buildCaption,
        buildShareMessage: buildCaption,
        buildShareJSON: buildShareJSON,
        getArticleUrl: getArticleUrl,
        shareOnWhatsApp: window.shareOnWhatsApp,
        shareDirectWhatsApp: window.shareDirectWhatsApp,
        sharePosterImage: window.sharePosterImage,
        shareNewsImage: window.sharePosterImage,
        copyCaption: window.copyCaption,
        copyShareCaption: window.copyCaption,
        copyShareJSON: window.copyShareJSON
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();
