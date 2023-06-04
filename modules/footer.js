import { filterTodos } from "./filterTodos.js";

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

export function chooseFooter() {
  const footerContainer = document.querySelector('.todo__footer-mobile');
  const mainFooterContainer = document.querySelector('.todo__footer-filter');

  if (innerWidth < 550) {
    addMobileFooter(footerContainer)
  } else {
    addMobileFooter(mainFooterContainer)
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
}

export function footer() {
  chooseFooter();
}