/* =========================================================
   Little Genius Explorer - Full Build (Audio Fix)
   ========================================================= */

// ------------------ Config ------------------
const QUESTIONS_PER_GAME = 10;
const NUMBER_GAME_MAX = 20; // numbers 0..20 for quiz difficulty

// ------------------ Utility helpers ------------------
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return await res.json();
  } catch (err) {
    console.error("loadJSON error:", err);
    return [];
  }
}

function speak(text, lang = "en-IN") {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  window.speechSynthesis.speak(utt);
}

// number 0‑1000 to English (kid friendly)
function numberToWords(num) {
  const ones = ["zero","one","two","three","four","five","six","seven","eight","nine"];
  const teens = ["ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10), o = num % 10;
    return tens[t] + (o ? "-" + ones[o] : "");
  }
  if (num < 1000) {
    const h = Math.floor(num / 100), r = num % 100;
    return r ? ones[h] + " hundred " + numberToWords(r) : ones[h] + " hundred";
  }
  if (num === 1000) return "one thousand";
  return String(num);
}

function readableTextColor(hex) {
  if (!hex) return "#111";
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.6 ? "#111" : "#FFF";
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ------------------ Tab handling ------------------
const tabs = document.querySelectorAll("#tabs button");
const contents = {
  animals: document.getElementById("content-animals"),
  numbers: document.getElementById("content-numbers"),
  "letters-en": document.getElementById("content-letters-en"),
  "letters-te": document.getElementById("content-letters-te"),
  "letters-hi": document.getElementById("content-letters-hi"),
  shapes: document.getElementById("content-shapes"),
  colors: document.getElementById("content-colors"),
  games: document.getElementById("content-games")
};
const searchSection = document.getElementById("search-section");

function toggleSection(tab) {
  Object.values(contents).forEach(el => el.classList.add("hidden"));
  contents[tab].classList.remove("hidden");
  searchSection.classList.toggle("hidden", tab !== "animals");
}

tabs.forEach(btn => {
  btn.addEventListener("click", () => {
    tabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    toggleSection(btn.dataset.tab);
  });
});

// ------------------ Animals ------------------
let animalsData = [];
let filteredAnimals = [];

const animalGrid = document.getElementById("animal-grid");
const animalDetail = document.getElementById("animal-detail");
const animalImg = document.getElementById("animal-img");
const animalName = document.getElementById("animal-name");
const animalFact = document.getElementById("animal-fact");
const animalBack = document.getElementById("animal-back");
const animalSoundBtn = document.getElementById("animal-sound-btn"); // AUDIO FIX
const animalSpeakBtn = document.getElementById("animal-speak-btn"); // AUDIO FIX
const searchInput = document.getElementById("search-input");

let currentAnimal = null;              // AUDIO FIX
let currentAnimalAudio = null;         // AUDIO FIX

function renderAnimalGrid(list) {
  animalGrid.innerHTML = "";
  list.forEach(an => {
    const card = document.createElement("div");
    card.className =
      "animal-card bg-gradient-to-br from-pink-200 to-yellow-100 rounded-xl p-2 shadow cursor-pointer hover:scale-105 transition";
    card.innerHTML = `
      <img src="${an.image}" alt="${an.name}" class="rounded-xl w-full h-32 object-contain" />
      <p class="text-center text-lg font-bold mt-2">${an.name}</p>
    `;
    card.addEventListener("click", () => showAnimal(an));
    animalGrid.appendChild(card);
  });
}

function showAnimal(an) {
  currentAnimal = an; // AUDIO FIX
  // reset old audio
  if (currentAnimalAudio) {
    currentAnimalAudio.pause();
    currentAnimalAudio = null;
  }
  // prepare audio but DO NOT autoplay (avoid autoplay block)
  if (an.sound) {
    currentAnimalAudio = new Audio(an.sound);
  }

  animalGrid.style.display = "none";
  animalDetail.classList.remove("hidden");
  animalImg.src = an.image;
  animalName.textContent = an.name;
  animalFact.textContent = an.fact;
}

animalBack.addEventListener("click", () => {
  animalDetail.classList.add("hidden");
  animalGrid.style.display = "";
});

// PLAY SOUND BUTTON (ANIMALS) --------------------------
animalSoundBtn?.addEventListener("click", () => {
  if (!currentAnimal) return;
  if (!currentAnimalAudio) {
    if (currentAnimal.sound) currentAnimalAudio = new Audio(currentAnimal.sound);
    else return;
  }
  currentAnimalAudio.currentTime = 0;
  currentAnimalAudio.play().catch(err => console.warn("Animal audio play error:", err));
});

// SPEAK BUTTON (ANIMALS) -------------------------------
animalSpeakBtn?.addEventListener("click", () => {
  if (!currentAnimal) return;
  speak(`${currentAnimal.name}. ${currentAnimal.fact}`, "en-IN");
});

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  renderAnimalGrid(filteredAnimals.filter(a => a.name.toLowerCase().includes(q)));
});

