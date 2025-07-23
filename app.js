// Little Genius Explorer - Modern & Animated (Shapes + Colors Fix + Games)

// ------------------ Utilities ------------------
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

function numberToWords(num) {
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (num < 10) return ones[num];
  if (num < 20) return teens[num-10];
  if (num < 100) {
    const t = Math.floor(num/10), o = num%10;
    return tens[t] + (o?'-'+ones[o]:'');
  }
  if (num < 1000) {
    const h = Math.floor(num/100), r = num%100;
    return r===0 ? ones[h]+' hundred' : ones[h]+' hundred '+numberToWords(r);
  }
  if (num === 1000) return 'one thousand';
  return String(num);
}

function speak(text, lang='en-IN') {
  if (!window.speechSynthesis) { alert('Speech not supported'); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  const voices = speechSynthesis.getVoices();
  const match = voices.find(v=>v.lang===lang) || voices.find(v=>v.lang.startsWith(lang.split('-')[0])) || voices[0];
  if (match) utt.voice = match;
  speechSynthesis.speak(utt);
}

function readableTextColor(hex) {
  const h = hex.replace('#','');
  let r,g,b;
  if (h.length === 3) {
    r = parseInt(h[0]+h[0],16);
    g = parseInt(h[1]+h[1],16);
    b = parseInt(h[2]+h[2],16);
  } else {
    r = parseInt(h.slice(0,2),16);
    g = parseInt(h.slice(2,4),16);
    b = parseInt(h.slice(4,6),16);
  }
  const l = (0.299*r + 0.587*g + 0.114*b)/255;
  return l > 0.6 ? '#111827' : '#FFFFFF';
}

// ------------------ Global State ------------------
let animalsData = [];
let filteredAnimals = [];
let currentAnimal = null;
let currentAnimalAudio = null;

// ------------------ Tabs ------------------
const tabs = document.querySelectorAll('#tabs button');
const contents = {
  animals: document.getElementById('content-animals'),
  numbers: document.getElementById('content-numbers'),
  'letters-en': document.getElementById('content-letters-en'),
  'letters-te': document.getElementById('content-letters-te'),
  'letters-hi': document.getElementById('content-letters-hi'),
  shapes: document.getElementById('content-shapes'),
  colors: document.getElementById('content-colors'),
  games: document.getElementById('content-games') || null
};
const searchSection = document.getElementById('search-section');
const searchInput = document.getElementById('search-input');

function toggleSection(tab) {
  Object.entries(contents).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('hidden', key !== tab);
  });
  searchSection.classList.toggle('hidden', tab !== 'animals');
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    toggleSection(btn.dataset.tab);
  });
});

// ------------------ Animals ------------------
const animalGrid = document.getElementById('animal-grid');
const animalDetail = document.getElementById('animal-detail');
const animalImg = document.getElementById('animal-img');
const animalName = document.getElementById('animal-name');
const animalFact = document.getElementById('animal-fact');
const animalBack = document.getElementById('animal-back');
const animalSoundBtn = document.getElementById('animal-sound-btn');
const animalSpeakBtn = document.getElementById('animal-speak-btn');
const catButtons = document.querySelectorAll('#animal-category-filters .cat-button');

function renderAnimalGrid(list) {
  animalGrid.innerHTML = '';
  list.forEach(an => {
    const card = document.createElement('div');
    card.className = 'animal-card bg-gradient-to-br from-pink-200 to-yellow-100 rounded-xl p-2 shadow-lg hover:scale-110 transition-transform cursor-pointer';
    card.innerHTML = `
      <img src="${an.image}" alt="${an.name}" class="rounded-xl w-full h-32 object-contain" />
      <p class="text-center text-lg font-bold mt-2">${an.name}</p>
    `;
    card.addEventListener('click', () => showAnimal(an));
    animalGrid.appendChild(card);
  });
}

function showAnimal(an) {
  currentAnimal = an;
  animalGrid.style.display = 'none';
  document.getElementById('animal-category-filters').style.display = 'none';
  animalDetail.classList.remove('hidden');
  animalImg.src = an.image;
  animalImg.alt = an.name;
  animalName.textContent = an.name;
  animalFact.textContent = an.fact;
  if (currentAnimalAudio) currentAnimalAudio.pause();
  currentAnimalAudio = new Audio(an.sound);
}

animalBack.addEventListener('click', () => {
  animalDetail.classList.add('hidden');
  animalGrid.style.display = '';
  document.getElementById('animal-category-filters').style.display = '';
});

