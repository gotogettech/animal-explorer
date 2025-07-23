// Little Genius Explorer - Final Version

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
  window.speechSynthesis.speak(utt);
}

function numberToWords(num) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred ' + (num % 100 ? numberToWords(num % 100) : '');
  if (num === 1000) return 'one thousand';
  return String(num);
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
  games: document.getElementById('content-games'),
  certificate: document.getElementById('content-certificate')
};

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    for (const key in contents) {
      contents[key]?.classList.add('hidden');
    }
    contents[btn.dataset.tab]?.classList.remove('hidden');
  });
});

// ------------------ Animals ------------------
let animalsData = [];
let filteredAnimals = [];
let currentAnimalAudio = null;

const animalGrid = document.getElementById('animal-grid');
const animalDetail = document.getElementById('animal-detail');
const animalImg = document.getElementById('animal-img');
const animalName = document.getElementById('animal-name');
const animalFact = document.getElementById('animal-fact');
const animalSoundBtn = document.getElementById('animal-sound-btn');
const animalSpeakBtn = document.getElementById('animal-speak-btn');

function renderAnimalGrid(list) {
  animalGrid.innerHTML = '';
  list.forEach(an => {
    const card = document.createElement('div');
    card.className = 'animal-card bg-gradient-to-br from-pink-200 to-yellow-100 rounded-xl p-2 shadow hover:scale-105';
    card.innerHTML = `<img src="${an.image}" alt="${an.name}" class="rounded-xl w-full h-32 object-contain"/><p class="text-center font-bold mt-2">${an.name}</p>`;
    card.addEventListener('click', () => showAnimal(an));
    animalGrid.appendChild(card);
  });
}

function showAnimal(an) {
  animalDetail.classList.remove('hidden');
  animalGrid.style.display = 'none';
  animalImg.src = an.image;
  animalName.textContent = an.name;
  animalFact.textContent = an.fact;
  currentAnimalAudio = new Audio(an.sound);
}

document.getElementById('animal-back').addEventListener('click', () => {
  animalDetail.classList.add('hidden');
  animalGrid.style.display = '';
});

animalSoundBtn.addEventListener('click', () => currentAnimalAudio?.play());
animalSpeakBtn.addEventListener('click', () => {
  if (animalName.textContent) speak(animalName.textContent + '. ' + animalFact.textContent);
});

document.getElementById('search-input').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  renderAnimalGrid(animalsData.filter(a => a.name.toLowerCase().includes(q)));
});

// ------------------ Numbers ------------------
const numbersGrid = document.getElementById('numbers-grid');
document.getElementById('numbers-generate').addEventListener('click', () => {
  const start = parseInt(document.getElementById('num-start').value) || 0;
  const end = parseInt(document.getElementById('num-end').value) || 20;
  renderNumbers(start, end);
});

function renderNumbers(start, end) {
  numbersGrid.innerHTML = '';
  for (let i = start; i <= end; i++) {
    const div = document.createElement('div');
    div.className = 'number-card bg-green-200 p-4 rounded shadow text-center cursor-pointer';
    div.innerHTML = `<span class="text-xl font-bold">${i}</span><p class="text-sm">${numberToWords(i)}</p>`;
    div.addEventListener('click', () => speak(numberToWords(i)));
    numbersGrid.appendChild(div);
  }
}

// ------------------ Letters ------------------
async function renderLetters(path, grid, lang) {
  const letters = await loadJSON(path);
  grid.innerHTML = '';
  letters.forEach(l => {
    const div = document.createElement('div');
    div.className = 'letter-card bg-yellow-200 p-4 rounded text-center text-2xl font-bold cursor-pointer hover:scale-105';
    div.textContent = l.char;
    div.addEventListener('click', () => l.sound ? new Audio(l.sound).play() : speak(l.char, lang));
    grid.appendChild(div);
  });
}

