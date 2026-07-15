// public/js/main.js
document.addEventListener('DOMContentLoaded', function() {
  // Hamburger toggle
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('active');
      mainNav.classList.toggle('open');
    });
    // Close nav on link click (mobile)
    document.querySelectorAll('.main-nav ul li a').forEach(link => {
      link.addEventListener('click', function(e) {
        const dropdown = this.nextElementSibling;
        if (dropdown && dropdown.classList.contains('dropdown')) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('open');
          }
        } else {
          if (window.innerWidth <= 768) {
            hamburger.classList.remove('active');
            mainNav.classList.remove('open');
          }
        }
      });
    });
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        const header = document.getElementById('mainHeader');
        if (header && !header.contains(e.target)) {
          hamburger.classList.remove('active');
          mainNav.classList.remove('open');
        }
      }
    });
  }

  // Scroll reveal
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));

  // Sticky header shadow
  const header = document.getElementById('mainHeader');
  if (header) {
    window.addEventListener('scroll', function() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      header.style.boxShadow = currentScroll > 80 ? '0 4px 40px rgba(0,0,0,0.6)' : 'none';
    });
  }

  // Set active nav link based on current page
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav ul li a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === 'index.html' && href === '/'))) {
      link.classList.add('active');
    }
  });
});

// Helper: fetch API
async function submitForm(url, data) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// Expose for use in inline scripts
window.submitForm = submitForm;