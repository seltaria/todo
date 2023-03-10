import { addFolders, chooseFolder, createFolder, createFolderList, deleteFolderMenu } from "./scriptFolders.js";

let todoArray = JSON.parse(localStorage.getItem('todoFolders')) || [];

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
  if (todo.parentId) { item.dataset.parentId = todo.parentId };
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
    if (item.classList.contains('sub-item')) {
      item.dataset.parentId = todo.parentId;
    }
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
  // Toggle todo status:
  itemButton.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    // If click on parent todo set 'completed' to children:
    const childrenNodeList = itemButton.closest('.todo__list').querySelectorAll(`[data-parent-id = '${itemButton.closest('.todo__item').dataset.id}']`);
    // If parent was not completed:
    if (!itemButton.classList.contains('completed')) {
      for (let node of childrenNodeList) {
        node.querySelector('.todo__check').classList.add('completed');
      }
      for (const item of todoArray.filter(folder => folder.active)[0].todos) {
        if (Number(item.parentId) === todo.id) {
          item.completed = true;
        }
      }
    }
    // If click on child todo when all children and parent todos are completed
    // remove 'completed' from parent:
    // If child:
    if (itemButton.parentElement.classList.contains('sub-item')) {
      // If completed:
      if (itemButton.classList.contains('completed')) {
        // If parent completed:
        const parentForItem = itemButton.closest('.todo__list').querySelector(`[data-id="${itemButton.parentElement.dataset.parentId}"]`);
        const isParentCompleted = parentForItem.children[0].classList.contains('completed');
        if (isParentCompleted) {
          parentForItem.children[0].classList.remove('completed');
          console.log(parentForItem.dataset.id)

          todoArray = todoArray.map(folder => {
            if (folder.active) {
              let newTodos = folder.todos.map(todo => {
                if (todo.id === Number(parentForItem.dataset.id)) {
                  return { ...todo, completed: false }
                }
                return todo;
              })
              return { ...folder, todos: newTodos }
            }
            return folder;
          })

        }
      }
    }
    itemButton.classList.toggle('completed');
    for (const item of todoArray.filter(folder => folder.active)[0].todos) {
      if (item.id === todo.id) {
        item.completed = !item.completed
      }
    }
    localStorage.setItem('todoFolders', JSON.stringify(todoArray));
    itemsLeft.textContent = `${todoArray.filter(folder => folder.active)[0].todos.filter(item => item.completed === false).length} items left`;
  })

  // Rename todo:
  editItem.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'))
    editItem.classList.toggle('ok');
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = itemText.textContent;
    itemText.textContent = '';
    editInput.className = 'todo__edit-input';
    itemText.append(editInput);
    editInput.focus();
    item.draggable = false;

    function renameTodo() {
      if (editInput.value !== '') {
        itemText.textContent = editInput.value;
        editInput.remove();
        todoArray = todoArray.map(folder => {
          if (folder.active) {
            const todoList = folder.todos.map(el => {
              if (el.id === todo.id) return { ...el, text: editInput.value }
              return el;
            })
            return { ...folder, todos: todoList }
          } else {
            return folder;
          }
        })
        localStorage.setItem('todoFolders', JSON.stringify(todoArray));
        item.draggable = true;
      }
    }
    // Rename clicking on the button:
    editItem.addEventListener('click', () => {
      if (!editItem.classList.contains('ok')) renameTodo();
    })
    // Rename pressing 'enter':
    window.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        renameTodo();
        editItem.classList.remove('ok');
      }
    })

  })

  deleteItem.addEventListener('click', (event) => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'))
    let todoList;

    todoArray = todoArray.map(folder => {
      if (folder.active) {
        // If click on sub-todo:
        if (event.target.parentElement.classList.contains('sub-item')) {
          todoList = folder.todos.filter(el => el.id !== todo.id);
        } else {
          // Delete children todos with parent todo:
          todoList = folder.todos.filter(el => el.id !== todo.id && Number(el.parentId) !== todo.id);
        }
        return { ...folder, todos: todoList }
      }
      return folder
    })
    localStorage.setItem('todoFolders', JSON.stringify(todoArray));
    item.remove();
    // Remove sub-todos with its parent todo
    const subTodos = document.body.querySelector('.todo__list').querySelectorAll(`[data-parent-id = '${todo.id}']`);
    for (let subItem of subTodos) subItem.remove();
    itemsLeft.textContent = `${todoArray.filter(folder => folder.active)[0].todos.filter(item => item.completed === false).length} items left`;
  })

  addSubItem.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'))
    addSubItem.classList.toggle('ok');
    const subItemInput = document.createElement('input');
    if (addSubItem.classList.contains('ok')) {
      subItemInput.type = 'text';
      subItemInput.placeholder = 'Your new sub-todo';
      subItemInput.className = 'sub-item-input';
      item.append(subItemInput);
      subItemInput.focus();
    }

    function addSubTodoFunction(event) {
      if (subItemInput.value !== '') {
        // Add parent id to children todos:
        const newTodoObj = { text: subItemInput.value, completed: false, id: getNewID(todoArray.filter(folder => folder.active)[0].todos), parentId: event.target.parentElement.dataset.id, level: 'sub' };
        // Add new row with text from input:
        newTodo(newTodoObj, addSubItem);
        itemsLeft.textContent = `${parseInt(itemsLeft.textContent) + 1} items left`;
        // Add into todoArray:
        for (let i = 0; i < todoArray.filter(folder => folder.active)[0].todos.length; i++) {
          if (todoArray.filter(folder => folder.active)[0].todos[i].id == event.target.parentElement.dataset.id) {
            todoArray.filter(folder => folder.active)[0].todos.splice(i + 1, 0, newTodoObj);
            break;
          }
        }
        localStorage.setItem('todoFolders', JSON.stringify(todoArray));
      }
      subItemInput.value = '';
      subItemInput.remove();
    }
    // Add clicking on the button:
    addSubItem.addEventListener('click', (event) => {
      if (!addSubItem.classList.contains('ok')) {
        addSubTodoFunction(event);
      }
    })
    // Add pressing 'enter':
    window.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addSubTodoFunction(event);
        addSubItem.classList.remove('ok');
      }
    })
  })
}

