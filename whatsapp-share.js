/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   ONE combined image share:  [Article Photo on TOP]
                               [All details text BELOW]
   Mobile : Web Share API Level 2  →  one WhatsApp message
   Desktop: downloads combined image, copies caption to clipboard

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

    /* ─────────────── Canvas helpers ─────────────── */

    var CANVAS_W = 1080;   // fixed width
    var IMG_H = 607;    // article image section height  (≈ 16:9 crop)
    var INFO_PAD = 36;     // padding inside info section
    var LINE_GAP = 10;     // extra gap between text rows
    var FONT_BODY = 'bold 28px "Noto Sans Devanagari", Arial, sans-serif';
    var FONT_URL = '22px "Courier New", monospace';
    var FONT_SM = '22px "Noto Sans Devanagari", Arial, sans-serif';

    /** Wrap text onto multiple lines, respecting maxWidth. Returns string[]. */
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
     * Draw a single text block on the canvas.
     * Returns the new Y position after the block.
     */
    function drawBlock(ctx, lines, x, startY, lineH, color, font) {
        ctx.fillStyle = color;
        ctx.font = font;
        lines.forEach(function (line) {
            ctx.fillText(line, x, startY);
            startY += lineH;
        });
        return startY + LINE_GAP;
    }

    /**
     * Measures how tall the info section needs to be given the template.
     * Returns pixels needed.
     */
    function measureInfoHeight(ctx, article, tpl) {
        var maxW = CANVAS_W - INFO_PAD * 2;
        var total = INFO_PAD; // top padding

        function add(font, text, lineH) {
            ctx.font = font;
            var ls = wrapText(ctx, text, maxW);
            total += ls.length * lineH + LINE_GAP;
        }

        var title = (article && article.title ? String(article.title) : '').trim();
        add(FONT_BODY, title, 36);
        add(FONT_URL, '🔗 ' + getArticleUrl(article), 28);
        total += 14; // divider

        if (tpl.groupHeading && tpl.groupLink) {
            add(FONT_BODY, tpl.groupHeading, 34);
            add(FONT_URL, tpl.groupLink, 26);
        }
        if (tpl.channelHeading && tpl.channelLink) {
            add(FONT_BODY, tpl.channelHeading, 34);
            add(FONT_URL, tpl.channelLink, 26);
        }

        add(FONT_BODY, 'आम्हाला फॉलो करा:', 32);
        if (tpl.facebookUrl) add(FONT_SM, '📘 Facebook: ' + tpl.facebookUrl, 28);
        if (tpl.instagramUrl) add(FONT_SM, '📸 Instagram: ' + tpl.instagramUrl, 28);
        if (tpl.youtubeUrl) add(FONT_SM, '▶️ YouTube: ' + tpl.youtubeUrl, 28);
        if (tpl.websiteUrl) add(FONT_SM, '🌐 Website: ' + tpl.websiteUrl, 28);

        if (tpl.contactPhone) {
            var digits = tpl.contactPhone.replace(/\D/g, '');
            if (digits.length === 10) digits = '91' + digits;
            add(FONT_BODY, (tpl.contactLabel || 'बातम्या / जाहिरातींकरता संपर्क:'), 32);
            add(FONT_URL, tpl.contactPhone + '   wa.me/' + digits, 28);
        }

        total += INFO_PAD; // bottom padding
        return total;
    }

    /**
     * generateCombinedCanvas(article, articleImg|null, callback)
     *
     * Produces ONE canvas:
     *   ┌────────────────────────┐
     *   │   Article Photo  (top) │  IMG_H px
     *   ├────────────────────────┤
     *   │   Headline             │
     *   │   Article link         │
     *   │   WA group / channel   │  info section
     *   │   Social links         │
     *   │   Contact              │
     *   └────────────────────────┘
     *
     * callback(blob, dataUrl)
     */
    function generateCombinedCanvas(article, articleImg, callback) {
        var t = getShareTemplate();
        var maxW = CANVAS_W - INFO_PAD * 2;

        // Temp canvas to measure info height
        var tmp = document.createElement('canvas');
        tmp.width = CANVAS_W;
        tmp.height = 10;
        var tmpCtx = tmp.getContext('2d');

        var infoH = measureInfoHeight(tmpCtx, article, t);
        var totalH = IMG_H + infoH;

        var canvas = document.createElement('canvas');
        canvas.width = CANVAS_W;
        canvas.height = totalH;
        var ctx = canvas.getContext('2d');

        /* ── TOP: article photo ── */
        if (articleImg) {
            // Cover-fit: fill IMG_H × CANVAS_W, crop centre
            var iw = articleImg.naturalWidth || articleImg.width;
            var ih = articleImg.naturalHeight || articleImg.height;
            var scale = Math.max(CANVAS_W / iw, IMG_H / ih);
            var sw = CANVAS_W / scale;
            var sh = IMG_H / scale;
            var sx = (iw - sw) / 2;
            var sy = (ih - sh) / 2;
            ctx.drawImage(articleImg, sx, sy, sw, sh, 0, 0, CANVAS_W, IMG_H);
        } else {
            // Placeholder dark gradient if no image
            var grd = ctx.createLinearGradient(0, 0, 0, IMG_H);
            grd.addColorStop(0, '#0E1A2B');
            grd.addColorStop(1, '#1E3A5F');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, CANVAS_W, IMG_H);
            ctx.fillStyle = '#64748B';
            ctx.font = '32px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('न्यू महाराष्ट्र गर्जना', CANVAS_W / 2, IMG_H / 2);
            ctx.textAlign = 'left';
        }

        /* Red top bar */
        ctx.fillStyle = '#B80F0A';
        ctx.fillRect(0, 0, CANVAS_W, 7);
        /* Gold accent below bar */
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, 7, CANVAS_W, 3);

        /* ── BOTTOM: dark info section ── */
        ctx.fillStyle = '#0E1A2B';
        ctx.fillRect(0, IMG_H, CANVAS_W, infoH);

        /* Divider between image and info */
        ctx.fillStyle = '#B80F0A';
        ctx.fillRect(0, IMG_H, CANVAS_W, 5);
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, IMG_H + 5, CANVAS_W, 3);

        var x = INFO_PAD;
        var y = IMG_H + INFO_PAD + 32;

        /* Title */
        var title = (article && article.title ? String(article.title) : '').trim();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = FONT_BODY;
        var titleLines = wrapText(ctx, title, maxW);
        titleLines.slice(0, 3).forEach(function (line) {
            ctx.fillText(line, x, y);
            y += 38;
        });
        y += LINE_GAP;

        /* Article link */
        ctx.fillStyle = '#60A5FA';
        ctx.font = FONT_URL;
        ctx.fillText('🔗 ' + getArticleUrl(article), x, y);
        y += 30 + LINE_GAP;

        /* Thin separator */
        ctx.strokeStyle = '#1E3A5F';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y); ctx.lineTo(CANVAS_W - x, y);
        ctx.stroke();
        y += 18;

        /* WhatsApp group */
        if (t.groupHeading && t.groupLink) {
            ctx.fillStyle = '#4ADE80';
            ctx.font = FONT_BODY;
            wrapText(ctx, t.groupHeading, maxW).slice(0, 2).forEach(function (l) {
                ctx.fillText(l, x, y); y += 34;
            });
            ctx.fillStyle = '#86EFAC';
            ctx.font = FONT_URL;
            ctx.fillText(t.groupLink, x, y);
            y += 30 + LINE_GAP;
        }

        /* WhatsApp channel */
        if (t.channelHeading && t.channelLink) {
            ctx.fillStyle = '#4ADE80';
            ctx.font = FONT_BODY;
            wrapText(ctx, t.channelHeading, maxW).slice(0, 2).forEach(function (l) {
                ctx.fillText(l, x, y); y += 34;
            });
            ctx.fillStyle = '#86EFAC';
            ctx.font = FONT_URL;
            ctx.fillText(t.channelLink, x, y);
            y += 30 + LINE_GAP;
        }

        /* Social links */
        ctx.fillStyle = '#FCD34D';
        ctx.font = FONT_BODY;
        ctx.fillText('आम्हाला फॉलो करा:', x, y);
        y += 34 + LINE_GAP;

        ctx.font = FONT_SM;
        var socItems = [];
        if (t.facebookUrl) socItems.push('📘 Facebook: ' + t.facebookUrl);
        if (t.instagramUrl) socItems.push('📸 Instagram: ' + t.instagramUrl);
        if (t.youtubeUrl) socItems.push('▶️ YouTube: ' + t.youtubeUrl);
        if (t.websiteUrl) socItems.push('🌐 Website: ' + t.websiteUrl);
        socItems.forEach(function (s) {
            ctx.fillStyle = '#CBD5E1';
            ctx.fillText(s, x, y);
            y += 30;
        });
        y += LINE_GAP;

        /* Contact */
        if (t.contactPhone) {
            var digits = t.contactPhone.replace(/\D/g, '');
            if (digits.length === 10) digits = '91' + digits;
            ctx.fillStyle = '#F87171';
            ctx.font = FONT_BODY;
            ctx.fillText(t.contactLabel || 'बातम्या / जाहिरातींकरता संपर्क:', x, y);
            y += 34;
            ctx.fillStyle = '#FBBF24';
            ctx.font = FONT_URL;
            ctx.fillText(t.contactPhone + '   wa.me/' + digits, x, y);
        }

        /* Branding footer */
        ctx.fillStyle = '#475569';
        ctx.font = '19px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('न्यू महाराष्ट्र गर्जना  |  newmaharashtragarjana.com', CANVAS_W / 2, totalH - 14);
        ctx.textAlign = 'left';

        canvas.toBlob(function (b) {
            callback(b, canvas.toDataURL('image/jpeg', 0.93));
        }, 'image/jpeg', 0.93);
    }

    /* ─────────────── Image load helper ─────────────── */

    function loadArticleImage(article, callback) {
        var src = getImageUrl(article);
        if (!src) { callback(null); return; }

        var img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function () { callback(img); };
        img.onerror = function () { callback(null); };
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
     * ────────────────
     * Generates ONE combined image:
     *   [Article photo — top]
     *   [All text details — below]
     *
     * Mobile  → navigator.share({ files: [combinedImg] }) → ONE WhatsApp message
     * Desktop → downloads combined image + opens WA with caption text
     *
     * Caption text is always copied to clipboard (clickable links).
     */
    function doShare(article) {
        var captionText = buildCaption(article);
        copyText(captionText);   // clipboard — for clickable links on desktop paste

        toast('📸 फोटो तयार होत आहे, एक क्षण...', 'info');

        loadArticleImage(article, function (imgEl) {
            generateCombinedCanvas(article, imgEl, function (combinedBlob) {
                if (!combinedBlob) {
                    // Fallback: open WA with text only if canvas fails
                    var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);
                    window.open(waUrl, '_blank', 'noopener');
                    toast('✅ व्हॉट्सॲप उघडत आहे... लिंक्स clipboard मध्ये कॉपी आहेत.', 'success');
                    return;
                }

                var fname = 'nmg-share-' + (article.id || 'news') + '.jpg';
                var combinedFile = new File([combinedBlob], fname, { type: 'image/jpeg' });

                /* ── Mobile: Web Share API Level 2  (ONE image = ONE WA message) ── */
                if (
                    navigator.canShare &&
                    navigator.canShare({ files: [combinedFile] }) &&
                    navigator.share
                ) {
                    navigator.share({
                        files: [combinedFile],
                        title: article.title || 'न्यू महाराष्ट्र गर्जना'
                        // Note: 'text' omitted intentionally — WhatsApp on Android
                        // shows text as a SEPARATE second message when files are present.
                        // All info is already drawn inside the image itself.
                    }).then(function () {
                        toast('✅ बातमी एका मेसेजमध्ये यशस्वीरित्या शेअर झाली!', 'success');
                    }).catch(function (err) {
                        if (err && (err.name === 'AbortError' || err.code === 20)) return;
                        // If file share fails, try text share
                        if (navigator.share) {
                            navigator.share({
                                title: article.title || 'न्यू महाराष्ट्र गर्जना',
                                text: captionText,
                                url: getArticleUrl(article)
                            }).catch(function () {
                                var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);
                                window.open(waUrl, '_blank', 'noopener');
                            });
                        }
                    });
                    return;
                }

                /* ── Desktop fallback: download the combined image ── */
                downloadBlob(combinedBlob, fname);
                toast(
                    '📥 Combined image डाउनलोड झाली! WhatsApp मध्ये attach करा — links clipboard मध्ये आहेत.',
                    'info'
                );
            });
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

    window.sharePosterImage = window.shareDirectWhatsApp;
    window.shareNewsImage = window.shareDirectWhatsApp;

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
