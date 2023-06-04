export function dragAndDropTodos(todoArray) {

  todoArray = JSON.parse(localStorage.getItem('todoFolders'));
  let movingChildren;

  const todoList = document.querySelector('.todo__list');

  todoList.addEventListener('dragstart', (event) => {
    event.target.classList.add('selected');

    // Move children below their parent:
    movingChildren = document.querySelectorAll(`[data-parent-id='${event.target.dataset.id}']`)
    for (let child of movingChildren) { child.classList.add('selected-sub') }
  })
  todoList.addEventListener('dragend', (event) => {
    event.target.classList.remove('selected');
    for (let child of movingChildren) { child.classList.remove('selected-sub') }

    const resultOrder = [...document.querySelectorAll('.todo__item')].map(el => Number(el.attributes['data-id'].value)) // [11, 2, 9, 8, 3, 12, 4]
    // 'Sort' todoArray in resultOrder order:
    let resultArray = [];
    for (let num of resultOrder) {
      for (let todo of todoArray.filter(folder => folder.active)[0].todos) {
        if (todo.id === num) { resultArray.push(todo) }
      }
    }
    todoArray = todoArray.map(folder => {
      if (folder.active) { return { ...folder, todos: resultArray } }
      return folder
    })

    localStorage.setItem('todoFolders', JSON.stringify(todoArray));
  })

  const getNextTodo = (cursorPosition, currentTodo) => {
    const currentTodoCoord = currentTodo.getBoundingClientRect();
    const currentTodoCenter = currentTodoCoord.y + currentTodoCoord.height / 2;
    const nextTodo = (cursorPosition < currentTodoCenter) ? currentTodo : currentTodo.nextElementSibling;
    return nextTodo;
  }

  const getPrevTodo = (cursorPosition, currentTodo) => {
    const currentTodoCoord = currentTodo.getBoundingClientRect();
    const currentTodoCenter = currentTodoCoord.y + currentTodoCoord.height / 2;
    const prevTodo = (cursorPosition > currentTodoCenter) ? currentTodo : currentTodo.previousElementSibling;
    return prevTodo;
  }

  todoList.addEventListener('dragover', (event) => {
    event.preventDefault();
    // Moving item:
    const movableTodo = todoList.querySelector('.selected');
    const movableChildren = todoList.querySelectorAll('.selected-sub');
    // Cursor is over the event.target:
    const currentTodo = event.target;
    // If event is not on the moving item or todo list element:
    const isMovable = movableTodo !== currentTodo && currentTodo.classList.contains('todo__item');
    if (!isMovable) { return }
    // Moving item inserts above nextTodo:
    const prevTodo = getPrevTodo(event.clientY, currentTodo);
    const nextTodo = getNextTodo(event.clientY, currentTodo);
    if (nextTodo && movableTodo === nextTodo.previousElementSibling || movableTodo === nextTodo) { return }

    const isChild = movableTodo.classList.contains('sub-item');
    const isNextChild = nextTodo?.classList.contains('sub-item');
    const isNextTodoSibling = nextTodo?.dataset.parentId === movableTodo.dataset.parentId;
    const isPrevTodoSibling = prevTodo?.dataset.parentId === movableTodo.dataset.parentId;

    if (isChild && !(isNextTodoSibling || isPrevTodoSibling)) { return }
    if (!isChild && isNextChild) { return }

    // Insert moving item before movableTodo:
    todoList.insertBefore(movableTodo, nextTodo);
    // Insert children after parent:
    function insertAfter(referenceNode, newNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
    for (let i = movableChildren.length - 1; i >= 0; i--) {
      insertAfter(movableTodo, movableChildren[i])
    }
  })
}