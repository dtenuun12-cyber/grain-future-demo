// GRAIN Furniture Co. — shared site behavior
// Update these two constants when reusing this template for a new client
const WHATSAPP_NUMBER = '60123456789'; // digits only, country code, no + or spaces
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // from formspree.io

document.addEventListener('DOMContentLoaded', () => {
  // ---- Mobile nav toggle ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // ---- Floating WhatsApp button (every page) ----
  const wa = document.createElement('a');
  wa.id = 'grain-whatsapp-btn';
  wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'm interested in a piece from GRAIN Furniture Co.")}`;
  wa.target = '_blank';
  wa.rel = 'noopener';
  wa.setAttribute('aria-label', 'Chat on WhatsApp');
  wa.innerHTML = '&#128241;';
  document.body.appendChild(wa);

  // ---- Contact form -> real submission via Formspree ----
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      const payload = {
        name: form.querySelector('#name').value,
        email: form.querySelector('#email').value,
        message: form.querySelector('#message').value,
      };

      try {
        const [formRes] = await Promise.allSettled([
          fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          }),
          fetch('/api/notify-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: payload.name, email: payload.email, note: `Contact form: ${payload.message}` }),
          }),
        ]);
        if (formRes.status === 'fulfilled' && formRes.value.ok) {
          btn.textContent = "Sent — we'll reply within a day";
          form.reset();
        } else {
          btn.textContent = 'Something went wrong — please WhatsApp us instead';
        }
      } catch (err) {
        console.error('Form submit error:', err);
        btn.textContent = 'Something went wrong — please WhatsApp us instead';
      } finally {
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
      }
    });
  }
});

// Helper other scripts (chatbot.js) can reuse
window.GRAIN_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;