// ------------------ Numbers ------------------
const numbersGrid = document.getElementById("numbers-grid");
const numbersGenerate = document.getElementById("numbers-generate");
const numStart = document.getElementById("num-start");
const numEnd = document.getElementById("num-end");

function renderNumbers(start, end) {
  numbersGrid.innerHTML = "";
  if (end < start) [start, end] = [end, start];
  start = Math.max(0, start);
  end = Math.min(1000, end);
  for (let i = start; i <= end; i++) {
    const div = document.createElement("div");
    div.className =
      "number-card bg-blue-100 rounded p-3 text-center cursor-pointer hover:scale-105 transition";
    div.innerHTML = `<span class="text-xl font-bold">${i}</span><p>${numberToWords(i)}</p>`;
    div.addEventListener("click", () => speak(numberToWords(i)));
    numbersGrid.appendChild(div);
  }
}
numbersGenerate.addEventListener("click", () => {
  renderNumbers(parseInt(numStart.value, 10), parseInt(numEnd.value, 10));
});

// ------------------ Letters ------------------
async function renderLetters(path, gridEl, lang) {
  const letters = await loadJSON(path);
  gridEl.innerHTML = "";
  letters.forEach(l => {
    const div = document.createElement("div");
    div.className =
      "letter-card bg-yellow-100 rounded p-4 text-center text-2xl font-bold cursor-pointer hover:scale-105 transition";
    div.textContent = l.char;
    div.addEventListener("click", () => {
      if (l.sound) new Audio(l.sound).play().catch(()=>speak(l.char, lang));
      else speak(l.char, lang);
    });
    gridEl.appendChild(div);
  });
}

// ------------------ Shapes ------------------
let shapesData = [];
async function renderShapes() {
  shapesData = await loadJSON("data/shapes.json");
  const shapesGrid = document.getElementById("shapes-grid");
  shapesGrid.innerHTML = "";
  shapesData.forEach(shape => {
    const div = document.createElement("div");
    div.className =
      "shape-card bg-white p-4 rounded shadow text-center cursor-pointer hover:scale-105 transition";
    div.innerHTML = `
      <img src="${shape.icon}" alt="${shape.name}" class="w-16 h-16 mx-auto mb-2 object-contain" />
      <p class="font-bold">${shape.name}</p>`;
    // AUDIO FIX: play shape.sound or speak name
    div.addEventListener("click", () => {
      if (shape.sound) {
        const a = new Audio(shape.sound);
        a.play().catch(()=>speak(shape.name));
      } else {
        speak(shape.name);
      }
    });
    shapesGrid.appendChild(div);
  });
}

// ------------------ Colors ------------------
let colorsData = [];
async function renderColors() {
  colorsData = await loadJSON("data/colors.json");
  const colorsGrid = document.getElementById("colors-grid");
  colorsGrid.innerHTML = "";
  colorsData.forEach(color => {
    const div = document.createElement("div");
    div.className =
      "color-card p-6 rounded shadow text-center cursor-pointer hover:scale-105 transition";
    div.style.backgroundColor = color.color;
    div.innerHTML = `<p style="color:${readableTextColor(color.color)}" class="font-bold">${color.name}</p>`;
    div.addEventListener("click",() => speak(color.name));
    colorsGrid.appendChild(div);
  });
}

/* =========================================================
   Games
   ========================================================= */

const gameArea = document.getElementById("game-area");
const gameContent = document.getElementById("game-content");
const backToMenu = document.getElementById("back-to-menu");

let gameMode = null;           // 'shape' | 'color' | 'number'
let gamePlayerName = "";
let gameScore = 0;
let gameQIndex = 0;
let gameCurrentAnswer = null;
let gameLocked = false;

function startGame(mode) {
  if (!shapesData.length || !colorsData.length) {
    console.warn("Data not loaded yet; forcing reload.");
  }
  gameMode = mode;
  gamePlayerName = prompt("Enter your name:") || "Player";
  gameScore = 0;
  gameQIndex = 0;
  gameLocked = false;

  document.querySelector(".games-menu").classList.add("hidden");
  gameArea.classList.remove("hidden");
  nextGameQuestion();
}

