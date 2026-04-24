const openScroll = document.querySelector("#openScroll");
const letter = document.querySelector("#letter");
const denyBtn = document.querySelector("#denyBtn");
const acceptBtn = document.querySelector("#acceptBtn");
const dialog = document.querySelector("#denyDialog");
const closeDialog = document.querySelector("#closeDialog");
const canvas = document.querySelector("#confetti");
const ctx = canvas.getContext("2d");

let confettiPieces = [];
let confettiFrame = null;

function resizeCanvas() {
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function makeConfetti() {
  const colors = ["#c9302c", "#f4c542", "#2b7bb9", "#3ca45b", "#f07ea8", "#ffffff"];
  confettiPieces = Array.from({ length: 170 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -30 - Math.random() * window.innerHeight * 0.6,
    size: 6 + Math.random() * 10,
    speed: 2.2 + Math.random() * 4.8,
    drift: -2 + Math.random() * 4,
    spin: Math.random() * Math.PI,
    spinSpeed: -0.18 + Math.random() * 0.36,
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

function drawConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speed;
    piece.x += piece.drift + Math.sin(piece.y * 0.018) * 0.8;
    piece.spin += piece.spinSpeed;

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.spin);
    ctx.fillStyle = piece.color;

    if (piece.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, piece.size * 0.42, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.66);
    }

    ctx.restore();
  });

  confettiPieces = confettiPieces.filter((piece) => piece.y < window.innerHeight + 40);

  if (confettiPieces.length) {
    confettiFrame = requestAnimationFrame(drawConfetti);
  } else {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    confettiFrame = null;
  }
}

function startConfetti() {
  if (confettiFrame) cancelAnimationFrame(confettiFrame);
  makeConfetti();
  drawConfetti();
}

function playMusic() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const audio = new AudioContext();
  const master = audio.createGain();
  master.gain.setValueAtTime(0.001, audio.currentTime);
  master.gain.exponentialRampToValueAtTime(0.24, audio.currentTime + 0.04);
  master.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 5.4);
  master.connect(audio.destination);

  const trumpetNotes = [
    [392, 0, 0.22],
    [523.25, 0.23, 0.22],
    [659.25, 0.46, 0.34],
    [523.25, 0.86, 0.2],
    [659.25, 1.08, 0.24],
    [783.99, 1.34, 0.42],
  ];

  trumpetNotes.forEach(([frequency, start, duration]) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime + start);
    oscillator.frequency.linearRampToValueAtTime(frequency * 1.015, audio.currentTime + start + duration);

    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.001, audio.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.32, audio.currentTime + start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(audio.currentTime + start);
    oscillator.stop(audio.currentTime + start + duration + 0.04);
  });

  const melody = [
    [523.25, 1.86, 0.32],
    [587.33, 2.18, 0.32],
    [659.25, 2.5, 0.32],
    [698.46, 2.82, 0.32],
    [659.25, 3.14, 0.3],
    [587.33, 3.44, 0.3],
    [523.25, 3.74, 0.42],
    [440, 4.18, 0.34],
    [523.25, 4.52, 0.58],
  ];

  melody.forEach(([frequency, start, duration], index) => {
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    const filter = audio.createBiquadFilter();

    oscillator.type = index % 2 ? "triangle" : "square";
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime + start);

    filter.type = "lowpass";
    filter.frequency.value = 1600;
    filter.Q.value = 0.7;

    gain.gain.setValueAtTime(0.001, audio.currentTime + start);
    gain.gain.exponentialRampToValueAtTime(0.11, audio.currentTime + start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + start + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    oscillator.start(audio.currentTime + start);
    oscillator.stop(audio.currentTime + start + duration + 0.03);
  });

  window.setTimeout(() => audio.close(), 5700);
}

function openLetter() {
  openScroll.classList.add("is-opening");
  letter.classList.add("is-open");
  window.setTimeout(() => {
    openScroll.hidden = true;
  }, 700);
  startConfetti();
  playMusic();
}

openScroll.addEventListener("click", openLetter);

denyBtn.addEventListener("click", () => {
  if (denyBtn.dataset.asked === "true") {
    dialog.showModal();
    return;
  }

  denyBtn.textContent = "¿Seguro?";
  denyBtn.dataset.asked = "true";
});

acceptBtn.addEventListener("click", () => {
  acceptBtn.textContent = "Aceptado";
  acceptBtn.classList.add("accepted");
  startConfetti();
  playMusic();
});

closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

if (window.location.hash === "#open") {
  letter.style.transition = "none";
  openScroll.hidden = true;
  letter.classList.add("is-open");
  requestAnimationFrame(() => {
    letter.style.transition = "";
  });
}