export function addTodos(array) {
  const itemsLeft = document.querySelector('.todo__footer-left');
  const list = document.querySelector('.todo__list');
  list.innerHTML = '';
  array.forEach(el => newTodo(el, list));
  itemsLeft.textContent = `${array.filter(item => item.completed === false).length} items left`;
}

function createNewTodo() {
  const input = document.querySelector('#todo__input');
  todoArray = JSON.parse(localStorage.getItem('todoFolders'));

  input.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (input.value !== '') {
        // Add to active folder:
        todoArray = JSON.parse(localStorage.getItem('todoFolders'));
        todoArray.map(todo => todo.active === true ? todo.todos.push({ text: input.value, completed: false, id: getNewID(todo.todos) }) : todo)
        localStorage.setItem('todoFolders', JSON.stringify(todoArray));
        input.value = '';
        try {
          addTodos(todoArray.filter(todo => todo.active === true)[0].todos);
        } catch (error) {
          console.log(error, 'add folder first')
        }
      }
    }
  })
}

function clearCompleted() {
  const clearButton = document.querySelector('.todo__clear-completed');
  clearButton.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    todoArray = todoArray.map(folder => {
      if (folder.active) {
        const todoList = folder.todos.filter(el => el.completed === false);
        return { ...folder, todos: todoList }
      }
      return folder;
    })
    localStorage.setItem('todoFolders', JSON.stringify(todoArray));
    addTodos(todoArray.filter(folder => folder.active)[0].todos);
  })
}

