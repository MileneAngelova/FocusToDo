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

// Project management state
let projects = ['Tasks'];

function addProject(name) {
    if (name && !projects.includes(name)) {
        projects.push(name);
        renderSidebar();
    }
}

function renderProjectList() {
    const sidebar = document.querySelector('.sidebar nav ul');
    if (!sidebar) return;
    sidebar.innerHTML += '<li class="project-label">Projects</li>' +
        projects.map(p => `<li class="${currentFilter === p ? 'active' : ''}" onclick="setProjectFilter('${p}')">${p}</li>`).join('');
    sidebar.innerHTML += `<li><input type="text" id="new-project-input" placeholder="+ Add Project" onkeydown="if(event.key==='Enter'){addProjectFromInput();}"></li>`;
}

function setProjectFilter(project) {
    currentFilter = project;
    renderTaskList();
    renderSidebar();
}
window.setProjectFilter = setProjectFilter;

function addProjectFromInput() {
    const input = document.getElementById('new-project-input');
    if (input && input.value.trim()) {
        addProject(input.value.trim());
        input.value = '';
    }
}
window.addProjectFromInput = addProjectFromInput;

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
    // Do NOT call renderTaskList here, as the form already does it after add
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

// Helper: check if a date is overdue or upcoming
function isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d < today;
}
function isUpcoming(dateStr) {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d > today;
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
    renderProjectList();
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

// Add Task UI
function renderAddTaskForm() {
    const list = document.getElementById('task-list');
    if (!list) return;
    const formHtml = `
        <form id="add-task-form" class="add-task-form">
            <input type="text" id="new-task-title" placeholder="Task title" required />
            <input type="date" id="new-task-date" />
            <input type="text" id="new-task-project" placeholder="Project (optional)" />
            <button type="submit">Add Task</button>
        </form>
    `;
    list.insertAdjacentHTML('afterbegin', formHtml);
    document.getElementById('add-task-form').onsubmit = function(e) {
        e.preventDefault();
        const title = document.getElementById('new-task-title').value.trim();
        const dueDate = document.getElementById('new-task-date').value;
        const project = document.getElementById('new-task-project').value.trim() || 'Tasks';
        if (title) {
            addTask({ title, dueDate, project });
            // Only reset the form, do not re-render the whole page
            this.reset();
            renderTaskList();
        }
    };
}

// Statistics and Progress Tracking
function renderStats() {
    const statsSection = document.getElementById('stats');
    if (!statsSection) return;
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const estimatedTime = total * 25; // 25 min per task (Pomodoro)
    const elapsedTime = completed * 25;
    statsSection.innerHTML = `
        <div class="stats-box">
            <h3>Estimated Time</h3>
            <div class="stat-value">${estimatedTime}m</div>
        </div>
        <div class="stats-box">
            <h3>Tasks to be Completed</h3>
            <div class="stat-value">${total - completed}</div>
        </div>
        <div class="stats-box">
            <h3>Elapsed Time</h3>
            <div class="stat-value">${elapsedTime}m</div>
        </div>
        <div class="stats-box">
            <h3>Completed Tasks</h3>
            <div class="stat-value">${completed}</div>
        </div>
        <div class="stats-box" style="flex:2;">
            <h3>Progress</h3>
            <div class="progress-bar"><div class="progress-bar-inner" style="width:${percent}%;"></div></div>
            <div style="font-size:0.95rem; color:#888; margin-top:0.3rem;">${percent}% completed</div>
        </div>
    `;
}

// Update renderTaskList to also update stats
function renderTaskList() {
    const list = document.getElementById('task-list');
    if (!list) return;
    let filtered;
    if (projects.includes(currentFilter)) {
        filtered = tasks.filter(t => t.project === currentFilter);
    } else {
        const filterObj = FILTERS.find(f => f.label === currentFilter);
        filtered = filterObj ? tasks.filter(filterObj.fn) : tasks;
    }
    const grouped = groupTasksByDate(filtered);
    let html = '<h2>Tasks</h2>';
    list.innerHTML = html;
    renderAddTaskForm();
    if (filtered.length === 0) {
        list.innerHTML += '<p>No tasks for this view.</p>';
    } else {
        list.innerHTML += Object.entries(grouped).map(([date, group]) =>
            `<div class="task-group"><div class="group-label">${date}</div><ul class="tasks">` +
            group.map(task => {
                let dueClass = '';
                if (task.dueDate) {
                    if (isOverdue(task.dueDate) && !task.completed) dueClass = 'overdue';
                    else if (isUpcoming(task.dueDate)) dueClass = 'upcoming';
                }
                return `
                <li class="task${task.completed ? ' completed' : ''} ${dueClass}">
                    <span class="circle" onclick="toggleTaskCompletion('${task.id}')"></span>
                    <span class="title">${task.title}</span>
                    <span class="project">${task.project}</span>
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
                `;
            }).join('') +
            '</ul></div>'
        ).join('');
    }
    renderStats();
}

// Pomodoro Timer Logic
let pomodoroDuration = 25 * 60; // 25 minutes in seconds
let pomodoroTimeLeft = pomodoroDuration;
let pomodoroInterval = null;
let isPomodoroRunning = false;

function updatePomodoroDisplay() {
    const timerSpan = document.querySelector('#pomodoro-timer span');
    if (timerSpan) {
        const min = String(Math.floor(pomodoroTimeLeft / 60)).padStart(2, '0');
        const sec = String(Math.floor(pomodoroTimeLeft % 60)).padStart(2, '0');
        timerSpan.textContent = `${min}:${sec}`;
    }
    const btn = document.getElementById('start-timer');
    if (btn) {
        btn.textContent = isPomodoroRunning ? 'Stop' : 'Start';
    }
}

function startPomodoro() {
    if (isPomodoroRunning) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
    } else {
        if (pomodoroTimeLeft <= 0) pomodoroTimeLeft = pomodoroDuration;
        pomodoroInterval = setInterval(() => {
            if (pomodoroTimeLeft > 0) {
                pomodoroTimeLeft--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                updatePomodoroDisplay();
                alert('Pomodoro session complete!');
            }
        }, 1000);
        isPomodoroRunning = true;
    }
    updatePomodoroDisplay();
}

// Reset Pomodoro (optional, not in UI yet)
function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroTimeLeft = pomodoroDuration;
    isPomodoroRunning = false;
    updatePomodoroDisplay();
}

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('start-timer');
    if (btn) btn.onclick = startPomodoro;
    updatePomodoroDisplay();
});

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
