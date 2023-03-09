import { addTodos, filterTodos } from "./script.js";

const foldersContainer = document.querySelector('.folders');

export function createFolderList() {
  const foldersList = document.createElement('ul');
  foldersList.className = 'folders-list empty';
  foldersContainer.prepend(foldersList);
  return foldersList;
}

export function createFolder(maxId, active, folderName, folderId) {
  const foldersList = document.querySelector('.folders-list');
  const folder = document.createElement('button');
  folder.className = `folder ${active ? 'active' : ''}`;
  folder.textContent = folderName || "New Folder";
  folder.dataset.id = folderId || Number(maxId) + 1;
  foldersList.append(folder);
  foldersList.classList.remove('empty');

  // Rename folder:
  folder.addEventListener('dblclick', (eventClick) => {
    eventClick.stopPropagation();
    // Create input:
    const renameFolderInput = document.createElement('input');
    renameFolderInput.type = 'text';
    renameFolderInput.className = 'rename-folder-input';
    let previousName = folder.textContent;
    renameFolderInput.value = previousName;
    // Delete folder name:
    folder.textContent = '';
    folder.append(renameFolderInput);
    renameFolderInput.focus();

    function renameFolder() {
      if (renameFolderInput.value !== '') {
        // Remove input:
        renameFolderInput.remove();
        // Add new folder name
        folder.textContent = renameFolderInput.value;
        // Refresh data in localStodage:
        let dataArray = JSON.parse(localStorage.getItem('todoFolders'));
        dataArray = dataArray.map(folder => folder.id === Number(eventClick.target.dataset.id) ? { ...folder, name: renameFolderInput.value } : folder)
        renameFolderInput.value = '';
        localStorage.setItem('todoFolders', JSON.stringify(dataArray));
      } else {
        if (document.querySelector('.rename-folder-input') && folder.classList.contains('active')) {
          renameFolderInput.remove();
          folder.textContent = previousName;
        }
      }
    }
    // If press 'enter':
    window.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        renameFolder();
      }
    })
    // If click not inside input:
    window.addEventListener('click', (event) => {
      if (!event.target.classList.contains('rename-folder-input') && event.target !== folder) {
        renameFolder();
      }
    })
  })
}

export function addFolders() {
  let dataArray = JSON.parse(localStorage.getItem('todoFolders'));
  if (!dataArray) dataArray = [];
  let maxId = Math.max(...dataArray.map(folder => folder.id));
  if (dataArray.length === 0) {
    maxId = 0;
  }
  if (dataArray) {
    // if (dataArray.length > 3) {
    //   const showFoldersButton = document.querySelector('#show-folders');
    //   showFoldersButton.style.display = 'block';
    // }
    for (let el of dataArray) { createFolder(maxId, el.active, el.name, el.id) }
  }
}

export function chooseFolder() {
  let dataArray;
  // Click on folder name:
  const foldersList = document.querySelector('.folders-list');
  foldersList.addEventListener('click', (event) => {
    if (!event.target.classList.contains('folder')) {
      return;
    }
    dataArray = JSON.parse(localStorage.getItem('todoFolders'));
    filterTodos();
    // Render todo tist:
    for (let obj of dataArray) {
      if (obj.id === Number(event.target.dataset.id)) {
        addTodos(obj.todos);
      }
    }
    // Set active folder:
    for (let child of foldersList.children) {
      child.classList.remove('active');
    }
    event.target.classList.add('active');
    dataArray = dataArray.map(todo => todo.id === Number(event.target.dataset.id) ? { ...todo, active: true } : { ...todo, active: false });
    localStorage.setItem('todoFolders', JSON.stringify(dataArray));
  })
  // Show context menu:
  foldersList.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    deleteFolderMenu();
    if (!event.target.classList.contains('folder')) {
      return;
    }
    createFolderMenu(event.target, event.offsetX, event.offsetY);
    dataArray = JSON.parse(localStorage.getItem('todoFolders'));
    // Delete folder:
    const deleteFolderButton = document.querySelector('.folder-item-delete');
    deleteFolderButton.addEventListener('click', (event) => {
      // If delete active folder set 'active' to the first folder:
      if (event.target.closest('.folder').classList.contains('active')) {
        // If delete the last folder show an empty list:
        if (dataArray.length === 1) {
          addTodos([]);
          foldersList.classList.add('empty');
        } else {
          // If delete the first folder set 'active' to the second one:
          if (event.target.closest('.folder') === event.target.closest('.folder').parentElement.children[0]) {
            event.target.closest('.folder').parentElement.children[1].classList.add('active');
            for (let obj of dataArray) {
              if (obj.id === Number(event.target.closest('.folder').parentElement.children[1].dataset.id)) {
                addTodos(obj.todos);
              }
            }
          } else {
            event.target.closest('.folder').parentElement.children[0].classList.add('active');
            for (let obj of dataArray) {
              if (obj.id === Number(event.target.closest('.folder').parentElement.children[0].dataset.id)) {
                addTodos(obj.todos);
              }
            }
            // First folder is active:
            dataArray = dataArray.map(folder => folder.id === Number(event.target.closest('.folder').parentElement.children[0].dataset.id) ? { ...folder, active: true } : folder);
          }
          // Second folder is active:
          dataArray = dataArray.map(folder => folder.id === Number(event.target.closest('.folder').parentElement.children[1].dataset.id) ? { ...folder, active: true } : folder);
        }
      }
      event.target.closest('.folder').remove();
      deleteFolderMenu();
      // Delete folder from localStorage:
      dataArray = dataArray.filter(todo => todo.id !== Number(event.target.closest('.folder').dataset.id));
      localStorage.setItem('todoFolders', JSON.stringify(dataArray));
    })
    // Share folder:
    const shareFolderButton = document.querySelector('.folder-item-share');
    shareFolderButton.addEventListener('click', (event) => {
      let dataArray = JSON.parse(localStorage.getItem('todoFolders'));
      const todos = dataArray.filter(folder => folder.id === Number(event.target.closest('.folder').dataset.id))[0].todos;
      deleteFolderMenu();
      shareFolder("todos.txt", JSON.stringify(todos));
    })
  })
}

export function deleteFolderMenu() {
  const folderMenuList = document.getElementsByClassName('folder-menu');
  if (folderMenuList.length !== 0) {
    folderMenuList[0].remove();
  }
}

export function createFolderMenu(container, coordX, coordY) {
  const folderMenu = document.createElement('div');
  const folderItemDelete = document.createElement('button');
  const folderItemShare = document.createElement('button');
  folderMenu.className = 'folder-menu';
  folderItemDelete.className = 'folder-item-delete';
  folderItemShare.className = 'folder-item-share';
  folderItemDelete.textContent = '❌ Delete';
  folderItemShare.textContent = '🌐 Share';
  folderMenu.style.top = `${coordY}px`;
  folderMenu.style.left = `${coordX}px`;
  container.append(folderMenu);
  folderMenu.append(folderItemDelete);
  folderMenu.append(folderItemShare);
}

function shareFolder(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
