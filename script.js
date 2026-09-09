/* ============================================================
   SUPABASE CONFIGURATION
   ============================================================ */
// Gunakan Supabase Project URL
const SUPABASE_URL = "https://supabase.com/dashboard/project/bfiauhohztjnncserzyt";

// Gunakan hanya public anon/publishable key.
// JANGAN memasukkan service_role key ke frontend.
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaWF1aG9oenRqbm5jc2Vyenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NTU4MDIsImV4cCI6MjEwNDUzMTgwMn0.cpsRxbECqCXsPI1eqDkXAkUAf9WMtBDy-uWGkwX40Yc";

let supabase = null;
try {
  if (typeof window.supabase !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.log("Supabase init deferred:", e);
}

document.addEventListener("DOMContentLoaded", () => {
  /* ============================================================
     1. PIN CONFIGURATION & LOCK LOGIC
     ============================================================ */
  const MAIN_PINS = ["100907", "100907"];
  const SECRET_PINS = ["070405", "070405"];

  const pinScreen = document.getElementById("pinScreen");
  const pinCard = document.getElementById("pinCard");
  const pinBoxes = Array.from(document.querySelectorAll(".pin-box"));
  const pinMessage = document.getElementById("pinMessage");
  const pinSubmit = document.getElementById("pinSubmit");
  const slideWrapper = document.getElementById("slideWrapper");
  const secretRoom = document.getElementById("secretRoom");

  // Handle Input Auto Focus
  pinBoxes.forEach((box, index) => {
    box.addEventListener("input", () => {
      box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
      if (box.value && index < pinBoxes.length - 1) {
        pinBoxes[index + 1].focus();
      }
    });

    box.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !box.value && index > 0) {
        pinBoxes[index - 1].focus();
      }
      if (e.key === "Enter") {
        verifyPin();
      }
    });
  });

  pinSubmit.addEventListener("click", verifyPin);

  function verifyPin() {
    const rawPin = pinBoxes.map((b) => b.value).join("");

    if (rawPin.length < 6) {
      showPinError("Hmm... PIN-nya belum tepat.");
      return;
    }

    if (MAIN_PINS.includes(rawPin)) {
      unlockMainWebsite();
    } else if (SECRET_PINS.includes(rawPin)) {
      unlockSecretRoom();
    } else {
      showPinError("Hmm... PIN-nya belum tepat.");
    }
  }

  function showPinError(msg) {
    pinMessage.textContent = msg;
    pinCard.classList.remove("shake");
    void pinCard.offsetWidth; // Force Reflow
    pinCard.classList.add("shake");
    pinBoxes.forEach((b) => (b.value = ""));
    pinBoxes[0].focus();
  }

  function unlockMainWebsite() {
    pinScreen.style.transition = "opacity 0.6s ease";
    pinScreen.style.opacity = "0";
    setTimeout(() => {
      pinScreen.style.display = "none";
      slideWrapper.hidden = false;
      playMainAudio();
    }, 600);
  }

  function unlockSecretRoom() {
    pinScreen.style.transition = "opacity 0.8s ease";
    pinScreen.style.opacity = "0";
    setTimeout(() => {
      pinScreen.style.display = "none";
      secretRoom.hidden = false;
      playSecretAudio();
      checkExistingMessage();
    }, 800);
  }

  /* ============================================================
     2. AUDIO CONTROLLER (SINGLE ACTIVE AUDIO GUARANTEE)
     ============================================================ */
  const audioBirthday = document.getElementById("audioBirthday");
  const audioKeluhan = document.getElementById("audioKeluhan");
  const musicToggleMain = document.getElementById("musicToggleMain");
  const musicToggleSecret = document.getElementById("musicToggleSecret");

  function stopAllAudio() {
    audioBirthday.pause();
    audioBirthday.currentTime = 0;
    audioKeluhan.pause();
    audioKeluhan.currentTime = 0;
  }

  function playMainAudio() {
    stopAllAudio();
    audioBirthday.play().catch(() => {
      // Browser Autoplay blocked
    });
  }

  function playSecretAudio() {
    stopAllAudio();
    audioKeluhan.play().catch(() => {
      // Browser Autoplay blocked
    });
  }

  musicToggleMain.addEventListener("click", () => {
    if (audioBirthday.paused) {
      playMainAudio();
    } else {
      audioBirthday.pause();
    }
  });

  musicToggleSecret.addEventListener("click", () => {
    if (audioKeluhan.paused) {
      playSecretAudio();
    } else {
      audioKeluhan.pause();
    }
  });

  /* ============================================================
     3. MAIN SLIDE NAVIGATION
     ============================================================ */
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));
  const progressCounter = document.getElementById("progressCounter");
  let currentSlide = 1;

  function goToSlide(targetIndex) {
    if (targetIndex < 1 || targetIndex > slides.length) return;

    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    const nextSlide = document.getElementById(`slide${targetIndex}`);
    if (nextSlide) nextSlide.classList.add("active");

    if (dots[targetIndex - 1]) dots[targetIndex - 1].classList.add("active");

    progressCounter.textContent = `0${targetIndex} / 0${slides.length}`;
    currentSlide = targetIndex;
  }

  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => goToSlide(currentSlide + 1));
  });

  document.querySelectorAll("[data-prev]").forEach((btn) => {
    btn.addEventListener("click", () => goToSlide(currentSlide - 1));
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const goto = parseInt(dot.dataset.goto, 10);
      goToSlide(goto);
    });
  });

  /* ============================================================
     4. EXIT SECRET ROOM
     ============================================================ */
  const btnExitSecret = document.getElementById("btnExitSecret");
  btnExitSecret.addEventListener("click", () => {
    stopAllAudio();
    secretRoom.hidden = true;
    pinScreen.style.display = "flex";
    pinScreen.style.opacity = "1";
    pinBoxes.forEach((b) => (b.value = ""));
    pinMessage.textContent = "";
    pinBoxes[0].focus();
  });

  /* ============================================================
     5. SECRET MESSAGE & SUPABASE SINGLE-MESSAGE PERSISTENCE
     ============================================================ */
  const secretForm = document.getElementById("secretForm");
  const secretInput = document.getElementById("secretInput");
  const charCounter = document.getElementById("charCounter");
  const btnSubmitSecret = document.getElementById("btnSubmitSecret");
  const formStatus = document.getElementById("formStatus");
  const savedMessageDisplay = document.getElementById("savedMessageDisplay");
  const savedMessageText = document.getElementById("savedMessageText");

  // Counter Realtime
  secretInput.addEventListener("input", () => {
    charCounter.textContent = `${secretInput.value.length} / 1000`;
  });

  // Check Database / LocalStorage on Init
  async function checkExistingMessage() {
    let existingMsg = null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("birthday_message")
          .select("message")
          .limit(1)
          .maybeSingle();

        if (data && data.message) {
          existingMsg = data.message;
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      }
    }

    // Fallback to LocalStorage
    if (!existingMsg) {
      existingMsg = localStorage.getItem("serina_secret_message");
    }

    if (existingMsg) {
      renderSavedMessage(existingMsg);
    }
  }

  // Handle Submit Pesan
  secretForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = secretInput.value.trim();

    if (!message) return;

    btnSubmitSecret.disabled = true;
    btnSubmitSecret.textContent = "Mengirim...";
    formStatus.textContent = "";

    let success = false;

    // 1. Simpan ke Supabase jika tersedia
    if (supabase) {
      try {
        const { error } = await supabase
          .from("birthday_message")
          .insert([{ message: message }]);

        if (!error) {
          success = true;
        } else {
          console.error("Supabase error:", error);
        }
      } catch (err) {
        console.error("Submit exception:", err);
      }
    }

    // Fallback LocalStorage jika Supabase belum disetup
    if (!success) {
      localStorage.setItem("serina_secret_message", message);
      success = true;
    }

    if (success) {
      renderSavedMessage(message);
    } else {
      btnSubmitSecret.disabled = false;
      btnSubmitSecret.textContent = "Kirim Pesan";
      formStatus.textContent = "Sepertinya pesanmu belum berhasil dikirim. Coba lagi sebentar.";
    }
  });

  // Fungsi Render & Hapus Input Form Sempurna (Keamanan TextContent)
  function renderSavedMessage(msgText) {
    // Completely Hide/Remove Input Elements
    secretForm.style.display = "none";
    document.querySelector(".secret-prompt").style.display = "none";

    // Display Saved Message Safely via textContent
    savedMessageText.textContent = msgText;
    savedMessageDisplay.hidden = false;
  }

  /* ============================================================
     6. BACKGROUND PARTICLES
     ============================================================ */
  function createParticles() {
    const bgDecor = document.getElementById("bgDecor");
    const count = window.innerWidth < 600 ? 15 : 30;

    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 4 + 2;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `-20px`;
      p.style.setProperty("--drift", `${(Math.random() - 0.5) * 80}px`);
      p.style.animationDuration = `${Math.random() * 12 + 8}s`;
      p.style.animationDelay = `${Math.random() * 5}s`;
      bgDecor.appendChild(p);
    }
  }

  createParticles();
  pinBoxes[0].focus();
});