animalSoundBtn.addEventListener('click', () => {
  if (currentAnimalAudio) { currentAnimalAudio.currentTime = 0; currentAnimalAudio.play(); }
});
animalSpeakBtn.addEventListener('click', () => {
  if (!currentAnimal) return;
  speak(`${currentAnimal.name}. ${currentAnimal.fact}`, 'en-IN');
});

catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    catButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    filteredAnimals = (cat === 'All') ? animalsData : animalsData.filter(a => a.category === cat);
    renderAnimalGrid(filteredAnimals);
  });
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  renderAnimalGrid(filteredAnimals.filter(a => a.name.toLowerCase().includes(q)));
});

// ------------------ Numbers ------------------
const numbersGrid = document.getElementById('numbers-grid');
const numbersGenerate = document.getElementById('numbers-generate');
const numStart = document.getElementById('num-start');
const numEnd = document.getElementById('num-end');

function renderNumbers(start, end) {
  numbersGrid.innerHTML = '';
  if (end < start) [start, end] = [end, start];
  start = Math.max(0, start);
  end = Math.min(1000, end);
  for (let i = start; i <= end; i++) {
    const div = document.createElement('div');
    div.className = 'number-card bg-gradient-to-br from-green-200 to-blue-100 rounded-lg shadow-lg text-center text-xl font-bold flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-110 transition-transform';
    div.innerHTML = `<span>${i}</span><p class="text-sm text-gray-700">${numberToWords(i)}</p>`;
    div.addEventListener('click', () => speak(numberToWords(i), 'en-IN'));
    numbersGrid.appendChild(div);
  }
}
numbersGenerate.addEventListener('click', () => {
  renderNumbers(parseInt(numStart.value, 10), parseInt(numEnd.value, 10));
});

// ------------------ Letters ------------------
async function renderLetters(path, gridEl, lang) {
  const letters = await loadJSON(path);
  gridEl.innerHTML = '';
  letters.forEach(l => {
    const div = document.createElement('div');
    div.className = 'letter-card bg-gradient-to-br from-yellow-200 to-pink-100 rounded-lg shadow-md text-3xl font-bold p-4 text-center cursor-pointer hover:scale-110 transition-transform';
    div.textContent = l.char;
    div.addEventListener('click', () => {
      if (l.sound) new Audio(l.sound).play().catch(()=>speak(l.char, lang));
      else speak(l.char, lang);
    });
    gridEl.appendChild(div);
  });
}

// ------------------ Shapes ------------------
async function renderShapes() {
  const shapes = await loadJSON('data/shapes.json');
  const shapesGrid = document.getElementById('shapes-grid');
  if (!shapesGrid) return;
  shapesGrid.innerHTML = '';
  shapes.forEach(shape => {
    const div = document.createElement('div');
    div.className = 'shape-card p-4 rounded-lg shadow-lg text-center cursor-pointer hover:scale-110 transition-transform bg-white';
    div.innerHTML = `
      <img src="${shape.icon}" alt="${shape.name}" class="w-16 h-16 mx-auto mb-2" />
      <p class="font-bold text-lg text-gray-800">${shape.name}</p>
    `;
    div.addEventListener('click', () => speak(shape.name, 'en-IN'));
    shapesGrid.appendChild(div);
  });
}

// ------------------ Colors ------------------
async function renderColors() {
  const colors = await loadJSON('data/colors.json');
  const colorsGrid = document.getElementById('colors-grid');
  if (!colorsGrid) return;
  colorsGrid.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-card p-6 rounded-lg shadow-lg text-center cursor-pointer transform transition hover:scale-110';
    div.style.backgroundColor = color.color;
    const fg = readableTextColor(color.color);
    div.innerHTML = `<p class="font-bold text-lg" style="color:${fg}">${color.name}</p>`;
    div.addEventListener('click', () => {
      if (color.sound) new Audio(color.sound).play().catch(()=>speak(color.name,'en-IN'));
      else speak(color.name, 'en-IN');
    });
    colorsGrid.appendChild(div);
  });
}

// ------------------ Games ------------------
const gameButtons = document.querySelectorAll(".game-btn");
const gameArea = document.getElementById("game-area");
const gameContent = document.getElementById("game-content");
const backToMenu = document.getElementById("back-to-menu");

gameButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".games-menu").classList.add("hidden");
    gameArea.classList.remove("hidden");
    const game = btn.dataset.game;
    startGame(game);
  });
});

backToMenu.addEventListener("click", () => {
  gameContent.innerHTML = "";
  gameArea.classList.add("hidden");
  document.querySelector(".games-menu").classList.remove("hidden");
});

