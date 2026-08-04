// Vercel serverless function — handles POST /api/chat
//
// Uses Groq's API — it's free (no credit card required) and OpenAI-compatible,
// which is why this is a good $0 way to get the demo working first.
// Groq only hosts open-source models (Llama, etc), not Claude — so quality is
// a notch below Claude, but plenty good enough to prove the concept to a client.
//
// To switch to Claude later (e.g. once a client is paying you), see the
// commented-out block at the bottom of this file.
//
// Deploy on Vercel and set an environment variable named GROQ_API_KEY
// (Project Settings -> Environment Variables -> add GROQ_API_KEY = your key)
// Get a free key at https://console.groq.com/keys

const config = require('../config.json');

function buildSystemPrompt() {
  const productList = config.products
    .map(p => `- ${p.name} (${p.category}): ${p.price}, ${p.material}, ${p.dimensions}. ${p.desc}`)
    .join('\n');

  return config.system_prompt
    .replace('{business_name}', config.business_name)
    .replace('{address}', config.address)
    .replace('{hours}', config.hours)
    .replace('{phone}', config.phone)
    .replace('{products}', '\n' + productList);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages array is required' });
    return;
  }

  // Keep only the last 10 turns to control cost/context size
  const trimmed = messages.slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content).slice(0, 2000),
  }));

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...trimmed,
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      res.status(502).json({ error: 'Upstream API error' });
      return;
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({ reply });
  } catch (err) {
    console.error('Handler error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

/* ---- To switch to Claude later, replace the try block above with: ----

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: buildSystemPrompt(),
        messages: trimmed,
      }),
    });
    const data = await response.json();
    const reply = data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');

   Then set ANTHROPIC_API_KEY instead of GROQ_API_KEY in Vercel's environment variables.
--------------------------------------------------------------------- */
