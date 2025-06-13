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
    const container = document.getElementById('add-task-form-container');
    if (!container) {
        console.warn('Add task form container not found!');
        return;
    }
    container.innerHTML = `
        <form id="add-task-form" class="add-task-form">
            <input type="text" id="new-task-title" placeholder="Task title" required />
            <input type="date" id="new-task-date" />
            <input type="text" id="new-task-project" placeholder="Project (optional)" />
            <button type="submit">Add Task</button>
        </form>
    `;
    document.getElementById('add-task-form').onsubmit = function(e) {
        e.preventDefault();
        const title = document.getElementById('new-task-title').value.trim();
        const dueDate = document.getElementById('new-task-date').value;
        const project = document.getElementById('new-task-project').value.trim() || 'Tasks';
        if (title) {
            addTask({ title, dueDate, project });
            this.reset();
            renderTaskList();
        }
    };
    // Auto-focus the title input for better UX
    document.getElementById('new-task-title').focus();
    console.log('Add task form rendered');
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
    const todayKey = getTodayKey();
    const todayPomodoros = pomodoroSessions[todayKey] || 0;
    statsSection.innerHTML = `
        <div class="stats-container">
            <div class="stats-box">
                <div class="stat-label">Estimated Time</div>
                <div class="stat-value">${estimatedTime}m</div>
            </div>
            <div class="stats-box">
                <div class="stat-label">Tasks to be Completed</div>
                <div class="stat-value">${total - completed}</div>
            </div>
            <div class="stats-box">
                <div class="stat-label">Elapsed Time</div>
                <div class="stat-value">${elapsedTime}m</div>
            </div>
            <div class="stats-box">
                <div class="stat-label">Completed Tasks</div>
                <div class="stat-value">${completed}</div>
            </div>
            <div class="stats-box">
                <div class="stat-label">Today's Pomodoros</div>
                <div class="stat-value">${todayPomodoros}</div>
            </div>
            <div class="stats-box stats-progress">
                <div class="stat-label">Progress</div>
                <div class="progress-bar"><div class="progress-bar-inner" style="width:${percent}%;"></div></div>
                <div class="progress-label">${percent}% completed</div>
            </div>
        </div>
    `;
}

// Update renderTaskList to NOT re-render the add task form
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
    // Do NOT call renderAddTaskForm here
    if (filtered.length === 0) {
        // Improved empty state message
        list.innerHTML += `<p>No tasks for "${currentFilter}". Add your first task above!</p>`;
    } else {
        list.innerHTML += Object.entries(grouped).map(([date, group]) =>
            `<div class="task-group"><div class="group-label">${date}</div><ul class="tasks">` +
            group.map(task =>
                `<li class="task${task.completed ? ' completed' : ''}" onclick="renderTaskDetails('${task.id}')">
                    <span class="circle"></span>
                    <span class="pomodoro-dot"><span class="dot"></span></span>
                    <span class="title">${task.title}</span>
                    <span class="due-date">${task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : ''}</span>
                </li>`
            ).join('') +
            '</ul></div>'
        ).join('');
    }
    renderStats();
}

// Render Task Details Panel
function renderTaskDetails(taskId) {
    const detailsSection = document.getElementById('task-details');
    if (!detailsSection) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        detailsSection.innerHTML = '<div class="empty-details">Select a task to see details.</div>';
        return;
    }
    // Pomodoro stats for this task (future: per-task sessions)
    detailsSection.innerHTML = `
        <div class="details-header">
            <span class="details-title">${task.title}</span>
            <span class="details-project">${task.project}</span>
        </div>
        <div class="details-row"><strong>Due Date:</strong> <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}</span></div>
        <div class="details-row"><strong>Notes:</strong><br><textarea onchange="updateTaskNotes('${task.id}', this.value)">${task.notes || ''}</textarea></div>
        <div class="details-row"><strong>Subtasks:</strong>
            <ul class="details-subtasks">
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
    `;
}
window.renderTaskDetails = renderTaskDetails;

// Pomodoro Timer Logic
// Pomodoro durations (customizable)
let pomodoroDuration = 25 * 60; // 25 minutes in seconds
let shortBreakDuration = 5 * 60; // 5 minutes
let longBreakDuration = 15 * 60; // 15 minutes
let pomodoroTimeLeft = pomodoroDuration;
let pomodoroInterval = null;
let isPomodoroRunning = false;
let currentTimerType = 'pomodoro'; // 'pomodoro', 'short', 'long'

