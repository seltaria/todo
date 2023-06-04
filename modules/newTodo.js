import { addTodos } from "../script.js";
import { dragAndDropTodos } from "./dragAndDrop.js";
import { createFolder } from "./folders.js";

export function newTodo(todo, container, todoArray) {
  const list = document.querySelector('.todo__list');
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

  item.append(itemButton, itemText, addSubItem, editItem, deleteItem);

  if (todo.level === 'sub') {
    item.classList.add('sub-item');
    addSubItem.remove();
  }

  toggleTodoStatus(itemButton, todoArray, todo, itemsLeft);
  renameTodoFunction(editItem, todoArray, itemText, item, todo);

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

    // Add clicking on the button:
    addSubItem.addEventListener('click', (event) => {
      if (!addSubItem.classList.contains('ok')) {
        addSubTodoFunction(event, subItemInput, todoArray, addSubItem, itemsLeft);
      }
    })
    // Add pressing 'enter':
    window.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addSubTodoFunction(event, subItemInput, todoArray, addSubItem, itemsLeft);
        dragAndDropTodos();
        addSubItem.classList.remove('ok');
      }
    })
  })
}

function toggleTodoStatus(itemButton, todoArray, todo, itemsLeft) {
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
}

function renameTodoFunction(editItem, todoArray, itemText, item, todo) {
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
}

function addSubTodoFunction(event, subItemInput, todoArray, addSubItem, itemsLeft) {
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

export function getNewID(arr) {
  let max = 0;
  for (const item of arr) {
    if (item.id > max) max = item.id
  }
  return max + 1
}

export function createNewTodo(todoArray) {
  const input = document.querySelector('#todo__input');
  todoArray = JSON.parse(localStorage.getItem('todoFolders'));

  input.addEventListener('keypress', function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (input.value !== '') {
        // Add to active folder:
        todoArray = JSON.parse(localStorage.getItem('todoFolders'));
        // If no folders, add new folder:
        if (!todoArray || todoArray.length === 0) {
          createFolder(0, true, "NewFolder", 1);
          localStorage.setItem('todoFolders', JSON.stringify([{ id: 1, name: "New Folder", active: true, todos: [] }]));
          todoArray = JSON.parse(localStorage.getItem('todoFolders'));
        }
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