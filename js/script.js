import { boardEn } from './engBoard.js';
import { boardRu } from './ruBoard.js';

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
    ru: boardRu,
    en: boardEn,
  };

  return langs[currentLang];
};

const renderKeyButtons = (currLangBoard) => {
  const currLangBoardCodes = Object.keys(currLangBoard);
  const currLangBoardKeys = Object.values(currLangBoard);

  for (let i = 0; i < Object.keys(currLangBoard).length; i += 1) {
    const keyButton = document.createElement('button');
    keyButton.classList.add('key');
    keyButton.setAttribute('data-code', currLangBoardCodes[i]);
    keyButton.textContent = currLangBoardKeys[i];
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

const handleKeyDown = (event) => {
  event.preventDefault();
  const keyCode = event.code || event.target.getAttribute('data-code');
  const caretPosition = textarea.selectionStart;

  if (keyCode in boardEn) {
    textarea.focus();

    if (boardEn[keyCode].length === 1) {
      textarea.value = textarea.value.slice(0, caretPosition)
        + boardEn[keyCode] + textarea.value.slice(caretPosition);
      textarea.selectionEnd = caretPosition + 1;
    }

    switch (keyCode) {
      case 'Tab':
        textarea.value = `${textarea.value.slice(0, caretPosition)}    ${textarea.value.slice(caretPosition)}`;
        textarea.selectionEnd = caretPosition + 4;
        break;
      case 'Enter':
        textarea.value += '\n';
        break;
      case 'Delete':
        removeNextSym();
        break;
      case 'Backspace':
        removePrevSym();
        break;
      case 'ShiftLeft':
        break;
      default:
        break;
    }
  }
};

window.addEventListener('keydown', handleKeyDown);

keyboard.addEventListener('click', (event) => {
  if (event.target.classList.contains('key')) handleKeyDown(event);
});