// Render Pomodoro controls
function renderPomodoroControls() {
    const timerDiv = document.getElementById('pomodoro-timer');
    if (!timerDiv) return;
    timerDiv.innerHTML = `
        <span id="pomodoro-time">25:00</span>
        <button id="start-timer"><span id="start-timer-icon">▶️</span></button>
        <button id="short-break" title="Short Break"><span>☕</span></button>
        <button id="long-break" title="Long Break"><span>🛏️</span></button>
        <button id="pomodoro-settings">⚙️</button>
        <div id="pomodoro-settings-panel" style="display:none;">
            <label>Pomodoro: <input type="number" id="pomodoro-mins" min="1" max="60" value="${pomodoroDuration/60}"> min</label>
            <label>Short Break: <input type="number" id="short-mins" min="1" max="30" value="${shortBreakDuration/60}"> min</label>
            <label>Long Break: <input type="number" id="long-mins" min="1" max="60" value="${longBreakDuration/60}"> min</label>
            <button id="save-pomodoro-settings">Save</button>
        </div>
    `;
    document.getElementById('start-timer').onclick = startPomodoro;
    document.getElementById('short-break').onclick = startShortBreak;
    document.getElementById('long-break').onclick = startLongBreak;
    document.getElementById('pomodoro-settings').onclick = function() {
        const panel = document.getElementById('pomodoro-settings-panel');
        // Toggle settings panel position for mobile/desktop
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            // Position panel below the settings button
            const btnRect = this.getBoundingClientRect();
            panel.style.position = 'absolute';
            panel.style.left = btnRect.left + 'px';
            panel.style.top = (btnRect.bottom + window.scrollY + 8) + 'px';
        } else {
            panel.style.display = 'none';
        }
    };
    document.getElementById('save-pomodoro-settings').onclick = function() {
        pomodoroDuration = Math.max(1, parseInt(document.getElementById('pomodoro-mins').value, 10)) * 60;
        shortBreakDuration = Math.max(1, parseInt(document.getElementById('short-mins').value, 10)) * 60;
        longBreakDuration = Math.max(1, parseInt(document.getElementById('long-mins').value, 10)) * 60;
        saveData();
        resetPomodoro();
        renderPomodoroControls();
    };
    updatePomodoroDisplay();

    // Hide settings panel when clicking outside
    document.addEventListener('mousedown', function hidePomodoroSettings(e) {
        const panel = document.getElementById('pomodoro-settings-panel');
        const btn = document.getElementById('pomodoro-settings');
        if (panel && btn && panel.style.display !== 'none') {
            if (!panel.contains(e.target) && e.target !== btn) {
                panel.style.display = 'none';
            }
        }
    });
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
                incrementPomodoroSession();
                notifyPomodoroEnd();
                alert('Pomodoro session complete!');
            }
        }, 1000);
        isPomodoroRunning = true;
    }
    updatePomodoroDisplay();
}

function startShortBreak() {
    clearInterval(pomodoroInterval);
    pomodoroTimeLeft = shortBreakDuration;
    currentTimerType = 'short';
    isPomodoroRunning = false;
    updatePomodoroDisplay();
}
function startLongBreak() {
    clearInterval(pomodoroInterval);
    pomodoroTimeLeft = longBreakDuration;
    currentTimerType = 'long';
    isPomodoroRunning = false;
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const timerSpan = document.getElementById('pomodoro-time') || document.querySelector('#pomodoro-timer span');
    if (timerSpan) {
        const min = String(Math.floor(pomodoroTimeLeft / 60)).padStart(2, '0');
        const sec = String(Math.floor(pomodoroTimeLeft % 60)).padStart(2, '0');
        timerSpan.textContent = `${min}:${sec}`;
    }
    const btn = document.getElementById('start-timer');
    const icon = document.getElementById('start-timer-icon');
    if (btn && icon) {
        icon.textContent = isPomodoroRunning ? '⏸️' : '▶️';
    }
}

// Reset Pomodoro (optional, not in UI yet)
function resetPomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroTimeLeft = pomodoroDuration;
    isPomodoroRunning = false;
    updatePomodoroDisplay();
}

// Pomodoro Session Tracking
let pomodoroSessions = {};

function getTodayKey() {
    const today = new Date();
    return today.toISOString().slice(0, 10); // YYYY-MM-DD
}

function incrementPomodoroSession() {
    const key = getTodayKey();
    if (!pomodoroSessions[key]) pomodoroSessions[key] = 0;
    pomodoroSessions[key]++;
    saveData();
    renderStats();
}

// Data Persistence: Save and Load from localStorage
function saveData() {
    localStorage.setItem('focus_todo_tasks', JSON.stringify(tasks));
    localStorage.setItem('focus_todo_projects', JSON.stringify(projects));
    localStorage.setItem('focus_todo_pomodoros', JSON.stringify(pomodoroSessions));
    localStorage.setItem('focus_todo_durations', JSON.stringify({pomodoroDuration, shortBreakDuration, longBreakDuration}));
}
function loadData() {
    const savedTasks = localStorage.getItem('focus_todo_tasks');
    const savedProjects = localStorage.getItem('focus_todo_projects');
    const savedPomodoros = localStorage.getItem('focus_todo_pomodoros');
    const savedDurations = localStorage.getItem('focus_todo_durations');
    if (savedTasks) tasks = JSON.parse(savedTasks);
    if (savedProjects) projects = JSON.parse(savedProjects);
    if (savedPomodoros) pomodoroSessions = JSON.parse(savedPomodoros);
    if (savedDurations) {
        const d = JSON.parse(savedDurations);
        pomodoroDuration = d.pomodoroDuration || pomodoroDuration;
        shortBreakDuration = d.shortBreakDuration || shortBreakDuration;
        longBreakDuration = d.longBreakDuration || longBreakDuration;
    }
}

// Patch all mutating functions to save after change
['addTask','editTask','deleteTask','toggleTaskCompletion','addSubtask','toggleSubtaskCompletion','deleteSubtask','updateTaskNotes','addProject'].forEach(fn => {
    const orig = window[fn] || eval(fn);
    window[fn] = function(...args) {
        const result = orig.apply(this, args);
        saveData();
        return result;
    };
});
// Load data on app start
loadData();

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
    renderAddTaskForm();
    renderPomodoroControls();
};
