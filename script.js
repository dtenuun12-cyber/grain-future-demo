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

  // 1. Render Featured Products on Index Page (First 3 items)
  const featuredGrid = document.querySelector('#featured-grid');
  if (featuredGrid && window.GRAIN_PRODUCTS) {
    const featuredItems = window.GRAIN_PRODUCTS.slice(0, 3);
    renderProductCards(featuredItems, '#featured-grid');
  }

  // 2. Render Full Product Collection & Filters on Products Page
  const productGrid = document.querySelector('#product-grid');
  if (productGrid && window.GRAIN_PRODUCTS) {
    renderProductCards(window.GRAIN_PRODUCTS, '#product-grid');

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-filter');
        
        if (category === 'All') {
          renderProductCards(window.GRAIN_PRODUCTS, '#product-grid');
        } else {
          const filtered = window.GRAIN_PRODUCTS.filter(p => p.category === category);
          renderProductCards(filtered, '#product-grid');
        }
      });
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
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (response.ok) {
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

// Reusable card renderer with WhatsApp context links including current URL
function renderProductCards(products, selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  container.innerHTML = products.map(product => {
    const pageUrl = window.location.href;
    const waText = encodeURIComponent(`Hi GRAIN, I'm interested in the ${product.name} (${product.price}). Here is the link: ${pageUrl}. Is it available to view or customize?`);
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`;

    return `
      <div class="card reveal active">
        <div class="card-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <span class="card-cat">${product.category}</span>
        <h3>${product.name}</h3>
        <p class="desc">${product.description}</p>
        <div class="card-specs"><span>${product.specs}</span></div>
        <div class="card-price">${product.price}</div>
        <a href="${waLink}" target="_blank" rel="noopener" class="card-ask">Ask about this piece &rarr;</a>
      </div>
    `;
  }).join('');
}

window.GRAIN_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;
window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
