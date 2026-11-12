"use strict";

const STORAGE_KEY = "mini-task-manager.tasks";

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const appMessage = document.querySelector("#app-message");

let tasks = loadTasks();

function showMessage(message) {
  appMessage.textContent = message;
}

function isTask(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.completed === "boolean"
  );
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);

    if (savedTasks === null) {
      return [];
    }

    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      throw new Error("Les données enregistrées ne sont pas valides.");
    }

    return parsedTasks;
  } catch (error) {
    console.error("Impossible de charger les tâches :", error);
    showMessage("Les tâches enregistrées n’ont pas pu être chargées.");
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    showMessage("");
  } catch (error) {
    console.error("Impossible d’enregistrer les tâches :", error);
    showMessage("La sauvegarde a échoué. Vérifiez les réglages de votre navigateur.");
  }
}

function renderTasks() {
  taskList.replaceChildren();

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.taskId = task.id;

    if (task.completed) {
      item.classList.add("is-completed");
    }

    const checkbox = document.createElement("input");
    checkbox.className = "task-check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Marquer « ${task.text} » comme terminée`);

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Supprimer";
    deleteButton.setAttribute("aria-label", `Supprimer « ${task.text} »`);

    item.append(checkbox, text, deleteButton);
    taskList.append(item);
  }

  const taskLabel = tasks.length === 1 ? "tâche" : "tâches";
  taskCount.textContent = `${tasks.length} ${taskLabel}`;
  emptyState.hidden = tasks.length > 0;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.push({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  saveTasks();
  renderTasks();
  taskForm.reset();
  taskInput.focus();
});

taskList.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") {
    return;
  }

  const item = event.target.closest("[data-task-id]");
  const task = tasks.find((currentTask) => currentTask.id === item?.dataset.taskId);

  if (!task) {
    return;
  }

  task.completed = event.target.checked;
  saveTasks();
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || event.target.dataset.action !== "delete") {
    return;
  }

  const item = event.target.closest("[data-task-id]");

  if (!item) {
    return;
  }

  tasks = tasks.filter((task) => task.id !== item.dataset.taskId);
  saveTasks();
  renderTasks();
});

renderTasks();