// ------------------ Shapes & Colors ------------------
async function renderShapes() {
  const shapes = await loadJSON('data/shapes.json');
  const shapesGrid = document.getElementById('shapes-grid');
  shapesGrid.innerHTML = '';
  shapes.forEach(shape => {
    const div = document.createElement('div');
    div.className = 'shape-card bg-white p-4 rounded shadow text-center cursor-pointer hover:scale-105';
    div.innerHTML = `<img src="${shape.icon}" class="w-16 h-16 mx-auto"/><p class="mt-2 font-bold">${shape.name}</p>`;
    div.addEventListener('click', () => speak(shape.name));
    shapesGrid.appendChild(div);
  });
}

async function renderColors() {
  const colors = await loadJSON('data/colors.json');
  const colorsGrid = document.getElementById('colors-grid');
  colorsGrid.innerHTML = '';
  colors.forEach(color => {
    const div = document.createElement('div');
    div.className = 'color-card p-6 rounded shadow cursor-pointer text-white text-lg font-bold text-center hover:scale-105';
    div.style.backgroundColor = color.color;
    div.textContent = color.name;
    div.addEventListener('click', () => speak(color.name));
    colorsGrid.appendChild(div);
  });
}

// ------------------ Games ------------------
let gameScore = 0;
let currentQuestion = 0;
const totalQuestions = 10;

const playerNameInput = document.getElementById('player-name');
const gameArea = document.getElementById('game-area');
const gameQuestion = document.getElementById('game-question');
const gameOptions = document.getElementById('game-options');
const gameScoreDisplay = document.getElementById('game-score');

document.getElementById('start-games-btn').addEventListener('click', startGames);

function startGames() {
  const name = playerNameInput.value.trim();
  if (!name) {
    alert('Please enter your name to start.');
    return;
  }
  gameScore = 0;
  currentQuestion = 0;
  gameArea.classList.remove('hidden');
  nextQuestion();
}

function nextQuestion() {
  if (currentQuestion >= totalQuestions) {
    showCertificate();
    return;
  }
  currentQuestion++;
  const randomNumber = Math.floor(Math.random() * 10);
  gameQuestion.textContent = `Which number is ${randomNumber}?`;
  gameOptions.innerHTML = '';
  const options = [randomNumber, (randomNumber + 1) % 10, (randomNumber + 2) % 10, (randomNumber + 3) % 10].sort(() => 0.5 - Math.random());
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'bg-blue-400 text-white p-2 rounded hover:bg-blue-500';
    btn.textContent = opt;
    btn.addEventListener('click', () => checkAnswer(opt === randomNumber));
    gameOptions.appendChild(btn);
  });
  gameScoreDisplay.textContent = `Score: ${gameScore}/${totalQuestions}`;
}

function checkAnswer(correct) {
  if (correct) gameScore++;
  nextQuestion();
}

function showCertificate() {
  contents.games.classList.add('hidden');
  contents.certificate.classList.remove('hidden');
  document.getElementById('cert-name').textContent = `Congratulations, ${playerNameInput.value}!`;
  document.getElementById('cert-score').textContent = `You scored ${gameScore} out of ${totalQuestions}.`;
}

document.getElementById('restart-btn').addEventListener('click', () => {
  playerNameInput.value = '';
  contents.certificate.classList.add('hidden');
  contents.games.classList.remove('hidden');
  gameArea.classList.add('hidden');
});

// ------------------ Init ------------------
async function init() {
  animalsData = await loadJSON('data/animals.json');
  filteredAnimals = animalsData;
  renderAnimalGrid(animalsData);
  renderNumbers(0, 20);
  await renderLetters('data/letters_english.json', document.getElementById('letters-en-grid'), 'en-IN');
  await renderLetters('data/letters_telugu.json', document.getElementById('letters-te-grid'), 'te-IN');
  await renderLetters('data/letters_hindi.json', document.getElementById('letters-hi-grid'), 'hi-IN');
  await renderShapes();
  await renderColors();
}

window.addEventListener('load', init);
