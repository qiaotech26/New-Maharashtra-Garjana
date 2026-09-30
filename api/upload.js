const https = require('https');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) {}
    }

    const base64Data = body?.image || body?.base64;
    if (!base64Data) {
      return res.status(400).json({ error: 'Missing image data' });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // Upload to Catbox
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const postDataHeader = Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="reqtype"\r\n\r\n` +
      `fileupload\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="fileToUpload"; filename="news_thumb.jpg"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`
    );
    const postDataFooter = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([postDataHeader, buffer, postDataFooter]);

    const catboxReq = https.request({
      hostname: 'catbox.moe',
      path: '/user/api.php',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (catboxRes) => {
      let data = '';
      catboxRes.on('data', chunk => data += chunk);
      catboxRes.on('end', () => {
        const publicUrl = data.trim();
        if (publicUrl.startsWith('http')) {
          return res.status(200).json({ success: true, url: publicUrl });
        } else {
          return res.status(500).json({ error: 'Upload failed', details: data });
        }
      });
    });

    catboxReq.on('error', (err) => {
      return res.status(500).json({ error: err.message });
    });

    catboxReq.write(fullBody);
    catboxReq.end();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
