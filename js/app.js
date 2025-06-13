// Entry point for Focus To-Do App
console.log('Focus To-Do App loaded');

// Task object model
class Task {
    constructor({ id, title, dueDate = null, project = 'Tasks', subtasks = [], notes = '', completed = false }) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.project = project;
        this.subtasks = subtasks;
        this.notes = notes;
        this.completed = completed;
    }
}

// Task management state
let tasks = [];

// Utility: Generate unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Add Task
function addTask({ title, dueDate, project, subtasks, notes }) {
    const task = new Task({
        id: generateId(),
        title,
        dueDate,
        project,
        subtasks: subtasks || [],
        notes: notes || '',
        completed: false
    });
    tasks.push(task);
    renderTaskList();
}

// Edit Task
function editTask(id, updates) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        Object.assign(task, updates);
        renderTaskList();
    }
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTaskList();
}

// Toggle Task Completion
function toggleTaskCompletion(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTaskList();
    }
}

// Render Task List
function renderTaskList() {
    const list = document.getElementById('task-list');
    if (!list) return;
    list.innerHTML = '<h2>Tasks</h2>' +
        (tasks.length === 0 ? '<p>No tasks yet.</p>' :
            '<ul class="tasks">' +
            tasks.map(task => `
                <li class="task${task.completed ? ' completed' : ''}">
                    <span class="circle" onclick="toggleTaskCompletion('${task.id}')"></span>
                    <span class="title">${task.title}</span>
                    <span class="due-date">${task.dueDate ? task.dueDate : ''}</span>
                    <button onclick="deleteTask('${task.id}')">Delete</button>
                </li>
            `).join('') +
            '</ul>');
}

// Expose functions for inline event handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;

// Initial render
window.onload = renderTaskList;
