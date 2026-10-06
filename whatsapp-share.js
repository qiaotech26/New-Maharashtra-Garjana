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

    function generateShareCardCanvas(article, callback) {
        var t = getShareTemplate();
        var src = getImageUrl(article);

        var W = 1080, H = 1350;
        var imgH = Math.round(H * 0.60);
        var infoY = imgH;
        var infoH = H - imgH;

        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        var ctx = canvas.getContext('2d');

        function drawInfoPanel() {
            // Dark background
            ctx.fillStyle = '#0E1A2B';
            ctx.fillRect(0, infoY, W, infoH);

            // Red top accent bar
            ctx.fillStyle = '#B80F0A';
            ctx.fillRect(0, infoY, W, 7);

            // Gold divider line
            ctx.fillStyle = '#F59E0B';
            ctx.fillRect(0, infoY + 7, W, 3);

            var pad = 38;
            var maxW = W - pad * 2;
            var y = infoY + 44;

            // Article title
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.font = 'bold 34px "Noto Sans Devanagari", Arial, sans-serif';
            var titleLines = wrapText(ctx, article.title || '', maxW);
            titleLines.slice(0, 2).forEach(function (line) {
                ctx.fillText(line, pad, y);
                y += 44;
            });

            // Article URL
            var articleUrl = getArticleUrl(article);
            ctx.fillStyle = '#60A5FA';
            ctx.font = '22px "Courier New", monospace';
            ctx.fillText('🔗 ' + articleUrl, pad, y + 6);
            y += 40;

            // Separator
            ctx.strokeStyle = '#1E3A5F';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(pad, y + 8);
            ctx.lineTo(W - pad, y + 8);
            ctx.stroke();
            y += 28;

            // WhatsApp Channel Call to Action
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

            // Contact Info
            ctx.fillStyle = '#FCD34D';
            ctx.font = 'bold 28px "Noto Sans Devanagari", Arial, sans-serif';
            ctx.fillText('📞 ' + t.contactLabel + '  ' + t.contactPhone, pad, y);

            // Branding footer
            ctx.fillStyle = '#64748B';
            ctx.font = '18px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('न्यू महाराष्ट्र गर्जना  |  newmaharashtragarjana.com', W / 2, H - 18);
            ctx.textAlign = 'left';

            canvas.toBlob(function (b) {
                callback(b, canvas.toDataURL('image/jpeg', 0.93));
            }, 'image/jpeg', 0.93);
        }

        if (!src) {
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

    /* ---------- MAIN SHARE ACTION ---------- */

    window.shareOnWhatsApp = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);

        if (!article) {
            toast('माफ करा, बातमी सापडली नाही.', 'warning');
            return;
        }

        var captionText = buildCaption(article);

        generateShareCardCanvas(article, function (blob) {
            var file = blob ? new File([blob], 'news-' + article.id + '.jpg', { type: 'image/jpeg' }) : null;

            // 1. Mobile Web Share API Level 2 (with files support check)
            if (file && navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
                navigator.share({
                    files: [file],
                    text: captionText
                }).then(function () {
                    // Success
                }).catch(function (err) {
                    if (err && (err.name === 'AbortError' || err.code === 20)) {
                        return; // User cancelled
                    }
                    fallbackDesktopShare(blob, article, captionText);
                });
                return;
            }

            // 2. Desktop or unsupported file sharing fallback
            fallbackDesktopShare(blob, article, captionText);
        });

        return buildShareJSON(article);
    };

    function fallbackDesktopShare(blob, article, captionText) {
        // a) Automatically download the image
        if (blob) {
            downloadBlob(blob, 'news-' + article.id + '.jpg');
        }

        // b) Open wa.me link with encoded caption text
        var waUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(captionText);
        window.open(waUrl, '_blank', 'noopener');

        // c) Show Marathi toast requirement
        toast('फोटो डाउनलोड झाला – व्हॉट्सॲपमध्ये अटॅच करा', 'info');
    }

    window.shareNewsImage = window.shareOnWhatsApp;

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
        shareNewsImage: window.shareOnWhatsApp,
        copyCaption: window.copyCaption,
        copyShareCaption: window.copyCaption,
        copyShareJSON: window.copyShareJSON
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();
