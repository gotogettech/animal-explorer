// Little Genius Explorer - Final Version with Games & Certificate

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

function speak(text, lang = 'en-IN') {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  speechSynthesis.speak(utt);
}

function numberToWords(num) {
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
  const tens = ['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  if (num < 10) return ones[num];
  if (num < 20) return teens[num-10];
  if (num < 100) return tens[Math.floor(num/10)] + (num % 10 ? '-' + ones[num % 10] : '');
  return num.toString();
}

function readableTextColor(hex) {
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16);
  const g = parseInt(h.slice(2,4),16);
  const b = parseInt(h.slice(4,6),16);
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.6 ? '#111' : '#FFF';
}

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

function toggleSection(tab) {
  for (const k in contents) contents[k].classList.add('hidden');
  contents[tab].classList.remove('hidden');
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
let animalsData = [];
let filteredAnimals = [];
const animalGrid = document.getElementById('animal-grid');
const animalDetail = document.getElementById('animal-detail');
const animalImg = document.getElementById('animal-img');
const animalName = document.getElementById('animal-name');
const animalFact = document.getElementById('animal-fact');
const animalBack = document.getElementById('animal-back');
const searchInput = document.getElementById('search-input');

function renderAnimalGrid(list) {
  animalGrid.innerHTML = '';
  list.forEach(an => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    card.innerHTML = `
      <img src="${an.image}" alt="${an.name}" class="rounded-xl w-full h-32 object-contain" />
      <p class="text-center text-lg font-bold mt-2">${an.name}</p>
    `;
    card.addEventListener('click', () => showAnimal(an));
    animalGrid.appendChild(card);
  });
}

function showAnimal(an) {
  animalGrid.style.display = 'none';
  document.getElementById('animal-category-filters').style.display = 'none';
  animalDetail.classList.remove('hidden');
  animalImg.src = an.image;
  animalName.textContent = an.name;
  animalFact.textContent = an.fact;
  if (an.sound) new Audio(an.sound).play();
}

animalBack.addEventListener('click', () => {
  animalDetail.classList.add('hidden');
  animalGrid.style.display = '';
  document.getElementById('animal-category-filters').style.display = '';
});

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderAnimalGrid(filteredAnimals.filter(a => a.name.toLowerCase().includes(q)));
});

// ------------------ Numbers ------------------
const numbersGrid = document.getElementById('numbers-grid');
const numbersGenerate = document.getElementById('numbers-generate');
const numStart = document.getElementById('num-start');
const numEnd = document.getElementById('num-end');

function renderNumbers(start, end) {
  numbersGrid.innerHTML = '';
  for (let i = start; i <= end; i++) {
    const div = document.createElement('div');
    div.className = 'number-card';
    div.innerHTML = `<span>${i}</span><p>${numberToWords(i)}</p>`;
    div.addEventListener('click', () => speak(numberToWords(i)));
    numbersGrid.appendChild(div);
  }
}
numbersGenerate.addEventListener('click', () => {
  renderNumbers(parseInt(numStart.value), parseInt(numEnd.value));
});

// ------------------ Letters ------------------
async function renderLetters(path, gridEl, lang) {
  const letters = await loadJSON(path);
  gridEl.innerHTML = '';
  letters.forEach(l => {
    const div = document.createElement('div');
    div.className = 'letter-card';
    div.textContent = l.char;
    div.addEventListener('click', () => l.sound ? new Audio(l.sound).play() : speak(l.char, lang));
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
    div.className = 'shape-card';
    div.innerHTML = `<img src="${shape.icon}" alt="${shape.name}" class="w-16 h-16 mx-auto mb-2" />
                     <p>${shape.name}</p>`;
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
    div.className = 'color-card';
    div.style.backgroundColor = color.color;
    div.innerHTML = `<p style="color:${readableTextColor(color.color)}">${color.name}</p>`;
    colorsGrid.appendChild(div);
  });
}

// ------------------ Games ------------------
let currentGame = null;
let currentQuestion = 0;
let score = 0;
let playerName = '';

const gameContent = document.getElementById('game-content');
const backToMenu = document.getElementById('back-to-menu');

function startGame(type) {
  currentGame = type;
  currentQuestion = 0;
  score = 0;
  playerName = prompt("Enter your name:");
  if (!playerName) playerName = "Player";
  document.querySelector('.games-menu').classList.add('hidden');
  document.getElementById('game-area').classList.remove('hidden');
  nextQuestion();
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion > 10) {
    endGame();
    return;
  }
  gameContent.innerHTML = `<h3 class="text-xl font-bold mb-4">Question ${currentQuestion}/10</h3>`;
  if (currentGame === 'shape') renderShapeQuestion();
  else if (currentGame === 'color') renderColorQuestion();
  else renderNumberQuestion();
}

// Shape Game
async function renderShapeQuestion() {
  const shapes = await loadJSON('data/shapes.json');
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  gameContent.innerHTML += `
    <div class="text-center mb-4">
      <img src="${randomShape.icon}" alt="Guess Shape" class="w-24 h-24 mx-auto" />
      <p class="mt-2 text-lg font-semibold">What is this shape?</p>
    </div>
  `;
  renderOptions(shapes, randomShape.name);
}

// Color Game
async function renderColorQuestion() {
  const colors = await loadJSON('data/colors.json');
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  gameContent.innerHTML += `
    <div class="text-center mb-4">
      <div style="background:${randomColor.color}" class="w-24 h-24 mx-auto rounded"></div>
      <p class="mt-2 text-lg font-semibold">What is this color?</p>
    </div>
  `;
  renderOptions(colors, randomColor.name);
}

// Number Game
function renderNumberQuestion() {
  const num = Math.floor(Math.random() * 10);
  gameContent.innerHTML += `
    <p class="mb-2 text-lg font-semibold">Which number is "${numberToWords(num)}"?</p>
  `;
  const options = [num];
  while (options.length < 4) {
    const randomNum = Math.floor(Math.random() * 10);
    if (!options.includes(randomNum)) options.push(randomNum);
  }
  renderOptions(options.map(n => ({ name: n })), num);
}

function renderOptions(options, correctAnswer) {
  const shuffled = options.sort(() => 0.5 - Math.random()).slice(0, 4);
  const optionsContainer = document.createElement('div');
  optionsContainer.className = 'grid grid-cols-2 gap-4';
  shuffled.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600';
    btn.textContent = opt.name;
    btn.addEventListener('click', () => {
      if (opt.name == correctAnswer) score++;
      nextQuestion();
    });
    optionsContainer.appendChild(btn);
  });
  gameContent.appendChild(optionsContainer);
}

function endGame() {
  generateCertificate(playerName, score);
}

backToMenu.addEventListener('click', () => {
  document.querySelector('.games-menu').classList.remove('hidden');
  document.getElementById('game-area').classList.add('hidden');
  gameContent.innerHTML = '';
});

// Certificate
function generateCertificate(name, score) {
  const certWindow = window.open('', '_blank');
  certWindow.document.write(`
    <html><head><title>Certificate</title></head>
    <body style="text-align:center; font-family:sans-serif; background:linear-gradient(#f9fafb, #e5e7eb); padding:20px;">
      <h1 style="color:#2b6cb0;">Little Genius Explorer Certificate</h1>
      <p style="font-size:20px;">Congratulations, <strong>${name}</strong>!</p>
      <p style="font-size:18px;">You scored <strong>${score}/10</strong> in the ${currentGame} game.</p>
      <button onclick="window.print()" style="padding:10px 20px; background:#3b82f6; color:white; border:none; border-radius:5px; margin-top:20px;">Download Certificate</button>
    </body></html>
  `);
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
