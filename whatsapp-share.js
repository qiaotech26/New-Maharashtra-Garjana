/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Generates a combined POSTER (news photo on top + info panel below)
   and shares it as ONE single WhatsApp image message.

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template';
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
        channelHeading: 'पुणे पिंपरी चिंचवड ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelFollowText: 'Follow न्यू महाराष्ट्र गर्जना channel on WhatsApp:',
        channelLink: WA_LINK,
        contactLabel: 'बातम्या जाहिरातींकरता संपर्क:',
        contactPhone: '8530664576'
    };

    var FIELD_MAP = {
        shareTplGroupHeading: 'groupHeading',
        shareTplGroupLink: 'groupLink',
        shareTplChannelHeading: 'channelHeading',
        shareTplChannelFollowText: 'channelFollowText',
        shareTplChannelLink: 'channelLink',
        shareTplContactPhone: 'contactPhone'
    };

    /* ── template storage ── */

    function getShareTemplate() {
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { saved = {}; }
        var tpl = Object.assign({}, DEFAULT_TEMPLATE, saved);
        if (OLD_LINKS.indexOf(tpl.groupLink) !== -1) tpl.groupLink = WA_LINK;
        if (OLD_LINKS.indexOf(tpl.channelLink) !== -1) tpl.channelLink = WA_LINK;
        return tpl;
    }

    function saveShareTemplate(tpl) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl));
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
        toast('✅ शेअर फॉरमॅट सेव्ह झाला.');
    };

    /* ── helpers ── */

    function getArticleUrl(article) {
        if (article && article.url) return article.url;
        return SITE_BASE + '?p=' + encodeURIComponent(article ? article.id : '');
    }

    function getImageUrl(article) {
        if (!article) return '';
        return article.image || article.img || article.imageUrl || article.photo || article.thumbnail || '';
    }

    function buildCaption(article, override) {
        var t = Object.assign({}, getShareTemplate(), override || {});
        var title = (article && article.title ? String(article.title) : '').trim();
        var blocks = [
            title + '\n🔗 पूर्ण बातमी वाचा: ' + getArticleUrl(article),
            '*' + t.groupHeading + '*\n' + t.groupLink,
            '*' + t.channelHeading + '*\n' + t.channelFollowText + '\n' + t.channelLink,
            '*' + t.contactLabel + '*\n*' + t.contactPhone + '*'
        ];
        return blocks.join('\n\n');
    }

    var buildShareMessage = buildCaption; // alias for app.js

    function buildShareJSON(article, override) {
        var t = Object.assign({}, getShareTemplate(), override || {});
        var caption = buildCaption(article, t);
        return {
            articleId: article && article.id,
            title: article && article.title,
            url: getArticleUrl(article),
            image: getImageUrl(article),
            caption: caption,
            whatsappUrl: 'https://wa.me/?text=' + encodeURIComponent(caption)
        };
    }

    /* ── canvas poster: news photo ON TOP + info panel BELOW = ONE image ── */

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

    function generateCombinedPosterBlob(article) {
        return new Promise(function (resolve) {
            var t = getShareTemplate();
            var src = getImageUrl(article);

            var W = 1080, H = 1350;           // 4:5 — perfect for WhatsApp/Stories
            var imgH = Math.round(H * 0.60); // top 60 % = news photo
            var infoY = imgH;
            var infoH = H - imgH;            // bottom 40 % = info panel

            var canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            var ctx = canvas.getContext('2d');

            function drawInfoPanel() {
                /* ── dark background ── */
                ctx.fillStyle = '#0E1A2B';
                ctx.fillRect(0, infoY, W, infoH);

                /* ── red top accent bar ── */
                ctx.fillStyle = '#B80F0A';
                ctx.fillRect(0, infoY, W, 7);

                /* ── gold divider ── */
                ctx.fillStyle = '#F59E0B';
                ctx.fillRect(0, infoY + 7, W, 3);

                var pad = 38;
                var maxW = W - pad * 2;
                var y = infoY + 44;

                /* ── article title ── */
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.font = 'bold 34px "Noto Sans Devanagari", Arial, sans-serif';
                var titleLines = wrapText(ctx, article.title || '', maxW);
                titleLines.slice(0, 2).forEach(function (line) {
                    ctx.fillText(line, pad, y);
                    y += 44;
                });

                /* ── article URL ── */
                var articleUrl = getArticleUrl(article);
                ctx.fillStyle = '#60A5FA';
                ctx.font = '22px "Courier New", monospace';
                ctx.fillText('🔗 ' + articleUrl, pad, y + 6);
                y += 40;

                /* ── separator ── */
                ctx.strokeStyle = '#1E3A5F';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(pad, y + 8);
                ctx.lineTo(W - pad, y + 8);
                ctx.stroke();
                y += 28;

                /* ── WhatsApp channel block ── */
                ctx.fillStyle = '#4ADE80';
                ctx.font = 'bold 24px "Noto Sans Devanagari", Arial, sans-serif';
                var grpLines = wrapText(ctx, '📲 ' + t.groupHeading, maxW);
                grpLines.slice(0, 2).forEach(function (line) {
                    ctx.fillText(line, pad, y);
                    y += 32;
                });
                ctx.fillStyle = '#86EFAC';
                ctx.font = '21px "Courier New", monospace';
                ctx.fillText(t.channelLink, pad, y);
                y += 36;

                /* ── contact ── */
                ctx.fillStyle = '#FCD34D';
                ctx.font = 'bold 28px "Noto Sans Devanagari", Arial, sans-serif';
                ctx.fillText('📞 ' + t.contactLabel + '  ' + t.contactPhone, pad, y);

                /* ── branding footer ── */
                ctx.fillStyle = '#64748B';
                ctx.font = '18px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('न्यू महाराष्ट्र गर्जना  |  newmaharashtragarjana.com', W / 2, H - 18);
                ctx.textAlign = 'left';

                canvas.toBlob(function (b) { resolve(b); }, 'image/jpeg', 0.93);
            }

            if (!src) {
                /* no image – fill with solid gradient and draw info */
                var grad = ctx.createLinearGradient(0, 0, 0, imgH);
                grad.addColorStop(0, '#0F172A');
                grad.addColorStop(1, '#1E3A5F');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, imgH);
                drawInfoPanel();
                return;
            }

            var img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function () {
                /* cover-fit the news photo into the top section */
                var aspect = img.naturalWidth / img.naturalHeight;
                var targetAspect = W / imgH;
                var rw, rh, rx, ry;
                if (aspect > targetAspect) {
                    rh = imgH; rw = imgH * aspect;
                    rx = -(rw - W) / 2; ry = 0;
                } else {
                    rw = W; rh = W / aspect;
                    rx = 0; ry = -(rh - imgH) / 2;
                }
                ctx.save();
                ctx.rect(0, 0, W, imgH);
                ctx.clip();
                ctx.drawImage(img, rx, ry, rw, rh);
                ctx.restore();
                drawInfoPanel();
            };
            img.onerror = function () { drawInfoPanel(); };
            img.src = src;
        });
    }

    /* ── UI helpers ── */

    function toast(msg) {
        if (typeof window.showToast === 'function') { window.showToast(msg, 'info'); return; }
        var el = document.createElement('div');
        el.textContent = msg;
        el.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;' +
            'padding:12px 18px;border-radius:10px;z-index:99999;font:600 14px "Noto Sans Devanagari",sans-serif;' +
            'max-width:90%;text-align:center;box-shadow:0 6px 20px rgba(0,0,0,.35)';
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 4500);
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
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
        var g = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < g.length; i++) {
            if (String(g[i].id) === String(id)) return g[i];
        }
        return null;
    }

    /* ── MAIN SHARE: ONE combined poster image (photo top + info bottom) ── */

    window.shareOnWhatsApp = async function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId : findArticleById(articleOrId);
        if (!article) { toast('बातमी सापडली नाही.'); return; }

        toast('पोस्टर तयार होत आहे...');

        var blob = null;
        try { blob = await generateCombinedPosterBlob(article); } catch (e) { blob = null; }

        if (!blob) { toast('पोस्टर तयार करता आले नाही.'); return; }

        var file = new File([blob], 'nmg-news-' + article.id + '.jpg', { type: 'image/jpeg' });

        /* Mobile: share ONE image file — no separate text so WhatsApp shows 1 bubble */
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({ files: [file] });    // image only = ONE message
                return buildShareJSON(article);
            } catch (e) {
                if (e && e.name === 'AbortError') return;    // user cancelled
            }
        }

        /* Desktop fallback: download poster + open WhatsApp Web */
        downloadBlob(blob, 'nmg-news-' + article.id + '.jpg');
        window.open('https://web.whatsapp.com/', '_blank', 'noopener');
        toast('पोस्टर डाउनलोड झाले – व्हॉट्सॲपमध्ये शेअर करा');
        return buildShareJSON(article);
    };

    window.shareNewsImage = window.shareOnWhatsApp;   // alias for app.js

    /* ── Caption copy (text with clickable links) ── */

    window.copyCaption = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId : findArticleById(articleOrId);
        if (!article) return null;
        var text = buildCaption(article);
        copyText(text).then(function () { toast('📋 व्हॉट्सॲप मेसेज आणि लिंक्स कॉपी झाल्या!'); });
        return text;
    };

    window.copyShareCaption = window.copyCaption;

    window.copyShareJSON = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId : findArticleById(articleOrId);
        if (!article) return;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        copyText(json).then(function () { toast('✅ JSON कॉपी झाला!'); });
        return json;
    };

    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildShareMessage: buildShareMessage,
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
