const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const listEl = document.querySelector("#todo-list");
const emptyEl = document.querySelector("#empty");
const counterEl = document.querySelector("#counter");
const clearDoneBtn = document.querySelector("#clear-done");
const filterBtns = document.querySelectorAll(".filter");

const themeBtn = document.querySelector("#theme-toggle");

const STORAGE_KEY = "todo_list_v1";
const THEME_KEY = "todo_theme";

let todos = loadTodos();
let currentFilter = "all"; // all | active | done

function uid() {
  return (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

function sanitizeText(text) {
  return text.trim().replace(/\s+/g, " ");
}

/* ------------------ Storage ------------------ */
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

/* ------------------ CRUD ------------------ */
function addTodo(text) {
  const title = sanitizeText(text);
  if (!title) return;

  todos.unshift({
    id: uid(),
    title,
    done: false,
    createdAt: Date.now()
  });

  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map(t => (t.id === id ? { ...t, done: !t.done } : t));
  saveTodos();
  render();
}

function removeTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

function editTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const next = prompt("Editar tarefa:", todo.title);
  if (next === null) return;

  const title = sanitizeText(next);
  if (!title) return;

  todos = todos.map(t => (t.id === id ? { ...t, title } : t));
  saveTodos();
  render();
}

function clearDone() {
  todos = todos.filter(t => !t.done);
  saveTodos();
  render();
}

/* ------------------ Filtro + contador ------------------ */
function getFilteredTodos() {
  if (currentFilter === "active") return todos.filter(t => !t.done);
  if (currentFilter === "done") return todos.filter(t => t.done);
  return todos;
}

function updateCounter() {
  const total = todos.length;
  const done = todos.filter(t => t.done).length;
  const active = total - done;
  counterEl.textContent = `${total} tarefa(s) • ${active} pendente(s) • ${done} concluída(s)`;
}

/* ------------------ Render ------------------ */
function render() {
  const filtered = getFilteredTodos();
  listEl.innerHTML = "";

  filtered.forEach(todo => {
    const li = document.createElement("li");
    li.className = `item ${todo.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = todo.title;

    const actions = document.createElement("div");
    actions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "action";
    btnEdit.type = "button";
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => editTodo(todo.id));

    const btnDel = document.createElement("button");
    btnDel.className = "action";
    btnDel.type = "button";
    btnDel.textContent = "Remover";
    btnDel.addEventListener("click", () => removeTodo(todo.id));

    actions.append(btnEdit, btnDel);
    li.append(checkbox, text, actions);
    listEl.appendChild(li);
  });

  emptyEl.style.display = (todos.length === 0) ? "block" : "none";
  updateCounter();
}

/* ------------------ Eventos ------------------ */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

clearDoneBtn.addEventListener("click", clearDone);

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    render();
  });
});

/* ------------------ Tema ------------------ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeBtn) themeBtn.textContent = theme === "light" ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;
  const theme = saved ?? (prefersLight ? "light" : "dark");
  applyTheme(theme);
}

themeBtn?.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const next = current === "light" ? "dark" : "light";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

initTheme();
render();
