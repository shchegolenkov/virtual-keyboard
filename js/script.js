const content = `
  <div class="container">
    <h1 class="header">Виртуальная клавиатура</h1>
    <textarea class="textarea" placeholder="Введите текст..." autofocus></textarea>
    <div class="keyboard">
    </div>
    <p class="description">Клавиатура создана в операционной системе Windows</p>
    <p class="description">Для переключения языка: лeвыe Shift + Alt</p>
  </div>
`;

document.body.insertAdjacentHTML('afterbegin', content);
