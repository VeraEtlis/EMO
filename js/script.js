'use strict';

const STORAGE_KEY = 'emoTrainerState';
const IMAGE_CHECK = 'img/check1.png';
const IMAGE_CROSS = 'img/check2.png';
const LABEL_PREFIX = 'Напечатай: ';

const QUESTIONS = [
  { id: 'green',       image: 'img/1.png', answer: 'Зелень' },
  { id: 'ashan',       image: 'img/2.png', answer: 'Ашан' },
  { id: 'tyumen',      image: 'img/3.png', answer: 'Тюмень' },
  { id: 'road-roller', image: 'img/4.png', answer: 'Каток' },
  { id: 'ice-rink',    image: 'img/5.png', answer: 'Каток' }
];

let pageNav;
let pageImage;
let answerLabel;
let answerInput;

function loadState() {
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (state !== null && state.order.length === QUESTIONS.length) {
    return state;
  }
  return createNewState();
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createNewState() {
  const state = {
    order: shuffleQuestions(QUESTIONS).map(function (question) {
      return question.id;
    }),
    answers: {},
    currentPageIndex: 0
  };
  saveState(state);
  return state;
}

function getQuestionById(questionId) {
  return QUESTIONS.find(function (question) {
    return question.id === questionId;
  });
}

function shuffleQuestions(questions) {
  const shuffled = questions.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function restartTrainer() {
  localStorage.removeItem(STORAGE_KEY);
  window.location.href = 'index.html';
}

function getMaxOpenedIndex(state) {
  let maxIndex = 0;
  for (let i = 0; i < state.order.length; i++) {
    if (state.order[i] in state.answers) {
      maxIndex = i + 1;
    }
  }
  return maxIndex;
}

function saveAnswer(state) {
  const question = getQuestionById(state.order[state.currentPageIndex]);
  const userAnswer = answerInput.value.trim();

  if (userAnswer === '') {
    return;
  }

  state.answers[question.id] = {
    userAnswer: userAnswer,
    isCorrect: userAnswer === question.answer
  };

  if (state.currentPageIndex === state.order.length - 1) {
    saveState(state);
    window.location.href = 'answers.html';
    return;
  }

  state.currentPageIndex++;
  saveState(state);
  renderTrainer(state);
}

function renderTrainer(state) {
  renderPageNav(state);
  renderCurrentPage(state);
}

function renderPageNav(state) {
  const maxOpenedIndex = getMaxOpenedIndex(state);
  pageNav.innerHTML = '';

  for (let i = 0; i < state.order.length; i++) {
    const navButton = document.createElement('button');
    navButton.type = 'button';
    navButton.className = 'nav-btn';
    navButton.textContent = i + 1;

    if (i <= maxOpenedIndex) {
      navButton.classList.add('is-open');
    } else {
      navButton.disabled = true;
    }

    if (i === state.currentPageIndex) {
      navButton.classList.add('is-active');
    }

    navButton.addEventListener('click', function () {
      state.currentPageIndex = i;
      saveState(state);
      renderTrainer(state);
    });

    pageNav.appendChild(navButton);
  }
}

function renderCurrentPage(state) {
  const question = getQuestionById(state.order[state.currentPageIndex]);
  const savedAnswer = state.answers[question.id];

  pageImage.src = question.image;
  answerLabel.textContent = LABEL_PREFIX + question.answer;
  answerInput.value = savedAnswer !== undefined ? savedAnswer.userAnswer : '';
  answerInput.focus();
}

function paintVowels(text) {
  return text.replace(/[АЕЁИОУЫЭЮЯ]/gi, function (letter) {
    return '<span class="vowel">' + letter + '</span>';
  });
}

function renderAnswers(state) {
  const answersBody = document.getElementById('answers-body');
  answersBody.innerHTML = '';

  for (let i = 0; i < state.order.length; i++) {
    const question = getQuestionById(state.order[i]);
    const answer = state.answers[question.id];
    const row = document.createElement('tr');

    row.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td><img class="answers__image" src="' + question.image + '" alt="Картинка задания" draggable="false"></td>' +
      '<td>' + paintVowels(question.answer) + '</td>' +
      '<td>' + (answer !== undefined ? paintVowels(answer.userAnswer) : '—') + '</td>' +
      '<td><img class="answers__result-image" src="' + (answer !== undefined && answer.isCorrect ? IMAGE_CHECK : IMAGE_CROSS) + '"></td>';

    answersBody.appendChild(row);
  }
}

function paintHeadVowels() {
  const headCells = document.querySelectorAll('#answers-head th');
  for (let i = 0; i < headCells.length; i++) {
    headCells[i].innerHTML = paintVowels(headCells[i].textContent);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const state = loadState();

  if (document.getElementById('page-nav') !== null) {
    pageNav = document.getElementById('page-nav');
    pageImage = document.getElementById('page-image');
    answerLabel = document.getElementById('answer-label');
    answerInput = document.getElementById('answer-input');

    const submitButton = document.getElementById('submit-button');
    submitButton.addEventListener('click', function () {
      saveAnswer(state);
    });

    answerInput.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        saveAnswer(state);
      }
    });

    document.getElementById('reset-button').addEventListener('click', restartTrainer);

    renderTrainer(state);
  } else {
    const lastQuestionId = state.order[state.order.length - 1];
    if (!(lastQuestionId in state.answers)) {
      window.location.href = 'index.html';
      return;
    }

    paintHeadVowels();
    document.getElementById('reset-button').addEventListener('click', restartTrainer);
    renderAnswers(state);
  }
});
