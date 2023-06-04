import { addTodos } from "../script.js";

export function filterTodos(todoArray) {

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

  clearCompleted(todoArray);
}

function clearCompleted(todoArray) {
  const filterAll = document.querySelector('.todo__filter-all');
  const filterCompleted = document.querySelector('.todo__filter-completed');
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

    filterAll.classList.add('active');
    filterCompleted.classList.remove('active');
  })
}
