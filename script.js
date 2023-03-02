document.addEventListener('DOMContentLoaded', () => {

  let todoArray = JSON.parse(localStorage.getItem('todos')) || [];

  function getNewID(arr) {
    let max = 0;
    for (const item of arr) {
      if (item.id > max) max = item.id
    }
    return max + 1
  }

  const list = document.querySelector('.todo__list');

  function newTodo(todo, container) {
    const itemsLeft = document.querySelector('.todo__footer-left');
    const item = document.createElement('div');
    const itemButton = document.createElement('button');
    const itemText = document.createElement('div');
    const addSubItem = document.createElement('button');
    const editItem = document.createElement('button');
    const deleteItem = document.createElement('button');
    item.className = `todo__item`;
    item.dataset.id = todo.id;
    item.draggable = true;
    if (JSON.parse(localStorage.getItem('mode')) === 'light') { item.classList.add('light') };
    itemButton.className = `todo__check ${todo.completed && 'completed'}`;
    itemText.className = 'todo__text';
    itemText.textContent = todo.text;
    addSubItem.className = 'todo__add-sub-item';
    addSubItem.title = 'Add sub-todo';
    editItem.className = 'todo__edit-item';
    editItem.title = 'Edit todo';
    deleteItem.className = 'todo__delete-item';
    deleteItem.title = 'Delete todo';

    if (container === list) { container.append(item) } else {
      container.parentElement.after(item);
      item.classList.add('sub-item');
    }

    item.append(itemButton);
    item.append(itemText);
    item.append(addSubItem);
    item.append(editItem);
    item.append(deleteItem);

    if (todo.level === 'sub') {
      item.classList.add('sub-item');
      addSubItem.remove();
    }

    itemButton.addEventListener('click', () => {
      itemButton.classList.toggle('completed');

      for (const item of todoArray) {
        if (item.id === todo.id) {
          item.completed = !item.completed
        }
      }
      localStorage.setItem('todos', JSON.stringify(todoArray));
      itemsLeft.textContent = `${todoArray.filter(item => item.completed === false).length} items left`;
    })

    editItem.addEventListener('click', () => {
      todoArray = JSON.parse(localStorage.getItem('todos'))
      console.log(todo.id)
      editItem.classList.toggle('ok');
      itemText.textContent = '';
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = todo.text;
      editInput.className = 'todo__edit-input';
      itemText.append(editInput);

      editItem.addEventListener('click', () => {
        if (!editItem.classList.contains('ok')) {
          itemText.textContent = editInput.value;
          editInput.remove();
          todoArray = todoArray.map(el => el.id === todo.id ? { ...el, text: editInput.value } : el);
          localStorage.setItem('todos', JSON.stringify(todoArray));
        }
      })

    })

    deleteItem.addEventListener('click', () => {
      /* Актуальный массив после перемещения: */
      todoArray = JSON.parse(localStorage.getItem('todos'))

      console.log(todo.id)
      todoArray = todoArray.filter(el => el.id !== todo.id);
      localStorage.setItem('todos', JSON.stringify(todoArray));
      item.remove();
      itemsLeft.textContent = `${todoArray.filter(item => item.completed === false).length} items left`;
    })

    addSubItem.addEventListener('click', () => {
      todoArray = JSON.parse(localStorage.getItem('todos'))
      // Плюсик становится галочкой
      addSubItem.classList.toggle('ok');
      // Появляется инпут
      const subItemInput = document.createElement('input');
      if (addSubItem.classList.contains('ok')) {
        subItemInput.type = 'text';
        subItemInput.placeholder = 'Your new sub-todo';
        subItemInput.className = 'sub-item-input';
        item.append(subItemInput);
      }

      // Нажатие на галочку
      addSubItem.addEventListener('click', (event) => {
        if (!addSubItem.classList.contains('ok')) {
          if (subItemInput.value !== '') {
            // Добавляется новая строка с текстом - данными из инпута
            newTodo({ text: subItemInput.value, completed: false, id: getNewID(todoArray), level: 'sub' }, addSubItem);
            // Добавить в todoArray
            console.log(event.target.parentElement.dataset.id)
            for (let i = 0; i < todoArray.length; i++) {
              if (todoArray[i].id == event.target.parentElement.dataset.id) {
                todoArray.splice(i + 1, 0, { text: subItemInput.value, completed: false, id: getNewID(todoArray), level: 'sub' });
                break;
              }
            }
            localStorage.setItem('todos', JSON.stringify(todoArray));
          }
          subItemInput.value = '';
          subItemInput.remove();
        }
      })
    })
  }

  function addTodos(array) {
    const itemsLeft = document.querySelector('.todo__footer-left');
    const list = document.querySelector('.todo__list');
    list.innerHTML = '';

    array.forEach(el => newTodo(el, list));
    itemsLeft.textContent = `${array.filter(item => item.completed === false).length} items left`;
  }

  function createNewTodo() {
    const input = document.querySelector('#todo__input');

    input.addEventListener('keypress', function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        if (input.value !== '') {
          todoArray.push({ text: input.value, completed: false, id: getNewID(todoArray) });
          localStorage.setItem('todos', JSON.stringify(todoArray));
          input.value = '';
          addTodos(todoArray);
        }
      }
    })
  }

  function clearCompleted() {
    const clearButton = document.querySelector('.todo__clear-completed');
    clearButton.addEventListener('click', () => {
      todoArray = todoArray.filter(el => el.completed === false);
      localStorage.setItem('todos', JSON.stringify(todoArray));
      addTodos(todoArray);
    })
  }

  function filterTodos() {
    const filterAll = document.querySelector('.todo__filter-all');
    const filterActive = document.querySelector('.todo__filter-active');
    const filterCompleted = document.querySelector('.todo__filter-completed');

    filterActive.addEventListener('click', () => {
      const activeTodosArray = todoArray.filter(el => el.completed === false);
      filterActive.classList.add('active');
      filterCompleted.classList.remove('active');
      filterAll.classList.remove('active');
      addTodos(activeTodosArray);
    })

    filterCompleted.addEventListener('click', () => {
      const completedTodosArray = todoArray.filter(el => el.completed === true);
      filterCompleted.classList.add('active');
      filterActive.classList.remove('active');
      filterAll.classList.remove('active');
      addTodos(completedTodosArray);
    })

    filterAll.addEventListener('click', () => {
      filterAll.classList.add('active');
      filterCompleted.classList.remove('active');
      filterActive.classList.remove('active');
      addTodos(todoArray);
    })
  }

  function addMobileFooter(container) {
    const allBtn = document.createElement('button');
    const activeBtn = document.createElement('button');
    const completedBtn = document.createElement('button');
    allBtn.className = 'todo__filter-all active';
    activeBtn.className = 'todo__filter-active';
    completedBtn.className = 'todo__filter-completed';
    allBtn.textContent = 'All';
    activeBtn.textContent = 'Active';
    completedBtn.textContent = 'Completed';
    container.append(allBtn);
    container.append(activeBtn);
    container.append(completedBtn);
  }

  window.addEventListener('resize', () => {
    const footerContainer = document.querySelector('.todo__footer-mobile');
    const mainFooterContainer = document.querySelector('.todo__footer-filter');
    if (innerWidth < 550) {
      if (footerContainer.innerHTML == '') {
        addMobileFooter(footerContainer);
        mainFooterContainer.innerHTML = '';
        filterTodos();
      }
    } else {
      if (mainFooterContainer.innerHTML == '') {
        addMobileFooter(mainFooterContainer);
        footerContainer.innerHTML = '';
        filterTodos();
      }
    }
  })

  function chooseFooter() {
    const footerContainer = document.querySelector('.todo__footer-mobile');
    const mainFooterContainer = document.querySelector('.todo__footer-filter');

    if (innerWidth < 550) {
      addMobileFooter(footerContainer)
    } else {
      addMobileFooter(mainFooterContainer)
    }
  }

  function changeMode() {
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

  function changeImage() {
    const bg = document.querySelector('.bg');
    const appHeader = document.querySelector('.app__header');

    const changeImageButton = document.createElement('button');
    changeImageButton.className = 'change-image-button';
    changeImageButton.title = 'Change image';
    appHeader.prepend(changeImageButton);

    const imageInput = document.createElement('input');
    imageInput.type = 'text';
    imageInput.placeholder = 'your new image';
    imageInput.className = 'change-image-input';

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
      }
      if (changeImageButton.classList.contains('ok')) {
        appHeader.append(imageInput);
      }
    });
  }

  function dragNDrop() {

    function todoPosition(tTodo) {
      let i = 0;
      while (tTodo.previousElementSibling) {
        tTodo = tTodo.previousElementSibling;
        i++;
      }
      return i;
    }
    let dragStartPosition;
    let dragEndPosition;

    const todoList = document.querySelector('.todo__list');

    todoList.addEventListener('dragstart', (event) => {
      event.target.classList.add('selected');
      dragStartPosition = todoPosition(event.target);
    })
    todoList.addEventListener('dragend', (event) => {
      event.target.classList.remove('selected');
      dragEndPosition = todoPosition(event.target);
      [todoArray[dragStartPosition], todoArray[dragEndPosition]] = [todoArray[dragEndPosition], todoArray[dragStartPosition]];
      localStorage.setItem('todos', JSON.stringify(todoArray));
    })

    const getNextTodo = (cursorPosition, currentTodo) => {
      const currentTodoCoord = currentTodo.getBoundingClientRect();
      const currentTodoCenter = currentTodoCoord.y + currentTodoCoord.height / 2;
      const nextTodo = (cursorPosition < currentTodoCenter) ? currentTodo : currentTodo.nextElementSibling;
      return nextTodo;
    }

    todoList.addEventListener('dragover', (event) => {
      event.preventDefault();
      /* Перемещаемое дело: */
      const movableTodo = todoList.querySelector('.selected');
      /* Над каким делом курсор: */
      const currentTodo = event.target;
      /* Если событие сработало не на перемещаемом деле и на элементе списка дел: */
      const isMovable = movableTodo !== currentTodo && currentTodo.classList.contains('todo__item');
      if (!isMovable) { return }
      /* Дело, перед которым будет вставлено перемещенное дело: */
      const nextTodo = getNextTodo(event.clientY, currentTodo);
      if (nextTodo && movableTodo === nextTodo.previousElementSibling || movableTodo === nextTodo) {
        return
      }
      /* Вставить перемещаемое дело перед найденным сиблингом: */
      todoList.insertBefore(movableTodo, nextTodo);
    })
  }

  chooseFooter();
  addTodos(todoArray);
  createNewTodo();
  clearCompleted();
  filterTodos();
  changeMode();
  dragNDrop();

  changeImage();

})