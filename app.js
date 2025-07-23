// Little Genius Explorer - Final with Games

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

// Number to English words 0-1000
function numberToWords(num) {
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const t = Math.floor(num / 10), o = num % 10;
    return tens[t] + (o ? '-' + ones[o] : '');
  }
  if (num < 1000) {
    const h = Math.floor(num / 100), r = num % 100;
    return r === 0 ? ones[h] + ' hundred' : ones[h] + ' hundred ' + numberToWords(r);
  }
  if (num === 1000) return 'one thousand';
  return String(num);
}

function speak(text, lang = 'en-IN') {
  if (!window.speechSynthesis) { alert('Speech not supported'); return; }
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
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
  games: document.getElementById('content-games')
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
    card.className = 'animal-card bg-gradient-to-br from-pink-200 to-yellow-100 rounded-xl p-2 shadow-lg hover:scale-110 cursor-pointer';
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
  const list = filteredAnimals.filter(a => a.name.toLowerCase().includes(q));
  renderAnimalGrid(list);
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
    div.className = 'number-card bg-gradient-to-br from-green-200 to-blue-100 rounded-lg shadow-lg text-center text-xl font-bold flex flex-col items-center justify-center p-4 hover:scale-110 cursor-pointer';
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
    div.className = 'letter-card bg-gradient-to-br from-yellow-200 to-pink-100 rounded-lg shadow-md text-3xl font-bold p-4 text-center cursor-pointer hover:scale-110';
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
  shapesGrid.innerHTML = '';
  shapes.forEach(shape => {
    const div = document.createElement('div');
    div.className = 'shape-card p-4 rounded-lg shadow-lg text-center hover:scale-110 cursor-pointer bg-white';
    div.innerHTML = `<img src="${shape.icon}" alt="${shape.name}" class="w-16 h-16 mx-auto mb-2"/><p class="font-bold text-lg text-gray-800">${shape.name}</p>`;
    div.addEventListener('click', () => speak(shape.name, 'en-IN'));
    shapesGrid.appendChild(div);
  });
}

// ------------------ Colors ------------------
async function renderColors() {
  const colors = await loadJSON('data/colors.json');
  const colorsGrid = document.getElementById('colors-grid');
  colorsGrid.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-card p-6 rounded-lg shadow-lg text-center hover:scale-110 cursor-pointer';
    div.style.backgroundColor = color.color;
    const fg = readableTextColor(color.color);
    div.innerHTML = `<p class="font-bold text-lg" style="color:${fg}">${color.name}</p>`;
    div.addEventListener('click', () => speak(color.name, 'en-IN'));
    colorsGrid.appendChild(div);
  });
}

// ------------------ Games ------------------
const gamesMenu = document.querySelectorAll('.game-btn');
const gameArea = document.getElementById('game-area');
const gameContent = document.getElementById('game-content');
const backToMenuBtn = document.getElementById('back-to-menu');

gamesMenu.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.games-menu').classList.add('hidden');
    gameArea.classList.remove('hidden');
    const gameType = btn.dataset.game;
    if (gameType === 'shape-match') startShapeMatchGame();
    if (gameType === 'color-memory') startColorMemoryGame();
    if (gameType === 'number-quiz') startNumberQuiz();
  });
});

backToMenuBtn.addEventListener('click', () => {
  gameArea.classList.add('hidden');
  document.querySelector('.games-menu').classList.remove('hidden');
  gameContent.innerHTML = '';
});

// --- Shape Matching Game ---
function startShapeMatchGame() {
  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Shape Matching Game</h3>`;
  loadJSON('data/shapes.json').then(shapes => {
    const shape = shapes[Math.floor(Math.random()*shapes.length)];
    gameContent.innerHTML += `<p class="mb-2">Find this shape: <strong>${shape.name}</strong></p>`;
    const options = shapes.sort(() => 0.5 - Math.random()).slice(0, 4);
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'grid grid-cols-2 gap-4';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'bg-white p-4 shadow rounded hover:bg-gray-200';
      btn.innerHTML = `<img src="${opt.icon}" class="w-12 h-12 mx-auto mb-2"/><span>${opt.name}</span>`;
      btn.addEventListener('click', () => {
        if (opt.name === shape.name) alert('Correct!');
        else alert('Try Again!');
      });
      optionsDiv.appendChild(btn);
    });
    gameContent.appendChild(optionsDiv);
  });
}

// --- Color Memory Game ---
function startColorMemoryGame() {
  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Color Memory Game</h3>`;
  loadJSON('data/colors.json').then(colors => {
    const color = colors[Math.floor(Math.random()*colors.length)];
    gameContent.innerHTML += `<p class="mb-2">Find the color: <strong>${color.name}</strong></p>`;
    const options = colors.sort(() => 0.5 - Math.random()).slice(0, 4);
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'grid grid-cols-2 gap-4';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'p-4 rounded shadow';
      btn.style.backgroundColor = opt.color;
      btn.addEventListener('click', () => {
        if (opt.name === color.name) alert('Correct!');
        else alert('Try Again!');
      });
      optionsDiv.appendChild(btn);
    });
    gameContent.appendChild(optionsDiv);
  });
}

// --- Number Quiz Game ---
function startNumberQuiz() {
  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Number Quiz</h3>`;
  const num = Math.floor(Math.random()*50)+1;
  gameContent.innerHTML += `<p class="mb-2">What number is this: <strong>${numberToWords(num)}</strong>?</p>`;
  const optionsDiv = document.createElement('div');
  optionsDiv.className = 'grid grid-cols-2 gap-4';
  [num, num+1, num+2, num-1].sort(() => 0.5 - Math.random()).forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bg-white p-4 shadow rounded hover:bg-gray-200';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      if (opt === num) alert('Correct!');
      else alert('Wrong! The answer was ' + num);
    });
    optionsDiv.appendChild(btn);
  });
  gameContent.appendChild(optionsDiv);
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

window.addEventListener('load', init);