// Start specific game
function startGame(game) {
  gameContent.innerHTML = ""; 
  if (game === "shape-match") startShapeMatching();
  else if (game === "color-memory") startColorMemory();
  else if (game === "number-quiz") startNumberQuiz();
}

// ---------- Game 1: Shape Matching ----------
function startShapeMatching() {
  const shapes = ["circle", "square", "triangle", "star", "heart"];
  const cards = [...shapes, ...shapes].sort(() => Math.random() - 0.5);
  let selected = [];
  let matched = [];

  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Shape Matching Game</h3>
    <div id="shape-grid" class="grid grid-cols-3 gap-4"></div>`;

  const grid = document.getElementById("shape-grid");
  cards.forEach(shape => {
    const div = document.createElement("div");
    div.className = "bg-gray-200 p-6 rounded cursor-pointer text-center font-bold text-lg";
    div.textContent = "?";
    div.dataset.shape = shape;
    div.addEventListener("click", () => {
      if (selected.length < 2 && !div.classList.contains("matched")) {
        div.textContent = shape;
        selected.push(div);
        if (selected.length === 2) {
          setTimeout(() => checkMatch(), 800);
        }
      }
    });
    grid.appendChild(div);
  });

  function checkMatch() {
    if (selected[0].dataset.shape === selected[1].dataset.shape) {
      selected.forEach(el => {
        el.classList.add("matched", "bg-green-300");
      });
      matched.push(selected[0].dataset.shape);
    } else {
      selected.forEach(el => (el.textContent = "?"));
    }
    selected = [];
    if (matched.length === shapes.length) {
      alert("🎉 You matched all shapes!");
    }
  }
}

// ---------- Game 2: Color Memory ----------
function startColorMemory() {
  const colors = ["red", "blue", "green", "yellow", "purple"];
  const cards = [...colors, ...colors].sort(() => Math.random() - 0.5);
  let selected = [];

  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Color Memory Game</h3>
    <div id="color-grid" class="grid grid-cols-3 gap-4"></div>`;

  const grid = document.getElementById("color-grid");
  cards.forEach(color => {
    const div = document.createElement("div");
    div.className = "bg-gray-300 h-20 rounded cursor-pointer";
    div.dataset.color = color;
    div.addEventListener("click", () => flipColor(div));
    grid.appendChild(div);
  });

  function flipColor(div) {
    if (selected.length < 2 && !div.classList.contains("matched")) {
      div.style.backgroundColor = div.dataset.color;
      selected.push(div);
      if (selected.length === 2) {
        setTimeout(checkColorMatch, 800);
      }
    }
  }

  function checkColorMatch() {
    if (selected[0].dataset.color === selected[1].dataset.color) {
      selected.forEach(el => el.classList.add("matched"));
    } else {
      selected.forEach(el => (el.style.backgroundColor = "gray"));
    }
    selected = [];
  }
}

// ---------- Game 3: Number Quiz ----------
function startNumberQuiz() {
  let score = 0;
  let question = 1;

  function generateQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const correct = a + b;

    gameContent.innerHTML = `
      <h3 class="text-xl font-bold mb-4">Number Quiz</h3>
      <p class="mb-2">Question ${question}: What is ${a} + ${b}?</p>
      <input type="number" id="answer" class="border p-2 rounded w-24"/>
      <button id="submit-answer" class="bg-blue-500 text-white px-4 py-2 rounded mt-2">Submit</button>
      <p class="mt-4">Score: ${score}</p>
    `;

    document.getElementById("submit-answer").addEventListener("click", () => {
      const userAns = parseInt(document.getElementById("answer").value, 10);
      if (userAns === correct) {
        score++;
        alert("Correct!");
      } else {
        alert("Oops! The answer was " + correct);
      }
      question++;
      generateQuestion();
    });
  }

  generateQuestion();
}


// ------------------ Init ------------------
async function init() {
  animalsData = await loadJSON('data/animals.json');
  filteredAnimals = animalsData;
  renderAnimalGrid(filteredAnimals);
  renderNumbers(0, 20);
  await renderLetters('data/letters_english.json', document.getElementById('letters-en-grid'), 'en-IN');
  await renderLetters('data/letters_telugu.json', document.getElementById('letters-te-grid'), 'te-IN');
  await renderLetters('data/letters_hindi.json', document.getElementById('letters-hi-grid'), 'hi-IN');
  await renderShapes();
  await renderColors();
}

window.addEventListener('load', () => {
  speechSynthesis.onvoiceschanged = () => {};
  init();
});
