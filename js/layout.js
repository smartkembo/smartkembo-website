// ── Navigation ──
const navHTML = `
<nav class="nav" id="nav">
  <div class="nav-inner">
    <a href="index.html" class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
      </div>
      <span class="logo-text">Smart<span>Kembo</span></span>
    </a>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="services.html">Services</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="tutorials.html">Tutorials</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
    <div class="nav-cta">
      <a href="smartkembo/login-owner.html" class="btn btn-outline btn-sm">Login</a>
      <a href="smartkembo/apply.html" class="btn btn-primary btn-sm">Start Free</a>
    </div>
    <button class="hamburger" onclick="openSiteMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <button class="mobile-close" onclick="closeSiteMenu()">✕</button>
  <a href="index.html" onclick="closeSiteMenu()">Home</a>
  <a href="about.html" onclick="closeSiteMenu()">About</a>
  <a href="services.html" onclick="closeSiteMenu()">Services</a>
  <a href="projects.html" onclick="closeSiteMenu()">Projects</a>
  <a href="tutorials.html" onclick="closeSiteMenu()">Tutorials</a>
  <a href="contact.html" onclick="closeSiteMenu()">Contact</a>
  <a href="smartkembo/apply.html" onclick="closeSiteMenu()" style="color:var(--accent);margin-top:12px">Start Free →</a>
</div>`;

const footerHTML = `
<footer>
  <div class="footer-grid">
    <div class="footer-brand">
      <a href="index.html" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>
        <span class="logo-text">Smart<span>Kembo</span></span>
      </a>
      <p>Modern WiFi Vending Management platform. Manage your WiFi, customers, and revenue from one place.</p>
    </div>
    <div class="footer-col">
      <h4>Platform</h4>
      <a href="services.html">Our Services</a>
      <a href="smartkembo/apply.html">Apply for Account</a>
      <a href="smartkembo/login-owner.html">Login</a>
      <a href="tutorials.html">Tutorials</a>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <a href="about.html">About Us</a>
      <a href="projects.html">Projects</a>
      <a href="contact.html">Contact</a>
    </div>
    <div class="footer-col">
      <h4>Contact</h4>
      <a href="tel:+255767830319">+255 767 830 319</a>
      <a href="mailto:info@smartkembo.com">info@smartkembo.com</a>
      <a href="https://wa.me/255767830319" target="_blank" rel="noopener">WhatsApp</a>
      <a href="#">Instagram</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 SmartKembo. All rights reserved.</span>
    <span>Made in Tanzania 🇹🇿</span>
  </div>
</footer>`;

// Inject nav and footer
document.addEventListener('DOMContentLoaded', () => {
  // Nav — ONLY inject if this page doesn't already have its own <nav>
  // (baadhi ya kurasa, kama shop.html, zina nav yao maalum tayari iliyojengwa
  // ndani ya ukurasa wenyewe — hazihitaji hii ya pamoja, kuiongeza kunasababisha
  // nav mbili zikijirudia juu ya ukurasa)
  if (!document.querySelector('nav')) {
    const navEl = document.createElement('div');
    navEl.innerHTML = navHTML;
    document.body.prepend(...navEl.childNodes);
  }

  // Footer
  const footEl = document.createElement('div');
  footEl.innerHTML = footerHTML;
  document.body.append(...footEl.childNodes);

  // Mark active link
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Scroll nav
  const navBar = document.getElementById('nav');
  if (navBar) {
    window.addEventListener('scroll', () => {
      navBar.classList.toggle('scrolled', window.scrollY > 20);
    });
    navBar.classList.toggle('scrolled', window.scrollY > 20);
  }
});

function openSiteMenu()  { document.getElementById('mobile-menu').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeSiteMenu() { document.getElementById('mobile-menu').classList.remove('open'); document.body.style.overflow = ''; }
