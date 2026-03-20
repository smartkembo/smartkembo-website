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
      <li><a href="index.html">Nyumbani</a></li>
      <li><a href="about.html">Kuhusu</a></li>
      <li><a href="services.html">Huduma</a></li>
      <li><a href="projects.html">Miradi</a></li>
      <li><a href="tutorials.html">Mafunzo</a></li>
      <li><a href="contact.html">Wasiliana</a></li>
    </ul>
    <div class="nav-cta">
      <a href="smartkembo/login-owner.html" class="btn btn-outline btn-sm">Ingia</a>
      <a href="smartkembo/apply.html" class="btn btn-primary btn-sm">Anza Bure</a>
    </div>
    <button class="hamburger" onclick="openMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>
<div class="mobile-menu" id="mobile-menu">
  <button class="mobile-close" onclick="closeMenu()">✕</button>
  <a href="index.html" onclick="closeMenu()">Nyumbani</a>
  <a href="about.html" onclick="closeMenu()">Kuhusu</a>
  <a href="services.html" onclick="closeMenu()">Huduma</a>
  <a href="projects.html" onclick="closeMenu()">Miradi</a>
  <a href="tutorials.html" onclick="closeMenu()">Mafunzo</a>
  <a href="contact.html" onclick="closeMenu()">Wasiliana</a>
  <a href="smartkembo/apply.html" onclick="closeMenu()" style="color:var(--accent);margin-top:12px">Anza Bure →</a>
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
      <p>Mfumo wa kisasa wa WiFi Vending Management. Simamia WiFi yako, wateja na mapato kutoka sehemu moja.</p>
    </div>
    <div class="footer-col">
      <h4>Mfumo</h4>
      <a href="services.html">Huduma Zetu</a>
      <a href="smartkembo/apply.html">Omba Akaunti</a>
      <a href="smartkembo/login-owner.html">Ingia</a>
      <a href="tutorials.html">Mafunzo</a>
    </div>
    <div class="footer-col">
      <h4>Kampuni</h4>
      <a href="about.html">Kuhusu Sisi</a>
      <a href="projects.html">Miradi</a>
      <a href="contact.html">Wasiliana</a>
    </div>
    <div class="footer-col">
      <h4>Wasiliana</h4>
      <a href="tel:+255712000000">+255 712 000 000</a>
      <a href="mailto:info@smartkembo.co.tz">info@smartkembo.co.tz</a>
      <a href="#">WhatsApp</a>
      <a href="#">Instagram</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2025 SmartKembo. Haki zote zimehifadhiwa.</span>
    <span>Imetengenezwa Tanzania 🇹🇿</span>
  </div>
</footer>`;

// Inject nav and footer
document.addEventListener('DOMContentLoaded', () => {
  // Nav
  const navEl = document.createElement('div');
  navEl.innerHTML = navHTML;
  document.body.prepend(...navEl.childNodes);

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
  window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
  });
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 20);
});

function openMenu()  { document.getElementById('mobile-menu').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMenu() { document.getElementById('mobile-menu').classList.remove('open'); document.body.style.overflow = ''; }
