// Vercel serverless function — handles POST /api/chat
const config = require('../config.json');

function buildSystemPrompt() {
  const productList = (config.products || [])
    .map(p => `- ${p.name} [Category: ${p.category} | Price: ${p.price} | Material: ${p.material} | Dimensions: ${p.dimensions}]: ${p.desc}`)
    .join('\n');

  return (config.system_prompt || '')
    .replace('{business_name}', config.business_name || 'GRAIN Furniture Co.')
    .replace('{address}', config.address || '')
    .replace('{hours}', config.hours || '')
    .replace('{phone}', config.phone || '')
    .replace('{products}', '\n' + productList);
}

module.exports = async function handler(req, res) {
  // CORS & Method check
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('GROQ_API_KEY environment variable is missing.');
    return res.status(500).json({ error: 'Server misconfiguration: API key missing' });
  }

  // Sanitize and trim history (keep last 10 turns, limit length to prevent context flooding)
  const trimmedMessages = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').trim().slice(0, 1500),
  }));

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 500,
        temperature: 0.6,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...trimmedMessages,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API upstream error:', response.status, errText);
      return res.status(502).json({ error: 'Upstream AI service error' });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that request right now.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('API Chat Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
