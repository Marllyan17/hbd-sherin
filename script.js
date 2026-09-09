/* ============================================================
   1. PIN CONFIGURATION & LOCK LOGIC (FIXED)
   ============================================================ */
// Daftar PIN yang valid (Mendukung format tanpa atau dengan strip)
const MAIN_PINS = ["100907", "10-09-07"];   // 10 September 2007
const SECRET_PINS = ["070405", "07-04-05"]; // 07 April 2005

const pinScreen = document.getElementById("pinScreen");
const pinCard = document.getElementById("pinCard");
const pinBoxes = Array.from(document.querySelectorAll(".pin-box"));
const pinMessage = document.getElementById("pinMessage");
const pinSubmit = document.getElementById("pinSubmit");
const slideWrapper = document.getElementById("slideWrapper");
const secretRoom = document.getElementById("secretRoom");

// Handle Navigasi Auto-Focus saat Mengetik Input PIN
pinBoxes.forEach((box, index) => {
  box.addEventListener("input", (e) => {
    // Hanya izinkan angka
    box.value = box.value.replace(/[^0-9]/g, "").slice(0, 1);
    
    // Pindah ke kotak berikutnya secara otomatis
    if (box.value && index < pinBoxes.length - 1) {
      pinBoxes[index + 1].focus();
    }
  });

  box.addEventListener("keydown", (e) => {
    // Pindah ke kotak sebelumnya jika menekan Backspace
    if (e.key === "Backspace" && !box.value && index > 0) {
      pinBoxes[index - 1].focus();
    }
    // Eksekusi ketika menekan tombol Enter
    if (e.key === "Enter") {
      verifyPin();
    }
  });
});

pinSubmit.addEventListener("click", verifyPin);

function verifyPin() {
  // Ambil gabungan angka dari ke-6 kotak input
  const enteredPin = pinBoxes.map((b) => b.value).join("");

  if (enteredPin.length < 6) {
    showPinError("Masukkan 6 digit PIN secara lengkap.");
    return;
  }

  // Cek apakah PIN sesuai
  if (MAIN_PINS.includes(enteredPin)) {
    unlockMainWebsite();
  } else if (SECRET_PINS.includes(enteredPin)) {
    unlockSecretRoom();
  } else {
    showPinError("PIN tidak sesuai. Coba periksa kembali.");
  }
}

function showPinError(msg) {
  pinMessage.textContent = msg;
  pinCard.classList.remove("shake");
  void pinCard.offsetWidth; // Trigger reflow untuk mereset animasi shake
  pinCard.classList.add("shake");
  
  // Kosongkan form dan kembalikan fokus ke kotak pertama
  pinBoxes.forEach((b) => (b.value = ""));
  pinBoxes[0].focus();
}

function unlockMainWebsite() {
  pinScreen.style.transition = "opacity 0.6s ease";
  pinScreen.style.opacity = "0";
  setTimeout(() => {
    pinScreen.style.display = "none";
    slideWrapper.hidden = false;
    if (typeof playMainAudio === "function") playMainAudio();
  }, 600);
}

function unlockSecretRoom() {
  pinScreen.style.transition = "opacity 0.8s ease";
  pinScreen.style.opacity = "0";
  setTimeout(() => {
    pinScreen.style.display = "none";
    secretRoom.hidden = false;
    if (typeof playSecretAudio === "function") playSecretAudio();
    if (typeof checkExistingMessage === "function") checkExistingMessage();
  }, 800);
}
