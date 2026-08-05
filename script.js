// GRAIN Furniture Co. — shared site behavior
const WHATSAPP_NUMBER = '601140294053'; 
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Contact Form Submission Logic
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const originalText = btn.textContent;
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
          btn.textContent = 'Something went wrong — please WhatsApp us';
        }
      } catch (err) {
        console.error('Form error:', err);
        btn.textContent = 'Something went wrong — please WhatsApp us';
      } finally {
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 4000);
      }
    });
  }

  // Scroll Reveal Animations Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(element => {
    observer.observe(element);
  });
});

// Expose Formspree endpoint globally for chatbot.js to use
window.GRAIN_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;
// Expose WhatsApp number globally for chatbot.js to use
window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
