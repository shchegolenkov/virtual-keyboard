import { enBoard, enBoardShift } from './engBoard.js';
import { ruBoard, ruBoardShift } from './ruBoard.js';

const renderContent = (parent = document.body) => {
  const content = `
    <div class="container">
      <h1 class="header">Виртуальная клавиатура</h1>
      <textarea class="textarea" placeholder="Введите текст..." autofocus></textarea>
      <div class="keyboard">
      </div>
      <p class="description">Клавиатура создана в операционной системе Windows</p>
      <p class="description">Для переключения языка: лeвыe Ctrl + Alt</p>
    </div>
  `;

  return parent.insertAdjacentHTML('afterbegin', content);
};

renderContent();

const textarea = document.querySelector('.textarea');
const keyboard = document.querySelector('.keyboard');

const selectLangBoard = () => {
  if (!window.localStorage.getItem('lang')) window.localStorage.setItem('lang', 'ru');

  const currentLang = window.localStorage.getItem('lang');

  const langs = {
    ru: ruBoard,
    en: enBoard,
  };

  return langs[currentLang];
};

let isShiftActive = false;
let capslockCount = 0;

const getCurrentShift = () => {
  const currentLang = window.localStorage.getItem('lang');
  let currentLangBoard = selectLangBoard();
  if (isShiftActive) {
    currentLangBoard = (currentLang === 'ru') ? ruBoardShift : enBoardShift;
  }
  const keys = keyboard.querySelectorAll('.key');
  for (let i = 0; i < keys.length; i += 1) {
    if (keys[i].textContent.length === 1 && isShiftActive && capslockCount % 2) {
      keys[i].textContent = Object.values(currentLangBoard)[i].toLowerCase();
    } else if (keys[i].textContent.length === 1 && !isShiftActive && capslockCount % 2) {
      keys[i].textContent = Object.values(currentLangBoard)[i].toUpperCase();
    } else {
      keys[i].textContent = Object.values(currentLangBoard)[i];
    }
  }
};

const getCurrentCaps = () => {
  const keys = keyboard.querySelectorAll('.key');
  const capslockKey = keyboard.querySelector('[data-code="CapsLock"]');

  if (capslockCount % 2) {
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i].textContent.length === 1
        && keys[i].textContent.match(/[a-zA-Z\u0401\u0451\u0410-\u044f]/)) {
        keys[i].textContent = isShiftActive ? keys[i].textContent.toLowerCase()
          : keys[i].textContent.toUpperCase();
      }
    }
  } else {
    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i].textContent.length === 1
        && keys[i].textContent.match(/[a-zA-Z\u0401\u0451\u0410-\u044f]/)) {
        keys[i].textContent = isShiftActive ? keys[i].textContent.toUpperCase()
          : keys[i].textContent.toLowerCase();
      }
    }
    capslockKey.classList.remove('key--active');
  }
};

const switchLang = () => {
  const changedLang = (window.localStorage.getItem('lang') === 'ru') ? 'en' : 'ru';
  window.localStorage.setItem('lang', changedLang);
  const currentLangBoard = selectLangBoard();

  const keys = keyboard.querySelectorAll('.key');
  for (let i = 0; i < keys.length; i += 1) {
    keys[i].textContent = Object.values(currentLangBoard)[i];
  }
  if (capslockCount % 2) getCurrentCaps();
  if (isShiftActive) getCurrentShift();
};

const renderKeyText = (key, text) => {
  const newKey = key;
  newKey.textContent = text;
};

const renderKeyButtons = (currLangBoard) => {
  const currLangBoardCodes = Object.keys(currLangBoard);
  const currLangBoardKeys = Object.values(currLangBoard);

  for (let i = 0; i < Object.keys(currLangBoard).length; i += 1) {
    const keyButton = document.createElement('button');
    keyButton.classList.add('key');
    keyButton.setAttribute('data-code', currLangBoardCodes[i]);
    renderKeyText(keyButton, currLangBoardKeys[i]);
    keyboard.appendChild(keyButton);
  }
};

renderKeyButtons(selectLangBoard());

