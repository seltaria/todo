export function changeMode() {
  const bg = document.querySelector('.bg');
  const todoFooter = document.querySelector('.todo__footer');
  const todoFooterMobile = document.querySelector('.todo__footer-mobile');
  const todoBlock = document.querySelector('.todo');
  const button = document.querySelector('.change-mode');

  const modeArray = [document.body, bg, todoFooter, todoFooterMobile, todoBlock, button];

  if (JSON.parse(localStorage.getItem('mode')) === 'light') {
    modeArray.forEach(el => el.classList.toggle('light'));
  }

  button.addEventListener('click', () => {
    modeArray.forEach(el => el.classList.toggle('light'));

    localStorage.setItem('mode', JSON.stringify(document.body.classList.value));
  })
}

export function changeImage() {
  const bg = document.querySelector('.bg');
  const appHeader = document.querySelector('.app__header');

  const changeImageButton = document.createElement('button');
  changeImageButton.className = 'change-image-button';
  changeImageButton.title = 'Change image';
  appHeader.prepend(changeImageButton);

  const imageInput = document.createElement('input');
  imageInput.type = 'text';
  imageInput.placeholder = 'your new image URL';
  imageInput.className = 'change-image-input';

  const closeImageInput = document.createElement('button');
  closeImageInput.className = 'close-image-input';
  closeImageInput.addEventListener('click', () => {
    changeImageButton.classList.remove('ok');
    imageInput.value = '';
    imageInput.remove();
    closeImageInput.remove();
  })

  const bgImage = JSON.parse(localStorage.getItem('bgImage'));
  if (bgImage) {
    bg.style.backgroundImage = `url('${bgImage}')`;
  }

  changeImageButton.addEventListener('click', () => {
    changeImageButton.classList.toggle('ok');

    if (!changeImageButton.classList.contains('ok')) {
      if (imageInput.value === '') {
        bg.style.removeProperty('background-image');
        localStorage.removeItem('bgImage');
      } else {
        bg.style.backgroundImage = `url('${imageInput.value}')`;
        localStorage.setItem('bgImage', JSON.stringify(imageInput.value));
      }
      imageInput.value = '';
      imageInput.remove();
      closeImageInput.remove();
    }
    if (changeImageButton.classList.contains('ok')) {
      appHeader.append(imageInput);
      appHeader.append(closeImageInput);
      imageInput.focus();
    }
  });
}

export function viewOptions() {
  changeMode();
  changeImage();
}