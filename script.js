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
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      
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



// Add scroll effect to navbar
let lastScroll = 0;

window.addEventListener('scroll', function() {
  const currentScroll = window.pageYOffset;
  navbar.style.boxShadow = currentScroll <= 0 ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.3)';
  lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
      entry.target.style.opacity = '1';
    }
  });
}, observerOptions);

// Observe elements for animations
document.querySelectorAll('.stat-card, .offer-card').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
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

// Observe stats section for counter animation
const statsObserver = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statValues = entry.target.querySelectorAll('.stat-value[data-target]');
      statValues.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        animateCounter(stat, target);
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
  statsObserver.observe(statsSection);
}

// Parallax effect for hero background
window.addEventListener('scroll', function() {
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    const scrolled = window.pageYOffset;
    heroBg.style.transform = `translateX(-50%) translateY(${scrolled * 0.5}px)`;
  }
});

// Add active state to navigation based on scroll position
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navbarHeight = navbar.offsetHeight;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - navbarHeight - 100;
    const sectionBottom = sectionTop + section.offsetHeight;
    const scrollPosition = window.pageYOffset;
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      navLinks.forEach(link => link.classList.remove('active'));
      
      const currentLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
      if (currentLink) {
        currentLink.classList.add('active');
      }
    }
  });
}


window.addEventListener('scroll', updateActiveNavLink);

// Check if stream is live
function checkStreamStatus() {
  const streamPanel = document.querySelector('.stream-panel');

  const streamObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadTwitchEmbed();
      streamObserver.disconnect();
    }
  });

  streamObserver.observe(streamPanel);
  console.log('Verificando status da stream...');
  loadTwitchEmbed();
}

// Detectar se a stream está ao vivo
function detectStreamStatus() {
  console.log('Detectando stream status...');
  // O iframe mostra automaticamente offline/online, sem necessidade de detectar
}

// Carregar o embed do Twitch
function loadTwitchEmbed() {
  
  const container = document.getElementById('twitch-embed-container');
  
  if (!container) {
    console.log('Container não encontrado');
    return;
  }
  
  // Verificar se Twitch está disponível, se não, esperar
  if (window.Twitch && window.Twitch.Embed) {
    // Limpa o container
    container.innerHTML = '';
    
    console.log('Carregando embed do Twitch...');
    
    try {
      // Cria novo embed
      new window.Twitch.Embed('twitch-embed-container', {
        channel: 'obaba_yaga',
        width: '100%',
        height: '100%',
        layout: 'video'
      });
      
      // Esconder o painel offline
      const offlineState = document.getElementById('offlineState');
      if (offlineState) {
        offlineState.style.display = 'none';
      }
    } catch (e) {
      console.log('Erro ao criar embed:', e);
    }
  } else {
    console.log('Twitch API não disponível, usando fallback iframe');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

function initializeApp() {
  console.log('App inicializando...');
  console.log('Twitch disponível:', !!window.Twitch);
  
  // Esperar pelo Twitch API estar carregado, com timeout de 5 segundos
  waitForTwitch(5000);
  
  updateActiveNavLink();
}

let waitTimeout = null;

function waitForTwitch(timeout) {
  if (window.Twitch && window.Twitch.Embed) {
    console.log('Twitch carregado!');
    if (waitTimeout) clearTimeout(waitTimeout);
    checkStreamStatus();
    
    // Recarregar o embed a cada 60 segundos para atualizar estado
    setInterval(function() {
      console.log('Atualizando status da stream...');
      checkStreamStatus();
    }, 60000);
  } else if (timeout > 0) {
    console.log('Aguardando Twitch API... (' + timeout + 'ms)');
    waitTimeout = setTimeout(() => waitForTwitch(timeout - 100), 100);
  } else {
    console.log('Timeout: Twitch API não carregou. Usando fallback.');
    loadTwitchFallback();
  }
}

function loadTwitchFallback() {
  console.log('Carregando fallback iframe...');
  const container = document.getElementById('twitch-embed-container');
  const offlineState = document.getElementById('offlineState');
  
  if (container) {
    container.innerHTML = `
      <iframe
        src="https://player.twitch.tv/?channel=obaba_yaga&parent=${window.location.hostname}"
        height="500"
        width="100%"
        allowfullscreen="">
      </iframe>
    `;
    
    // Esconder o painel offline
    if (offlineState) {
      offlineState.style.display = 'none';
    }
  }
}
