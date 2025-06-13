// Entry point for Focus To-Do App
console.log('Focus To-Do App loaded');

// Task object model
class Task {
    constructor({ id, title, dueDate = null, project = 'Tasks', subtasks = [], notes = '', completed = false }) {
        this.id = id;
        this.title = title;
        this.dueDate = dueDate;
        this.project = project;
        this.subtasks = subtasks; // Array of { id, title, completed }
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

// Add Subtask
function addSubtask(taskId, subtaskTitle) {
    const task = tasks.find(t => t.id === taskId);
    if (task && subtaskTitle) {
        task.subtasks.push({ id: generateId(), title: subtaskTitle, completed: false });
        renderTaskList();
    }
}
// Toggle Subtask Completion
function toggleSubtaskCompletion(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subtask = task.subtasks.find(st => st.id === subtaskId);
        if (subtask) {
            subtask.completed = !subtask.completed;
            renderTaskList();
        }
    }
}
// Delete Subtask
function deleteSubtask(taskId, subtaskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.subtasks = task.subtasks.filter(st => st.id !== subtaskId);
        renderTaskList();
    }
}
// Update Notes
function updateTaskNotes(taskId, notes) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.notes = notes;
        renderTaskList();
    }
}

// Task list filters and grouping by date
const FILTERS = [
    { label: 'Today', fn: t => isToday(t.dueDate) },
    { label: 'Tomorrow', fn: t => isTomorrow(t.dueDate) },
    { label: 'This Week', fn: t => isThisWeek(t.dueDate) },
    { label: 'Planned', fn: t => !!t.dueDate && !isToday(t.dueDate) && !isTomorrow(t.dueDate) && !isThisWeek(t.dueDate) },
    { label: 'Completed', fn: t => t.completed }
];
let currentFilter = 'Today';

function isToday(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
}
function isTomorrow(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return d.getFullYear() === tomorrow.getFullYear() && d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate();
}
function isThisWeek(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    const d = new Date(dateStr);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return d >= weekStart && d <= weekEnd;
}

function setFilter(label) {
    currentFilter = label;
    renderTaskList();
    renderSidebar();
}

function renderSidebar() {
    const sidebar = document.querySelector('.sidebar nav ul');
    if (!sidebar) return;
    sidebar.innerHTML = FILTERS.map(f => `<li class="${currentFilter === f.label ? 'active' : ''}" onclick="setFilter('${f.label}')">${f.label}</li>`).join('');
}
window.setFilter = setFilter;

// Group tasks by date for display
function groupTasksByDate(tasks) {
    const groups = {};
    tasks.forEach(task => {
        let key = 'No Date';
        if (task.dueDate) {
            const d = new Date(task.dueDate);
            key = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
        }
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
    });
    return groups;
}

// Update renderTaskList to use filter and grouping
function renderTaskList() {
    const list = document.getElementById('task-list');
    if (!list) return;
    const filterObj = FILTERS.find(f => f.label === currentFilter);
    const filtered = filterObj ? tasks.filter(filterObj.fn) : tasks;
    const grouped = groupTasksByDate(filtered);
    let html = '<h2>Tasks</h2>';
    if (filtered.length === 0) {
        html += '<p>No tasks for this view.</p>';
    } else {
        html += Object.entries(grouped).map(([date, group]) =>
            `<div class="task-group"><div class="group-label">${date}</div><ul class="tasks">` +
            group.map(task => `
                <li class="task${task.completed ? ' completed' : ''}">
                    <span class="circle" onclick="toggleTaskCompletion('${task.id}')"></span>
                    <span class="title">${task.title}</span>
                    <span class="due-date">${task.dueDate ? task.dueDate : ''}</span>
                    <button onclick="deleteTask('${task.id}')">Delete</button>
                    <div class="subtasks">
                        <strong>Subtasks:</strong>
                        <ul>
                            ${task.subtasks.map(st => `
                                <li class="subtask${st.completed ? ' completed' : ''}">
                                    <input type="checkbox" ${st.completed ? 'checked' : ''} onclick="toggleSubtaskCompletion('${task.id}', '${st.id}')">
                                    <span>${st.title}</span>
                                    <button onclick="deleteSubtask('${task.id}', '${st.id}')">x</button>
                                </li>
                            `).join('')}
                        </ul>
                        <input type="text" placeholder="Add subtask..." onkeydown="if(event.key==='Enter'){addSubtask('${task.id}', this.value); this.value='';}">
                    </div>
                    <div class="notes">
                        <strong>Notes:</strong>
                        <textarea placeholder="Add notes..." onchange="updateTaskNotes('${task.id}', this.value)">${task.notes || ''}</textarea>
                    </div>
                </li>
            `).join('') +
            '</ul></div>'
        ).join('');
    }
    list.innerHTML = html;
}

// Expose functions for inline event handlers
window.toggleTaskCompletion = toggleTaskCompletion;
window.deleteTask = deleteTask;
window.addSubtask = addSubtask;
window.toggleSubtaskCompletion = toggleSubtaskCompletion;
window.deleteSubtask = deleteSubtask;
window.updateTaskNotes = updateTaskNotes;

// Initial render
window.onload = function() {
    renderSidebar();
    renderTaskList();
};
