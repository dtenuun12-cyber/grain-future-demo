// Vercel serverless function — handles POST /api/notify-whatsapp
//
// Sends a WhatsApp message directly to the store owner's phone using CallMeBot
// (a free API for personal/small-business use — no cost, no business verification).
//
// ---- One-time setup the OWNER needs to do (not you) ----
// 1. Save this contact on WhatsApp: +34 644 59 71 67 (CallMeBot's official number)
// 2. Send the message: "I allow callmebot to send me messages"
// 3. Wait for a reply containing an API key (looks like: "API Activated... APIKEY is 123456")
// 4. Give you that API key -> you set it in Vercel as CALLMEBOT_APIKEY
//
// The owner's WhatsApp number itself comes from config.json (whatsapp_number).

const config = require('../config.json');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, phone, email, note } = req.body || {};

  if (!name || !(phone || email)) {
    res.status(400).json({ error: 'name and (phone or email) are required' });
    return;
  }

  const apiKey = process.env.CALLMEBOT_APIKEY;
  if (!apiKey) {
    res.status(500).json({ error: 'CALLMEBOT_APIKEY not configured' });
    return;
  }

  const text = `New website lead!\nName: ${name}${phone ? `\nPhone: ${phone}` : ''}${email ? `\nEmail: ${email}` : ''}${note ? `\nNote: ${note}` : ''}`;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${config.whatsapp_number}&text=${encodeURIComponent(text)}&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const resultText = await response.text();

    if (!response.ok) {
      console.error('CallMeBot error:', resultText);
      res.status(502).json({ error: 'Failed to send WhatsApp notification' });
      return;
    }

    res.status(200).json({ sent: true });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
