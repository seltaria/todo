import { createNewTodo, newTodo } from "./modules/newTodo.js";
import { filterTodos } from "./modules/filterTodos.js";
import { folders } from "./modules/folders.js";
import { footer } from "./modules/footer.js";
import { dragAndDropTodos } from "./modules/dragAndDrop.js";
import { viewOptions } from "./modules/viewOptions.js";

let todoArray = JSON.parse(localStorage.getItem('todoFolders')) || [];

export function addTodos(array) {
  const itemsLeft = document.querySelector('.todo__footer-left');
  const list = document.querySelector('.todo__list');
  list.innerHTML = '';
  array.forEach(el => newTodo(el, list, todoArray));
  itemsLeft.textContent = `${array.filter(item => item.completed === false).length} items left`;
}

footer();
viewOptions();
addTodos(todoArray.filter(folder => folder.active)[0]?.todos || []); // Render todos from active folder
createNewTodo(todoArray);
filterTodos(todoArray);
dragAndDropTodos(todoArray);
folders();