function nextGameQuestion() {
  gameQIndex++;
  gameLocked = false;

  if (gameQIndex > QUESTIONS_PER_GAME) {
    finishGame();
    return;
  }

  if (gameMode === "shape") askShapeQuestion();
  else if (gameMode === "color") askColorQuestion();
  else askNumberQuestion();
}

function askShapeQuestion() {
  const qNum = `Question ${gameQIndex}/${QUESTIONS_PER_GAME}`;
  const correct = shapesData[Math.floor(Math.random()*shapesData.length)];
  gameCurrentAnswer = correct.name;

  const pool = shapesData.filter(s => s.name !== correct.name);
  const distractors = shuffle(pool).slice(0,3);
  const options = shuffle([correct, ...distractors]);

  gameContent.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${qNum}</h3>
    <div class="text-center mb-4">
      <img src="${correct.icon}" alt="Guess Shape" class="w-24 h-24 mx-auto" />
      <p class="mt-2 text-lg font-semibold">What is this shape?</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="game-opt-wrap"></div>
    <p id="game-feedback" class="mt-4 text-center font-bold"></p>
  `;
  const wrap = document.getElementById("game-opt-wrap");
  options.forEach(opt => {
    const b = document.createElement("button");
    b.className = "bg-white p-4 rounded shadow hover:scale-105 transition";
    b.textContent = opt.name;
    b.addEventListener("click",()=>handleGameAnswer(opt.name === gameCurrentAnswer, b));
    wrap.appendChild(b);
  });
}

function askColorQuestion() {
  const qNum = `Question ${gameQIndex}/${QUESTIONS_PER_GAME}`;
  const correct = colorsData[Math.floor(Math.random()*colorsData.length)];
  gameCurrentAnswer = correct.name;

  const pool = colorsData.filter(c => c.name !== correct.name);
  const distractors = shuffle(pool).slice(0,3);
  const options = shuffle([correct, ...distractors]);

  gameContent.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${qNum}</h3>
    <div class="text-center mb-4">
      <div style="background:${correct.color}" class="w-24 h-24 mx-auto rounded"></div>
      <p class="mt-2 text-lg font-semibold">What is this color?</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="game-opt-wrap"></div>
    <p id="game-feedback" class="mt-4 text-center font-bold"></p>
  `;
  const wrap = document.getElementById("game-opt-wrap");
  options.forEach(opt => {
    const b = document.createElement("button");
    b.className = "p-4 rounded shadow hover:scale-105 transition text-white font-bold";
    b.style.backgroundColor = opt.color;
    b.textContent = opt.name;
    b.addEventListener("click",()=>handleGameAnswer(opt.name === gameCurrentAnswer, b));
    wrap.appendChild(b);
  });
}

function askNumberQuestion() {
  const qNum = `Question ${gameQIndex}/${QUESTIONS_PER_GAME}`;
  const correctNum = Math.floor(Math.random()* (NUMBER_GAME_MAX+1)); // 0..20
  gameCurrentAnswer = correctNum;

  const nums = new Set([correctNum]);
  while (nums.size < 4) nums.add(Math.floor(Math.random()* (NUMBER_GAME_MAX+1)));
  const options = shuffle([...nums]);

  gameContent.innerHTML = `
    <h3 class="text-xl font-bold mb-2">${qNum}</h3>
    <p class="mb-4 text-lg font-semibold">Which number is <span class="text-blue-600 font-bold">${numberToWords(correctNum)}</span>?</p>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="game-opt-wrap"></div>
    <p id="game-feedback" class="mt-4 text-center font-bold"></p>
  `;
  const wrap = document.getElementById("game-opt-wrap");
  options.forEach(n => {
    const b = document.createElement("button");
    b.className = "bg-blue-400 text-white p-6 rounded shadow text-2xl font-bold hover:bg-blue-500 transition";
    b.textContent = n;
    b.addEventListener("click",()=>handleGameAnswer(n === gameCurrentAnswer, b));
    wrap.appendChild(b);
  });
}

function handleGameAnswer(correct, btn) {
  if (gameLocked) return;
  gameLocked = true;

  const feedbackEl = document.getElementById("game-feedback");

  if (correct) {
    gameScore++;
    btn.classList.add("ring-4","ring-green-400");
    feedbackEl.textContent = "✅ Correct!";
    feedbackEl.classList.remove("text-red-600");
    feedbackEl.classList.add("text-green-600");
    speak("Correct!");
  } else {
    btn.classList.add("ring-4","ring-red-400");
    feedbackEl.textContent = "❌ Try again!";
    feedbackEl.classList.remove("text-green-600");
    feedbackEl.classList.add("text-red-600");
    speak("Try again!");
  }

  setTimeout(nextGameQuestion, 1200);
}