export function filterTodos() {

  const filterAll = document.querySelector('.todo__filter-all');
  const filterActive = document.querySelector('.todo__filter-active');
  const filterCompleted = document.querySelector('.todo__filter-completed');

  filterAll.classList.add('active');
  filterCompleted.classList.remove('active');
  filterActive.classList.remove('active');

  filterActive.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    const activeTodosArray = todoArray.filter(folder => folder.active)[0].todos.filter(el => el.completed === false);
    filterActive.classList.add('active');
    filterCompleted.classList.remove('active');
    filterAll.classList.remove('active');
    addTodos(activeTodosArray);
  })

  filterCompleted.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    const completedTodosArray = todoArray.filter(folder => folder.active)[0].todos.filter(el => el.completed === true);
    filterCompleted.classList.add('active');
    filterActive.classList.remove('active');
    filterAll.classList.remove('active');
    addTodos(completedTodosArray);
  })

  filterAll.addEventListener('click', () => {
    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    filterAll.classList.add('active');
    filterCompleted.classList.remove('active');
    filterActive.classList.remove('active');
    addTodos(todoArray.filter(folder => folder.active)[0].todos);
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

    todoArray = JSON.parse(localStorage.getItem('todoFolders'));
    let activeFolderTodos = todoArray.filter(folder => folder.active)[0].todos;

    activeFolderTodos[dragStartPosition] = [activeFolderTodos[dragEndPosition], activeFolderTodos[dragEndPosition] = activeFolderTodos[dragStartPosition]][0]
    // Move children below their parent:
    // const movingChildren = activeFolderTodos.filter(todo => Number(todo.parentId) === Number(activeFolderTodos[dragEndPosition].id));

    localStorage.setItem('todoFolders', JSON.stringify(todoArray));
  })

  const getNextTodo = (cursorPosition, currentTodo) => {
    const currentTodoCoord = currentTodo.getBoundingClientRect();
    const currentTodoCenter = currentTodoCoord.y + currentTodoCoord.height / 2;
    const nextTodo = (cursorPosition < currentTodoCenter) ? currentTodo : currentTodo.nextElementSibling;
    return nextTodo;
  }

  todoList.addEventListener('dragover', (event) => {
    event.preventDefault();
    // Moving item:
    const movableTodo = todoList.querySelector('.selected');
    // Cursor is over the event.target:
    const currentTodo = event.target;
    // If event is not on the moving item or todo list element:
    const isMovable = movableTodo !== currentTodo && currentTodo.classList.contains('todo__item');
    if (!isMovable) { return }
    // Moving item inserts above nextTodo:
    const nextTodo = getNextTodo(event.clientY, currentTodo);
    if (nextTodo && movableTodo === nextTodo.previousElementSibling || movableTodo === nextTodo) {
      return
    }
    // Insert moving item before movableTodo:
    todoList.insertBefore(movableTodo, nextTodo);
  })
}

chooseFooter();
addTodos(todoArray.filter(folder => folder.active)[0]?.todos || []); // Render todos from active folder
createNewTodo();
clearCompleted();
filterTodos();
changeMode();
dragNDrop();

changeImage();

/* ============================================*/

createFolderList();
addFolders();
chooseFolder();

const createFolderButton = document.querySelector('#add-folder');
createFolderButton.addEventListener('click', () => {
  let dataArray = JSON.parse(localStorage.getItem('todoFolders'));
  if (!dataArray) {
    localStorage.setItem('todoFolders', JSON.stringify([]));
    dataArray = [];
  }
  let maxId = Math.max(...dataArray.map(folder => folder.id));
  // Add an empty object to localStorage:
  if (dataArray.length === 0) {
    maxId = 0;
    dataArray.push({ 'id': Number(maxId) + 1, 'name': 'New Folder', 'active': true, 'todos': [] });
    createFolder(maxId, true);
  } else {
    dataArray.push({ 'id': Number(maxId) + 1, 'name': 'New Folder', 'active': false, 'todos': [] });
    createFolder(maxId, false);
  }
  localStorage.setItem('todoFolders', JSON.stringify(dataArray));
})

window.addEventListener('click', () => {
  deleteFolderMenu();
})
