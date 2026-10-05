/* ============================================================
   whatsapp-share.js  —  New Maharashtra Garjana
   Builds WhatsApp share message (title + link + group + channel + socials + contact),
   matching JSON payload, and handles news image card poster sharing with clickable links.

   Load AFTER firebase-config.js and BEFORE app.js:
     <script src="whatsapp-share.js"></script>
     <script src="app.js"></script>
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'nmg_share_template_config';
    var SITE_BASE = 'https://newmaharashtragarjana.com/';

    // Defaults matching Tab 5 of admin form & user requirements
    var DEFAULT_TEMPLATE = {
        groupHeading: 'पुणे पिंपरी चिंचवड शहर जिल्हा ब्रेकिंग न्यूज साठी आजच व्हाट्सएप ग्रुप जॉईन करा',
        groupLink: 'https://chat.whatsapp.com/I0UaexFFIbZ06FoHHrvmp3',
        channelHeading: 'ताज्या बातम्यांचे अपडेट पहा व्हाट्सएप चॅनेलवर',
        channelLink: 'https://whatsapp.com/channel/0029VazsOCg8KMqs4yeUu50Q',
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

    /* ---------- link + message builders ---------- */

    function getArticleUrl(article) {
        var id = article && (article.id !== undefined ? article.id : '');
        return 'https://newmaharashtragarjana.com/?p=' + encodeURIComponent(id);
    }

    function buildShareMessage(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var url = getArticleUrl(article);
        var title = (article && article.title ? String(article.title) : '').trim();

        var phoneClean = (t.contactPhone || '8530664576').replace(/\D/g, '');
        if (phoneClean.length === 10) phoneClean = '91' + phoneClean;
        var waMeLink = 'https://wa.me/' + phoneClean;

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

    function buildShareJSON(article, templateOverride) {
        var t = Object.assign({}, getShareTemplate(), templateOverride || {});
        var caption = buildShareMessage(article, t);
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

    function generateNewsPosterCanvas(article, callback) {
        if (!article) return callback(null);

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        canvas.width = 1200;
        canvas.height = 1200;

        var bgGrad = ctx.createLinearGradient(0, 0, 0, 1200);
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(0.5, '#1E293B');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 1200);

        ctx.fillStyle = '#B80F0A';
        ctx.fillRect(0, 0, 1200, 150);

        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(0, 150, 1200, 10);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 52px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('न्यू महाराष्ट्र गर्जना', 600, 85);

        ctx.fillStyle = '#FCD34D';
        ctx.font = '600 24px "Noto Sans Devanagari", sans-serif';
        ctx.fillText('संपादक: श्री. उमेश पाटील  •  महाराष्ट्रातील अग्रगण्य डिजिटल वृत्तपत्र', 600, 125);

        var cat = article.cat || 'महाराष्ट्र';
        ctx.fillStyle = '#E11D48';
        roundRect(ctx, 60, 180, 220, 50, 25, true);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 26px "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('● ' + cat, 170, 214);

        var img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = function () {
            var imgY = 250;
            var imgH = 500;
            var imgW = 1080;
            var imgX = 60;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#000000';
            ctx.fillRect(imgX, imgY, imgW, imgH);
            ctx.shadowBlur = 0;

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

            var titleY = 790;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 44px "Noto Sans Devanagari", sans-serif';
            ctx.textAlign = 'left';

            var titleText = article.title || '';
            var lines = wrapTextLines(ctx, titleText, 1080, 2);

            lines.forEach(function (line, index) {
                ctx.fillText(line, 60, titleY + (index * 58));
            });

            var footerY = 980;
            var footerH = 170;
            ctx.fillStyle = '#065F46';
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
            img.src = 'logo.jpg';
        };

        var srcUrl = article.img || 'logo.jpg';
        img.src = srcUrl;
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

    /* ---------- SHARING ACTIONS ---------- */

    function downloadBlob(blob, fileName) {
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

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
        var captionText = payload.caption;

        generateNewsPosterCanvas(article, function (blob, dataUrl) {
            if (blob) {
                var file = new File([blob], 'news-' + article.id + '.jpg', { type: 'image/jpeg' });

                // Web Share API Level 2 (Mobile check: pass ONLY files and text, NO title/url)
                if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
                    navigator.share({
                        files: [file],
                        text: captionText
                    }).then(function () {
                        // Success! Image + caption sent together as ONE message. Do not open wa.me or download.
                    }).catch(function (err) {
                        if (err && (err.name === 'AbortError' || err.code === 20)) {
                            // User cancelled share dialog silently - do nothing!
                            return;
                        }
                        fallbackShareDesktop(blob, article.id, captionText);
                    });
                    return;
                }
            }
            fallbackShareDesktop(blob, article.id, captionText);
        });

        return payload;
    };

    function fallbackShareDesktop(blob, id, captionText) {
        // a) Copy caption to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(captionText).catch(function () { });
        }

        // b) Download image automatically
        if (blob) {
            downloadBlob(blob, 'news-' + id + '.jpg');
        }

        // Try copying image to clipboard if supported by browser
        if (blob && navigator.clipboard && window.ClipboardItem) {
            try {
                var img = new Image();
                img.onload = function () {
                    var c = document.createElement('canvas');
                    c.width = img.width;
                    c.height = img.height;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    c.toBlob(function (pngBlob) {
                        if (pngBlob) {
                            var item = new ClipboardItem({ 'image/png': pngBlob });
                            navigator.clipboard.write([item]).catch(function () { });
                        }
                    }, 'image/png');
                };
                img.src = URL.createObjectURL(blob);
            } catch (e) { }
        }

        // c) Open WhatsApp Web/App WITHOUT ?text= (prevents creating 2 separate text messages)
        window.open('https://web.whatsapp.com', '_blank', 'noopener');

        // d) Show clear Marathi toast
        if (typeof window.showToast === 'function') {
            window.showToast('फोटो व कॅप्शन कॉपी झाले – व्हॉट्सॲपमध्ये आधी फोटो पेस्ट करा, नंतर कॅप्शन पेस्ट करा', 'info');
        }
    }

    window.shareNewsImage = function (articleOrId) {
        return window.shareOnWhatsApp(articleOrId);
    };

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

        if (!article) return null;
        var json = JSON.stringify(buildShareJSON(article), null, 2);
        if (navigator.clipboard && navigator.clipboard.writeText) {
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
        copyCaption: window.copyCaption,
        copyShareJSON: window.copyShareJSON,
        generateNewsPosterCanvas: generateNewsPosterCanvas
    };

    document.addEventListener('DOMContentLoaded', loadShareTemplateConfigIntoForm);
})();
