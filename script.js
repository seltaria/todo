document.addEventListener('DOMContentLoaded', () => {

  let todoArray = JSON.parse(localStorage.getItem('todos')) || [];

  function getNewID(arr) {
    let max = 0;
    for (const item of arr) {
      if (item.id > max) max = item.id
    }
    return max + 1
  }

  function newTodo(todo) {
    const itemsLeft = document.querySelector('.todo__footer-left');
    const list = document.querySelector('.todo__list');
    const item = document.createElement('div');
    const itemButton = document.createElement('button');
    const itemText = document.createElement('div');
    const deleteItem = document.createElement('button');
    item.className = `todo__item`;
    if (JSON.parse(localStorage.getItem('mode')) === 'light') { item.classList.add('light') };
    itemButton.className = `todo__check ${todo.completed && 'completed'}`;
    itemText.className = 'todo__text';
    itemText.textContent = todo.text;
    deleteItem.className = 'todo__delete-item';
    list.append(item);
    item.append(itemButton);
    item.append(itemText);
    item.append(deleteItem);

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

    deleteItem.addEventListener('click', () => {
      todoArray = todoArray.filter(el => el.id !== todo.id);
      localStorage.setItem('todos', JSON.stringify(todoArray));
      item.remove();
      itemsLeft.textContent = `${todoArray.filter(item => item.completed === false).length} items left`;
    })
  }

  function addTodos(array) {
    const itemsLeft = document.querySelector('.todo__footer-left');
    const list = document.querySelector('.todo__list');
    list.innerHTML = '';

    array.forEach(el => newTodo(el));
    itemsLeft.textContent = `${array.filter(item => item.completed === false).length} items left`;
  }

  function createNewTodo() {
    const input = document.querySelector('#todo__input');

    input.addEventListener('keypress', function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        todoArray.push({ text: input.value, completed: false, id: getNewID(todoArray) });
        localStorage.setItem('todos', JSON.stringify(todoArray));
        input.value = '';
        addTodos(todoArray);
      }
    })
  }

  function clearCompleted() {
    const clearButton = document.querySelector('.todo__clear-completed');
    clearButton.addEventListener('click', () => {
      todoArray.map(el => el.completed = false);
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

  chooseFooter();
  addTodos(todoArray);
  createNewTodo();
  clearCompleted();
  filterTodos();
  changeMode();

})