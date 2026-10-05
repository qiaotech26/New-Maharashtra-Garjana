/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Builds the WhatsApp share message (title + link + group + channel + contact),
   matching JSON payload, and handles news image import & poster image sharing.

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template_config';
    var SITE_BASE = 'https://newmaharashtragarjana.com/';

    // Defaults = the values present in the admin form (Tab 5 of index.html)
    var DEFAULT_TEMPLATE = {
        groupHeading: 'पुणे पिंपरी चिंचवड शहर जिल्हा ब्रेकिंग न्यूज साठी आजच व्हाट्सएप ग्रुप जॉईन करा',
        groupEmoji: '🟢',
        groupLink: 'https://chat.whatsapp.com/I0UaexFFIbZ06FoHHrvmp3',
        channelHeading: 'पुणे पिंपरी चिंचवड ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelFollowText: 'Follow the PPCNEWS .IN channel on WhatsApp:',
        channelLink: 'https://whatsapp.com/channel/0029VazsOCg8KMqs4yeUu50Q',
        contactLabel: 'बातम्या जाहिरातींकरता संपर्क:',
        contactPhone: '9922161114'
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
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tpl));
        } catch (e) { console.error('Failed to save share template:', e); }

        // Push to Firestore settings collection if available
        try {
            if (window.db && typeof window.db.collection === 'function') {
                window.db.collection('settings').doc('shareTemplate').set(tpl, { merge: true });
            }
        } catch (e) { /* ignore – localStorage is primary */ }
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
            window.showToast('✅ व्हॉट्सॲप शेअर मेसेज फॉरमॅट सेव्ह झाला.', 'success');
        } else {
            alert('✅ शेअर फॉरमॅट सेव्ह झाला.');
        }
    };

    /* ---------- link + message builders ---------- */

    function getArticleUrl(article) {
        if (article && article.url) return article.url; // explicit URL wins
        var id = article && (article.id !== undefined ? article.id : '');
        var origin = (window.location && window.location.origin && window.location.origin.startsWith('http'))
            ? window.location.origin
            : SITE_BASE.replace(/\/$/, '');
        return origin + '/article/' + encodeURIComponent(id);
    }

    /**
     * Final WhatsApp text. Output looks like:
     *
     *   <Article title>
     *   https://newmaharashtragarjana.com/article/9439
     *
     *   *<Group heading>*
     *   https://chat.whatsapp.com/...
     *
     *   *<Channel heading>*
     *   Follow the PPCNEWS .IN channel on WhatsApp: https://whatsapp.com/channel/...
     *
     *   *बातम्या जाहिरातींकरता संपर्क:*
     *   9922161114
     */
    function buildShareMessage(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var url = getArticleUrl(article);
        var title = (article && article.title ? String(article.title) : '').trim();

        var blocks = [
            title + '\n' + url
        ];

        if (t.groupHeading && t.groupLink) {
            blocks.push('*' + t.groupHeading + '*\n' + (t.groupEmoji ? t.groupEmoji + '\n' : '') + t.groupLink);
        }

        if (t.channelHeading && t.channelLink) {
            var followStr = t.channelFollowText ? t.channelFollowText + ' ' : '';
            blocks.push('*' + t.channelHeading + '*\n' + followStr + t.channelLink);
        }

        if (t.contactPhone) {
            var label = t.contactLabel || 'बातम्या जाहिरातींकरता संपर्क:';
            blocks.push('*' + label + '*\n*' + t.contactPhone + '*');
        }

        return blocks.join('\n\n');
    }

    // JSON payload (for logging, API calls, Firestore, or sending to a bot/backend)
    function buildShareJSON(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var message = buildShareMessage(article, t);
        return {
            articleId: article && article.id,
            title: article && article.title,
            image: article && article.img,
            url: getArticleUrl(article),
            group: { heading: t.groupHeading, link: t.groupLink },
            channel: { heading: t.channelHeading, followText: t.channelFollowText, link: t.channelLink },
            contact: { label: t.contactLabel, phone: t.contactPhone },
            message: message,
            whatsappUrl: 'https://api.whatsapp.com/send?text=' + encodeURIComponent(message)
        };
    }

    /* ---------- article finder ---------- */

    function findArticleById(id) {
        if (!id && id !== 0) return null;
        var stringId = String(id);

        // 1. Search in window.appState.news if loaded
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

        // 2. Global lists fallback
        var globalList = window.newsData || window.articles || window.NEWS_DATA || [];
        for (var i = 0; i < globalList.length; i++) {
            if (String(globalList[i].id) === stringId) return globalList[i];
        }

        // 3. Reader DOM fallback if open in modal
        var modalTitle = document.getElementById('articleReaderTitle');
        var modalImg = document.querySelector('.article-main-image-box img');
        if (modalTitle && modalTitle.textContent) {
            return {
                id: id,
                title: modalTitle.textContent.trim(),
                img: modalImg ? modalImg.src : ''
            };
        }

        return null;
    }

    /* ---------- NEWS IMAGE CARD POSTER GENERATOR ---------- */

    /**
     * Generates a high-quality Marathi News Poster Image on HTML5 Canvas
     * with Brand Logo Header, News Image, Marathi Calligraphy Title, Date & WhatsApp invite.
     */
    function generateNewsPosterCanvas(article, callback) {
        if (!article) return callback(null);

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        // High Resolution Canvas (1200 x 1200) - Perfect for WhatsApp / Instagram share
        canvas.width = 1200;
        canvas.height = 1200;

        // Background Gradient (Dark Premium Theme matching NMG)
        var bgGrad = ctx.createLinearGradient(0, 0, 0, 1200);
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.5, '#1E293B');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 1200);

        // Header Strip Background
        ctx.fillStyle = '#B80F0A';
        ctx.fillRect(0, 0, 1200, 150);

        // Accent Gold Line
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, 150, 1200, 10);

        // Header Brand Text: "न्यू महाराष्ट्र गर्जना"
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('न्यू महाराष्ट्र गर्जना', 600, 85);

        ctx.fillStyle = '#FCD34D';
        ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
        ctx.fillText('संपादक: श्री. उमेश पाटील  •  महाराष्ट्रातील अग्रगण्य डिजिटल वृत्तपत्र', 600, 125);

        // Category Badge
        var cat = article.cat || 'महाराष्ट्र';
        ctx.fillStyle = '#E11D48';
        roundRect(ctx, 60, 180, 220, 50, 25, true);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('● ' + cat, 170, 214);

        // Load Article Image
        var img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            // Image Container (600px height)
            var imgY = 250;
            var imgH = 500;
            var imgW = 1080;
            var imgX = 60;

            // Draw shadow box around image
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#000000';
            ctx.fillRect(imgX, imgY, imgW, imgH);
            ctx.shadowBlur = 0;

            // Draw clipped image maintaining cover ratio
            ctx.save();
            roundRect(ctx, imgX, imgY, imgW, imgH, 16, false);
            ctx.clip();

            var aspect = img.width / img.height;
            var targetAspect = imgW / imgH;
            var renderW, renderH, offsetX, offsetY;

            if (aspect > targetAspect) {
                renderH = imgH;
                renderW = imgH * aspect;
                offsetX = imgX - (renderW - imgW) / 2;
                offsetY = imgY;
            } else {
                renderW = imgW;
                renderH = imgW / aspect;
                offsetX = imgX;
                offsetY = imgY - (renderH - imgH) / 2;
            }

            ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
            ctx.restore();

            // Draw Title Section Below Image
            var titleY = 790;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 44px "Noto Sans Devanagari", sans-serif';
            ctx.textAlign = 'left';

            var titleText = article.title || '';
            var lines = wrapTextLines(ctx, titleText, 1080, 2);

            lines.forEach(function (line, index) {
                ctx.fillText(line, 60, titleY + (index * 58));
            });

            // Bottom Footer Card - WhatsApp Join Banner
            var footerY = 980;
            var footerH = 170;
            ctx.fillStyle = '#065F46'; // Emerald green
            roundRect(ctx, 60, footerY, 1080, footerH, 16, true);

            ctx.fillStyle = '#10B981';
            roundRect(ctx, 60, footerY, 1080, footerH, 16, false);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#34D399';
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 32px "Noto Sans Devanagari", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('📲 ताज्या ब्रेकिंग न्यूजसाठी आजच व्हाट्सएप ग्रुप जॉईन करा', 600, footerY + 60);

            ctx.fillStyle = '#FDE047';
            ctx.font = 'bold 28px "Noto Sans Devanagari", sans-serif';
            var tpl = getShareTemplate();
            ctx.fillText('बातम्या व जाहिरातींकरता संपर्क: ' + (tpl.contactPhone || '8530664576') + ' | newmaharashtragarjana.com', 600, footerY + 115);

            canvas.toBlob(function (blob) {
                callback(blob, canvas.toDataURL('image/jpeg', 0.92));
            }, 'image/jpeg', 0.92);
        };

        img.onerror = function () {
            // Fallback: Use NMG official logo image if article image fails to load CORS
            img.src = 'logo.jpg';
        };

        // Use proxy or direct URL
        var srcUrl = article.img || 'logo.jpg';
        if (srcUrl.startsWith('http') && !srcUrl.includes(window.location.hostname)) {
            // Use CORS proxy or fallback if external domain blocks CORS
            img.src = srcUrl;
        } else {
            img.src = srcUrl;
        }
    }

    function roundRect(ctx, x, y, w, h, r, fill) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        if (fill) ctx.fill();
    }

    function wrapTextLines(ctx, text, maxWidth, maxLines) {
        var words = text.split(' ');
        var lines = [];
        var currentLine = words[0] || '';

        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var width = ctx.measureText(currentLine + ' ' + word).width;
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);

        if (maxLines && lines.length > maxLines) {
            lines = lines.slice(0, maxLines);
            lines[maxLines - 1] += '...';
        }
        return lines;
    }

    /* ---------- ACTIONS: SHARE ON WHATSAPP & SHARE WITH IMAGE ---------- */

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

        // Fire-and-forget sync to server so WhatsApp preview server has the latest thumbnail
        try {
            fetch('/api/sync-article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: article.id,
                    title: article.title,
                    img: article.img,
                    desc: article.desc
                })
            }).catch(function () { });
        } catch (e) { }

        // Check if Web Share API with Files is supported on mobile devices
        if (navigator.share && article.img) {
            generateNewsPosterCanvas(article, function (blob, dataUrl) {
                if (blob && navigator.canShare) {
                    var file = new File([blob], 'news_poster_' + article.id + '.jpg', { type: 'image/jpeg' });
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            title: article.title,
                            text: payload.message,
                            files: [file]
                        }).catch(function () {
                            // Fallback to URL window.open
                            window.open(payload.whatsappUrl, '_blank', 'noopener');
                        });
                        return;
                    }
                }
                // Fallback to standard WhatsApp Web URL
                window.open(payload.whatsappUrl, '_blank', 'noopener');
            });
        } else {
            window.open(payload.whatsappUrl, '_blank', 'noopener');
        }

        return payload;
    };

    /**
     * Share / Download News Image Poster Card directly
     */
    window.shareNewsImage = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);

        if (!article) {
            if (typeof window.showToast === 'function') {
                window.showToast('बातमी सापडली नाही.', 'warning');
            } else {
                alert('बातमी सापडली नाही.');
            }
            return;
        }

        if (typeof window.showToast === 'function') {
            window.showToast('🖼️ बातमीचा फोटो (Image Poster) तयार होत आहे...', 'info');
        }

        generateNewsPosterCanvas(article, function (blob, dataUrl) {
            if (!blob) {
                if (typeof window.showToast === 'function') window.showToast('फोटो लोड करताना त्रुटी आली.', 'danger');
                return;
            }

            var file = new File([blob], 'news_poster_' + article.id + '.jpg', { type: 'image/jpeg' });

            // If Web Share API with files is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    title: article.title,
                    text: buildShareMessage(article),
                    files: [file]
                }).then(function () {
                    if (typeof window.showToast === 'function') window.showToast('✅ फोटो यशस्वीरीत्या शेअर झाला!', 'success');
                }).catch(function (err) {
                    downloadBlob(blob, 'nmg_news_' + article.id + '.jpg');
                });
            } else {
                // Fallback: Download Image File & Copy WhatsApp text
                downloadBlob(blob, 'nmg_news_' + article.id + '.jpg');
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(buildShareMessage(article));
                }
                if (typeof window.showToast === 'function') {
                    window.showToast('📥 फोटो डाऊनलोड झाला व मेसेज कॉपी झाला! आता व्हॉट्सॲपवर पाठवा.', 'success');
                } else {
                    alert('📥 फोटो डाऊनलोड झाला व मेसेज कॉपी झाला! आता व्हॉट्सॲपवर पाठवा.');
                }
            }
        });
    };

    function downloadBlob(blob, fileName) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    window.copyShareJSON = function (articleOrId) {
        var article = (typeof articleOrId === 'object' && articleOrId !== null)
            ? articleOrId
            : findArticleById(articleOrId);

        if (!article) return null;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(json);
            if (typeof window.showToast === 'function') {
                window.showToast('✅ JSON पेलोड कॉपी झाला!', 'success');
            }
        }
        return json;
    };

    /* ---------- EXPOSE GLOBAL NAMESPACE ---------- */

    window.NMGShare = {
        getShareTemplate: getShareTemplate,
        saveShareTemplate: saveShareTemplate,
        buildShareMessage: buildShareMessage,
        buildShareJSON: buildShareJSON,
        getArticleUrl: getArticleUrl,
        shareOnWhatsApp: window.shareOnWhatsApp,
        shareNewsImage: window.shareNewsImage,
        generateNewsPosterCanvas: generateNewsPosterCanvas,
        copyShareJSON: window.copyShareJSON
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();