const removeNextSym = () => {
  const caretPosition = textarea.selectionStart;
  if (caretPosition !== textarea.selectionEnd) {
    textarea.value = textarea.value.slice(0, caretPosition)
      + textarea.value.slice(textarea.selectionEnd);
    textarea.selectionEnd = caretPosition;
  } else {
    textarea.value = textarea.value.slice(0, caretPosition)
      + textarea.value.slice(caretPosition + 1);
    textarea.selectionStart = caretPosition;
    textarea.selectionEnd = caretPosition;
  }
};

const removePrevSym = () => {
  const caretPosition = textarea.selectionStart;
  if (caretPosition !== textarea.selectionEnd) {
    textarea.value = textarea.value.slice(0, caretPosition)
      + textarea.value.slice(textarea.selectionEnd);
    textarea.selectionEnd = caretPosition;
  } else {
    textarea.value = textarea.value.slice(0, caretPosition - 1)
      + textarea.value.slice(caretPosition);
    textarea.selectionStart = caretPosition - 1;
    textarea.selectionEnd = textarea.selectionStart;
  }
};

let lastKeyCodeByMouse = null;

const handleKeyDown = (event) => {
  event.preventDefault();
  const keyCode = event.code || event.target.getAttribute('data-code');
  if (!event.code) lastKeyCodeByMouse = event.target.getAttribute('data-code');
  const caretPosition = textarea.selectionStart;
  const currentBoard = selectLangBoard();
  if (keyCode in currentBoard) {
    textarea.focus();
    keyboard.querySelector(`[data-code="${keyCode}"]`).classList.add('key--active');

    if (currentBoard[keyCode].length === 1) {
      if (textarea.selectionEnd !== caretPosition) removeNextSym();
      textarea.value = textarea.value.slice(0, caretPosition)
        + keyboard.querySelector(`[data-code="${keyCode}"]`).textContent + textarea.value.slice(caretPosition);
      textarea.selectionEnd = caretPosition + 1;
    }

    switch (keyCode) {
      case 'Tab':
        textarea.value = `${textarea.value.slice(0, caretPosition)}    ${textarea.value.slice(caretPosition)}`;
        textarea.selectionEnd = caretPosition + 4;
        break;
      case 'Enter':
        textarea.value = `${textarea.value.slice(0, caretPosition)}\n${textarea.value.slice(caretPosition)}`;
        textarea.selectionEnd = caretPosition + 1;
        break;
      case 'Delete':
        removeNextSym();
        break;
      case 'Backspace':
        removePrevSym();
        break;
      case 'ControlLeft':
        if (event.altKey) switchLang();
        break;
      case 'AltLeft':
        if (event.ctrlKey) switchLang();
        break;
      case 'CapsLock':
        if (!event.repeat) capslockCount += 1;
        getCurrentCaps();
        break;
      case 'ShiftLeft':
        if (!event.repeat) {
          isShiftActive = true;
          getCurrentShift();
        }
        break;
      default:
        break;
    }
  }
};

window.addEventListener('keydown', handleKeyDown);

window.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('key')) handleKeyDown(event);
});

const handleKeyUp = (event) => {
  const keyCode = event.code || event.target.getAttribute('data-code');
  const currentBoard = selectLangBoard();

  if (keyCode in currentBoard && keyCode !== 'CapsLock') {
    keyboard.querySelector(`[data-code="${keyCode}"]`).classList.remove('key--active');
  }

  if (!event.code && lastKeyCodeByMouse && (lastKeyCodeByMouse !== 'CapsLock') && (event.target.getAttribute('data-code') !== lastKeyCodeByMouse)) {
    keyboard.querySelector(`[data-code="${lastKeyCodeByMouse}"]`).classList.remove('key--active');
    if (lastKeyCodeByMouse === 'ShiftLeft') {
      isShiftActive = false;
      getCurrentShift();
    }
  }

  if (keyCode === 'ShiftLeft') {
    isShiftActive = false;
    getCurrentShift();
  }
};

window.addEventListener('keyup', handleKeyUp);
window.addEventListener('mouseup', handleKeyUp);
