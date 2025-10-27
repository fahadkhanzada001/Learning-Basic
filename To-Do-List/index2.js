class TodoApp {
  constructor() {
    this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    this.currentFilter = "all";
    this.editingTaskId = null;

    this.initializeElements();
    this.bindEvents();
    this.render();
  }

  initializeElements() {
    this.$taskInput = $("#taskInput");
    this.$prioritySelect = $("#prioritySelect");
    this.$addTaskForm = $("#addTaskForm");
    this.$tasksList = $("#tasksList");
    this.$emptyState = $("#emptyState");
    this.$totalTasksEl = $("#totalTasks");
    this.$completedTasksEl = $("#completedTasks");
    this.$filterBtns = $(".filter-btn");
    this.$clearCompletedBtn = $("#clearCompleted");
  }

  bindEvents() {
    this.$addTaskForm.on("submit", (e) => this.handleAddTask(e));
    this.$clearCompletedBtn.on("click", () => this.clearCompleted());
    this.$filterBtns.on("click", (e) => this.handleFilterChange(e));
  }

  handleAddTask(e) {
    e.preventDefault();

    const text = this.$taskInput.val().trim();
    const priority = this.$prioritySelect.val();

    if (!text) return;

    const task = {
      id: Date.now().toString(),
      text,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(task);
    this.saveToStorage();
    this.render();

    // Reset form
    this.$taskInput.val("");
    this.$prioritySelect.val("medium");

    // Animation
    this.$taskInput.css("transform", "scale(0.98)");
    setTimeout(() => this.$taskInput.css("transform", "scale(1)"), 150);
  }

  handleFilterChange(e) {
    this.$filterBtns.removeClass("active");
    $(e.target).addClass("active");
    this.currentFilter = $(e.target).data("filter");
    this.render();
  }

  toggleTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveToStorage();
      this.render();
    }
  }

  deleteTask(taskId) {
    const $taskElement = $(`[data-task-id="${taskId}"]`);
    if ($taskElement.length) {
      $taskElement.addClass("removing");
      setTimeout(() => {
        this.tasks = this.tasks.filter((t) => t.id !== taskId);
        this.saveToStorage();
        this.render();
      }, 300);
    }
  }

  startEdit(taskId) {
    this.editingTaskId = taskId;
    this.render();

    setTimeout(() => {
      const $editInput = $(".edit-input");
      if ($editInput.length) {
        $editInput.focus().select();
      }
    }, 0);
  }

  saveEdit(taskId, newText) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && newText.trim()) {
      task.text = newText.trim();
      this.editingTaskId = null;
      this.saveToStorage();
      this.render();
    }
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.render();
  }

  // clearCompleted button
  clearCompleted() {
    const completedTasks = this.tasks.filter((t) => t.completed);
    if (completedTasks.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${completedTasks.length} completed task(s)?`
      )
    ) {
      this.tasks = this.tasks.filter((t) => !t.completed);
      this.saveToStorage();
      this.render();
    }
  }

  getFilteredTasks() {
    switch (this.currentFilter) {
      case "pending":
        return this.tasks.filter((t) => !t.completed);
      case "completed":
        return this.tasks.filter((t) => t.completed);
      default:
        return this.tasks;
    }
  }

  saveToStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    this.$totalTasksEl.text(total);
    this.$completedTasksEl.text(completed);
  }

  createTaskElement(task) {
    const isEditing = this.editingTaskId === task.id;

    return `
      <li class="task-item ${task.completed ? "completed" : ""} ${
      isEditing ? "editing" : ""
    }" data-task-id="${task.id}">
        <div class="task-checkbox ${
          task.completed ? "checked" : ""
        }" onclick="app.toggleTask('${task.id}')"></div>

        <div class="task-content">
          ${
            isEditing
              ? `
              <input type="text" class="edit-input" value="${task.text}"
                onkeydown="if(event.key==='Enter') app.saveEdit('${task.id}', this.value); if(event.key==='Escape') app.cancelEdit()">
              <div class="edit-actions">
                <button class="save-btn" onclick="app.saveEdit('${task.id}', this.previousElementSibling.value)">Save</button>
                <button class="cancel-btn" onclick="app.cancelEdit()">Cancel</button>
              </div>
            `
              : `
              <span class="task-text">${task.text}</span>
              <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            `
          }
        </div>

        ${
          !isEditing
            ? `
            <div class="task-actions">
              <button class="edit-btn" onclick="app.startEdit('${task.id}')" title="Edit task">✏️</button>
              <button class="delete-btn" onclick="app.deleteTask('${task.id}')" title="Delete task">🗑️</button>
            </div>
          `
            : ""
        }
      </li>
    `;
  }

  render() {
    const filteredTasks = this.getFilteredTasks();
    this.updateStats();

    if (filteredTasks.length === 0) {
      this.$emptyState.removeClass("hidden");
      this.$tasksList.html("");
    } else {
      this.$emptyState.addClass("hidden");
      this.$tasksList.html(
        filteredTasks.map((task) => this.createTaskElement(task)).join("")
      );
    }

    const hasCompleted = this.tasks.some((t) => t.completed);
    this.$clearCompletedBtn.css({
      opacity: hasCompleted ? "1" : "0.5",
      pointerEvents: hasCompleted ? "auto" : "none",
    });
  }
}

// Initialize
$(document).ready(() => {
  window.app = new TodoApp();

  if (window.app.tasks.length === 0) {
    const sampleTasks = [
      {
        id: "1",
        text: "Welcome to TaskMaster!",
        priority: "medium",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        text: "Try adding a new task",
        priority: "low",
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        text: "Click checkbox to complete",
        priority: "high",
        completed: true,
        createdAt: new Date().toISOString(),
      },
    ];
    window.app.tasks = sampleTasks;
    window.app.saveToStorage();
    window.app.render();
  }
});

// // API ko call karna using fetch
// fetch("https://jsonplaceholder.typicode.com/posts/1")
//   .then(response => response.json()) // response ko JSON me convert karna
//   .then(data => {
//     console.table("Data from API:", data);
//     alert(JSON.stringify(data));
//   })
//   .catch(error => {
//     console.error("Error aya:", error);
//   });
