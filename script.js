// ===== Formular → VPS (GitHub Pages → LAMP) =====
// Brug HTTPS når VPS har SSL. URL = domæne + websti – IKKE filsti (/var/www/html/...)
const VPS_API_URL = 'https://xn--vestpsydgrovexdk-hob.dk/api/form.php';

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Saml alle formfelter dynamisk (virker for både index.html og kontakt.html)
    const formData = {};
    for (const el of contactForm.elements) {
      if (el.name && el.value && el.type !== 'submit') {
        formData[el.name] = el.value.trim();
      }
    }

    const statusEl = document.getElementById('formStatus') || (() => {
      const div = document.createElement('div');
      div.id = 'formStatus';
      contactForm.appendChild(div);
      return div;
    })();
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sender...';
    }

    try {
      const response = await fetch(VPS_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error('Server returnerede ikke JSON. Svar: ' + text.slice(0, 100));
      }

      if (response.ok && result.success) {
        statusEl.textContent = result.message || 'Tak! Vi kontakter dig snarest.';
        statusEl.classList.add('form-status--success');
        if (result._debug) {
          const dbInfo = ` (${result._debug.database}.forms, ID: ${result._debug.insert_id})`;
          statusEl.textContent += dbInfo;
          console.log('Formular gemt i:', result._debug.database + '.' + result._debug.table, 'ID:', result._debug.insert_id);
        } else {
          console.log('Server svar (ingen _debug):', result);
        }
        contactForm.reset();
      } else {
        statusEl.textContent = result.message || 'Noget gik galt. Prøv igen senere.';
        statusEl.classList.add('form-status--error');
      }
    } catch (error) {
      statusEl.textContent = 'Fejl: ' + (error.message || 'Kunne ikke oprette forbindelse.');
      statusEl.classList.add('form-status--error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// ===== Hamburger menu and right drawer logic =====
const menuToggle = document.getElementById('menuToggle');
const navDrawer = document.getElementById('navDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');

function openDrawer() {
  navDrawer.classList.add('open');
  drawerOverlay.classList.add('open');
  menuToggle.classList.add('open');
}
function closeDrawer() {
  navDrawer.classList.remove('open');
  drawerOverlay.classList.remove('open');
  menuToggle.classList.remove('open');
}
menuToggle.addEventListener('click', () => {
  if (navDrawer.classList.contains('open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
});
drawerOverlay.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDrawer();
});

// Hero slider with horizontal slide animation (only on index page)
const sliderTrack = document.getElementById('sliderTrack');
const sliderDots = document.getElementById('sliderDots');

if (sliderTrack && sliderDots) {
  const sliderImages = [
    'assets/Hero image - Ejer med dashboard.png',
    'assets/Hero image - tjener ved en skærm.png',
    'assets/Hero image - Kunder scanner menuen.png',
    'assets/Hero image - kokke der laver mad.png',
  ];
  let currentSlide = 0;
  let slideTimer;

  function buildSlides() {
    sliderTrack.innerHTML = '';
    sliderImages.forEach((src) => {
      const slide = document.createElement('div');
      slide.className = 'slide';

      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Hero Image';
      slide.appendChild(img);

      sliderTrack.appendChild(slide);
    });
  }

  function renderDots() {
    sliderDots.innerHTML = '';
    sliderImages.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.className = idx === currentSlide ? 'active' : '';
      dot.addEventListener('click', () => {
        goToSlide(idx, true);
      });
      sliderDots.appendChild(dot);
    });
  }

  function goToSlide(index, resetTimer = false) {
    currentSlide = (index + sliderImages.length) % sliderImages.length;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    renderDots();

    if (resetTimer) {
      clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, 4000);
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  buildSlides();
  renderDots();
  goToSlide(0);
  slideTimer = setInterval(nextSlide, 4000);
}


