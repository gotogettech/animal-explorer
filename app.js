// Ultimate Animal Explorer JS - Modern Version

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

// Number to English words 0-1000
function numberToWords(num) {
  const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
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
  const voices = speechSynthesis.getVoices();
  const match = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0];
  if (match) utt.voice = match;
  speechSynthesis.speak(utt);
}

let animalsData = [];
let filteredAnimals = [];
let currentAnimal = null;
let currentAnimalAudio = null;

// Tabs
const tabs = document.querySelectorAll('#tabs button');
const contents = {
  animals: document.getElementById('content-animals'),
  numbers: document.getElementById('content-numbers'),
  'letters-en': document.getElementById('content-letters-en'),
  'letters-te': document.getElementById('content-letters-te'),
  'letters-hi': document.getElementById('content-letters-hi')
};
const searchSection = document.getElementById('search-section');
const searchInput = document.getElementById('search-input');

function toggleSection(tab) {
  for (const k in contents) {
    contents[k].style.display = (k === tab ? 'block' : 'none');
  }
  if (tab === 'animals') searchSection.classList.remove('hidden');
  else searchSection.classList.add('hidden');
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    toggleSection(btn.dataset.tab);
  });
});

// Animals
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
    card.className = 'animal-card';
    card.innerHTML = `
      <img src="${an.image}" alt="${an.name}" class="rounded-xl" />
      <p class="animal-name">${an.name}</p>
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

// Category filter
catButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    catButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.cat;
    filteredAnimals = (cat === 'All') ? animalsData : animalsData.filter(a => a.category === cat);
    renderAnimalGrid(filteredAnimals);
  });
});

// Search
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  const list = filteredAnimals.filter(a => a.name.toLowerCase().includes(q));
  renderAnimalGrid(list);
});

// Numbers
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
    div.className = 'number-card';
    div.textContent = i;
    div.addEventListener('click', () => speak(numberToWords(i), 'en-IN'));
    numbersGrid.appendChild(div);
  }
}
numbersGenerate.addEventListener('click', () => {
  renderNumbers(parseInt(numStart.value, 10), parseInt(numEnd.value, 10));
});

// Letters
async function renderLetters(path, gridEl, lang) {
  const letters = await loadJSON(path);
  gridEl.innerHTML = '';
  letters.forEach(l => {
    const div = document.createElement('div');
    div.className = 'letter-card';
    div.textContent = l.char;
    div.addEventListener('click', () => speak(l.char, lang));
    gridEl.appendChild(div);
  });
}

// Init
async function init() {
  animalsData = await loadJSON('data/animals.json');
  filteredAnimals = animalsData;
  renderAnimalGrid(filteredAnimals);
  renderNumbers(0, 20);
  await renderLetters('data/letters_english.json', document.getElementById('letters-en-grid'), 'en-IN');
  await renderLetters('data/letters_telugu.json', document.getElementById('letters-te-grid'), 'te-IN');
  await renderLetters('data/letters_hindi.json', document.getElementById('letters-hi-grid'), 'hi-IN');
}

window.addEventListener('load', () => {
  speechSynthesis.onvoiceschanged = () => { };
  init();
});
