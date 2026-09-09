/* ============================================================
   UCAPAN ULANG TAHUN — SERINA RAHMADANI
   script.js — logika PIN, navigasi slide, dan interaksi kecil
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- GANTI DI SINI: kode PIN ---------- */
  const CORRECT_PIN = '100907'; // format tampilan: 10-09-07

  /* ============================================================
     1. PARTIKEL LATAR BELAKANG
     ============================================================ */
  function buildParticles() {
    const container = document.getElementById('bgDecor');
    if (!container) return;

    const isSmall = window.innerWidth < 560;
    const count = isSmall ? 14 : 26;
    const heartRatio = 0.25; // sebagian kecil partikel berbentuk hati

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      const isHeart = Math.random() < heartRatio;
      el.className = 'particle' + (isHeart ? ' heart' : '');

      const size = isHeart ? (10 + Math.random() * 10) : (2 + Math.random() * 4);
      el.style.left = Math.random() * 100 + '%';
      el.style.bottom = -(20 + Math.random() * 40) + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.fontSize = size + 'px';
      el.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');

      const duration = 14 + Math.random() * 16;
      const delay = Math.random() * 18;
      el.style.animationDuration = duration + 's';
      el.style.animationDelay = '-' + delay + 's';

      container.appendChild(el);
    }
  }
  buildParticles();

  /* ============================================================
     2. PIN LOCK
     ============================================================ */
  const pinScreen = document.getElementById('pinScreen');
  const pinCard = pinScreen.querySelector('.pin-card');
  const pinBoxes = Array.from(document.querySelectorAll('.pin-box'));
  const pinMessage = document.getElementById('pinMessage');
  const pinSubmit = document.getElementById('pinSubmit');
  const slideWrapper = document.getElementById('slideWrapper');

  // auto-lompat ke kotak berikutnya saat mengetik
  pinBoxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/[^0-9]/g, '').slice(0, 1);
      if (box.value && i < pinBoxes.length - 1) {
        pinBoxes[i + 1].focus();
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        pinBoxes[i - 1].focus();
      }
      if (e.key === 'Enter') {
        checkPin();
      }
    });
  });

  pinSubmit.addEventListener('click', checkPin);

  function checkPin() {
    const entered = pinBoxes.map((b) => b.value).join('');

    if (entered.length < 6) {
      showPinError('Isi dulu semua kotaknya ya.');
      return;
    }

    if (entered === CORRECT_PIN) {
      unlockWebsite();
    } else {
      showPinError('Hmm, sepertinya PIN-nya belum tepat.');
    }
  }

  function showPinError(text) {
    pinMessage.textContent = text;
    pinCard.classList.remove('shake');
    // paksa reflow supaya animasi bisa diulang
    void pinCard.offsetWidth;
    pinCard.classList.add('shake');
    pinBoxes.forEach((b) => (b.value = ''));
    pinBoxes[0].focus();
  }

  function unlockWebsite() {
    pinMessage.textContent = '';
    pinScreen.classList.add('unlocking');
    setTimeout(() => {
      pinScreen.style.display = 'none';
      slideWrapper.hidden = false;
      goToSlide(1, 'init');
    }, 650);
  }

  /* ============================================================
     3. NAVIGASI SLIDE
     ============================================================ */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dots = Array.from(document.querySelectorAll('.dot'));
  const progressCounter = document.getElementById('progressCounter');
  let currentSlide = 1;
  const totalSlides = slides.length;

  function goToSlide(target, direction) {
    if (target < 1 || target > totalSlides) return;

    const exitClass = direction === 'next' ? 'exit-left' : 'exit-right';

    slides.forEach((s) => {
      const num = Number(s.dataset.slide);
      if (num === target) {
        s.classList.add('active');
        s.classList.remove('exit-left', 'exit-right');
      } else {
        s.classList.remove('active');
        if (direction && direction !== 'init') s.classList.add(exitClass);
      }
    });

    dots.forEach((d) => {
      d.classList.toggle('active', Number(d.dataset.goto) === target);
    });

    progressCounter.textContent = String(target).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0');

    currentSlide = target;

    if (target === 2) revealAchievements();
    if (target === 3) revealPrayers();
  }

  document.querySelectorAll('[data-next]').forEach((btn) => {
    btn.addEventListener('click', () => goToSlide(currentSlide + 1, 'next'));
  });
  document.querySelectorAll('[data-prev]').forEach((btn) => {
    btn.addEventListener('click', () => goToSlide(currentSlide - 1, 'prev'));
  });
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.goto);
      goToSlide(target, target > currentSlide ? 'next' : 'prev');
    });
  });

  // navigasi keyboard: panah kiri/kanan, mempermudah preview di desktop
  document.addEventListener('keydown', (e) => {
    if (slideWrapper.hidden) return;
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1, 'next');
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1, 'prev');
  });

  /* ============================================================
     4. REVEAL ACHIEVEMENT CARD (slide 2)
     ============================================================ */
  let achievementsRevealed = false;
  function revealAchievements() {
    if (achievementsRevealed) return;
    achievementsRevealed = true;

    const cards = document.querySelectorAll('.achievement-card');
    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('revealed'), 160 * i);
    });
  }

  /* ============================================================
     5. REVEAL DOA SATU PER SATU (slide 3)
     ============================================================ */
  let prayersRevealed = false;
  function revealPrayers() {
    if (prayersRevealed) return;
    prayersRevealed = true;

    const items = document.querySelectorAll('.prayer-item');
    const closing = document.getElementById('prayerClosing');

    items.forEach((item, i) => {
      setTimeout(() => item.classList.add('shown'), 260 * i);
    });

    setTimeout(() => closing.classList.add('shown'), 260 * items.length + 300);
  }

  /* ============================================================
     6. MUSIK LATAR (opsional, tidak autoplay)
     ============================================================ */
  const musicToggle = document.getElementById('musicToggle');
  const bgAudio = document.getElementById('bgAudio');

  musicToggle.addEventListener('click', () => {
    if (bgAudio.paused) {
      bgAudio.play().catch(() => {
        // file audio/birthday.mp3 belum tersedia, abaikan dengan tenang
      });
      musicToggle.classList.add('playing');
    } else {
      bgAudio.pause();
      musicToggle.classList.remove('playing');
    }
  });

  // fokus otomatis ke kotak PIN pertama saat halaman dibuka
  pinBoxes[0].focus();
});