function finishGame() {
  gameContent.innerHTML = `
    <h3 class="text-2xl font-bold mb-4">Great job, ${gamePlayerName}!</h3>
    <p class="text-lg mb-4">You scored <span class="font-bold">${gameScore} / ${QUESTIONS_PER_GAME}</span> in ${labelForMode(gameMode)}.</p>
    <button id="cert-download-btn" class="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition">Download Certificate</button>
    <button id="play-again-btn" class="ml-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition">Play Again</button>
  `;
  document.getElementById("cert-download-btn").addEventListener("click", () => {
    generateCertificatePNG({
      name: gamePlayerName,
      score: gameScore,
      total: QUESTIONS_PER_GAME,
      mode: labelForMode(gameMode)
    });
    gamePlayerName = ""; // reset name for next child
  });
  document.getElementById("play-again-btn").addEventListener("click", () => {
    gameArea.classList.add("hidden");
    document.querySelector(".games-menu").classList.remove("hidden");
    resetGameState();
  });
}

function labelForMode(mode) {
  if (mode === "shape") return "Shape Finding";
  if (mode === "color") return "Color Finding";
  if (mode === "number") return "Number Finding";
  return "Game";
}

function resetGameState() {
  gameMode = null;
  gameScore = 0;
  gameQIndex = 0;
  gameCurrentAnswer = null;
  gameLocked = false;
}

backToMenu.addEventListener("click", () => {
  gameArea.classList.add("hidden");
  document.querySelector(".games-menu").classList.remove("hidden");
  resetGameState();
});

// ------------------ Certificate PNG ------------------
function generateCertificatePNG({name, score, total, mode}) {
  let certCanvas = document.getElementById("lge-cert-canvas");
  if (!certCanvas) {
    certCanvas = document.createElement("canvas");
    certCanvas.id = "lge-cert-canvas";
    certCanvas.className = "hidden";
    document.body.appendChild(certCanvas);
  }
  const w = 1400, h = 1000;
  certCanvas.width = w;
  certCanvas.height = h;
  const ctx = certCanvas.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#fbcfe8");
  g.addColorStop(0.5, "#fef9c3");
  g.addColorStop(1, "#bae6fd");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 20;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  ctx.font = '72px "Comic Sans MS", "Poppins", sans-serif';
  ctx.fillStyle = "#2563eb";
  ctx.textAlign = "center";
  ctx.fillText("Little Genius Explorer", w / 2, 180);

  ctx.font = '60px "Poppins", sans-serif';
  ctx.fillStyle = "#1f2937";
  ctx.fillText("Certificate of Achievement", w / 2, 280);

  ctx.font = '40px "Poppins", sans-serif';
  ctx.fillStyle = "#374151";
  ctx.fillText("Awarded to", w / 2, 360);

  ctx.font = '72px "Comic Sans MS", "Poppins", sans-serif';
  ctx.fillStyle = "#db2777";
  ctx.fillText(name || "Young Explorer", w / 2, 460);

  ctx.font = '44px "Poppins", sans-serif';
  ctx.fillStyle = "#1e3a8a";
  ctx.fillText(`Score: ${score} / ${total} (${mode})`, w / 2, 540);

  ctx.font = '32px "Poppins", sans-serif';
  ctx.fillStyle = "#111827";
  ctx.fillText(new Date().toLocaleDateString(), w / 2, 620);

  for (let i = 0; i < 100; i++) {
    ctx.beginPath();
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * 8 + 2;
    ctx.fillStyle = `hsl(${Math.random() * 360},80%,70%)`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const dataURL = certCanvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `LittleGeniusExplorer_Certificate_${(name || "Player").replace(/\s+/g,'_')}.png`;
  link.href = dataURL;
  link.click();
}

/* ------------------ Init ------------------ */
async function init() {
  animalsData = await loadJSON("data/animals.json");
  filteredAnimals = animalsData;
  renderAnimalGrid(filteredAnimals);

  renderNumbers(0, 20);

  await renderLetters("data/letters_english.json", document.getElementById("letters-en-grid"), "en-IN");
  await renderLetters("data/letters_telugu.json", document.getElementById("letters-te-grid"), "te-IN");
  await renderLetters("data/letters_hindi.json", document.getElementById("letters-hi-grid"), "hi-IN");

  await renderShapes();
  await renderColors();
}

window.addEventListener("load", init);
