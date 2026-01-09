console.log('Script.js carregado!');

// Cache DOM elements
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Toggle mobile menu
navToggle.addEventListener('click', toggleMenu);

function toggleMenu() {
  navMenu.classList.toggle('active');
  const icon = navToggle.querySelector('i');
  icon.classList.toggle('fa-bars');
  icon.classList.toggle('fa-times');
}

// Close mobile menu when clicking on links
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      navToggle.querySelector('i').classList.add('fa-bars');
      navToggle.querySelector('i').classList.remove('fa-times');
    }
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const navbarHeight = navbar.offsetHeight;
      const targetPosition =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Handle external links
document.querySelectorAll('[data-link]').forEach(element => {
  element.addEventListener('click', function() {
    window.open(this.getAttribute('data-link'), '_blank');
  });
});

// Navbar shadow on scroll
window.addEventListener('scroll', function() {
  const currentScroll = window.pageYOffset;
  navbar.style.boxShadow =
    currentScroll <= 0
      ? 'none'
      : '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
});

// Intersection Observer animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      entry.target.style.opacity = '1';
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document
  .querySelectorAll('.stat-card, .offer-card')
  .forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });

// Stats counter
function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16);

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target + '+';
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current) + '+';
    }
  }, 16);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target
        .querySelectorAll('.stat-value[data-target]')
        .forEach(stat => {
          animateCounter(
            stat,
            parseInt(stat.getAttribute('data-target'))
          );
        });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);

// Hero parallax
window.addEventListener('scroll', function() {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    heroBg.style.transform =
      `translateX(-50%) translateY(${window.pageYOffset * 0.5}px)`;
  }
});

// Active nav link
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navbarHeight = navbar.offsetHeight;

  sections.forEach(section => {
    const top = section.offsetTop - navbarHeight - 100;
    const bottom = top + section.offsetHeight;
    const scroll = window.pageYOffset;

    if (scroll >= top && scroll < bottom) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(
        `.nav-link[href="#${section.id}"]`
      );
      if (link) link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);

// Twitch
function checkStreamStatus() {
  loadTwitchEmbed();
}

function loadTwitchEmbed() {
  const container = document.getElementById('twitch-embed-container');
  const loader = document.getElementById('streamLoader');
  if (!container) return;

  if (loader) loader.style.display = 'flex';
  container.innerHTML = '';

  const embed = new Twitch.Embed('twitch-embed-container', {
    channel: 'obaba_yaga',
    width: '100%',
    height: '100%',
    layout: 'video'
  });

  embed.addEventListener(Twitch.Embed.VIDEO_READY, () => {
    if (loader) loader.style.display = 'none';
  });

  setTimeout(() => {
    if (loader) loader.style.display = 'none';
  }, 4000);
}

function initializeApp() {
  if (window.Twitch && window.Twitch.Embed) {
    checkStreamStatus();
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', initializeApp)
  : initializeApp();

/* =====================================================
   === ADIÇÃO: GARANTIR LOADER ATÉ IFRAME CARREGAR ===
   ===================================================== */

function attachTwitchIframeLoader() {
  const loader = document.getElementById('streamLoader');
  const container = document.getElementById('twitch-embed-container');
  if (!loader || !container) return;

  loader.style.display = 'flex';

  const observer = new MutationObserver(() => {
    const iframe = container.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', () => {
        loader.style.display = 'none';
      });

      setTimeout(() => {
        loader.style.display = 'none';
      }, 4000);

      observer.disconnect();
    }
  });

  observer.observe(container, { childList: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', attachTwitchIframeLoader);
