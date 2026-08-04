// GRAIN Furniture Co. — AI shopping assistant widget
// This file is generic: it doesn't hardcode any store info.
// All store/product info lives in config.json and is used server-side in /api/chat.js

(function () {
  const BUSINESS_NAME = 'GRAIN Furniture Co.';
  const WELCOME_MESSAGE = "Hi, I'm the GRAIN assistant. Ask me about any piece, dimensions, materials, or what might fit your space.";

  // ---- Build widget DOM ----
  const launcher = document.createElement('button');
  launcher.id = 'grain-chat-launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.innerHTML = '&#128172;';

  const panel = document.createElement('div');
  panel.id = 'grain-chat-panel';
  panel.innerHTML = `
    <div class="gc-header">
      <div>
        <div class="gc-header-title">${BUSINESS_NAME}</div>
        <div class="gc-header-sub">Usually replies instantly</div>
      </div>
      <button class="gc-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="gc-body" id="gc-body"></div>
    <div class="gc-input-row">
      <input type="text" id="gc-input" placeholder="Ask about a product..." autocomplete="off">
      <button class="gc-send" id="gc-send">Send</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  const body = panel.querySelector('#gc-body');
  const input = panel.querySelector('#gc-input');
  const sendBtn = panel.querySelector('#gc-send');
  const closeBtn = panel.querySelector('.gc-close');

  let history = []; // { role: 'user' | 'assistant', content: string }
  let opened = false;

  function addMessage(role, text) {
    const el = document.createElement('div');
    el.className = 'gc-msg ' + (role === 'user' ? 'user' : 'bot');
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add('open');
    if (!opened) {
      addMessage('bot', WELCOME_MESSAGE);
      opened = true;
    }
    input.focus();
  }

  launcher.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    sendBtn.disabled = true;

    const typingEl = document.createElement('div');
    typingEl.className = 'gc-msg bot typing';
    typingEl.textContent = 'Typing...';
    body.appendChild(typingEl);
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      typingEl.remove();
      addMessage('bot', data.reply);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage('bot', "Sorry, I'm having trouble connecting right now. Please call the store or try again in a moment.");
      console.error('Chat error:', err);
    } finally {
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
