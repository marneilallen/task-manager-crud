const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskIdInput = document.getElementById('task-id');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const formTitle = document.getElementById('form-title');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const taskList = document.getElementById('task-list');
const loadingDiv = document.getElementById('loading');

// Fetch and display tasks when page loads
document.addEventListener('DOMContentLoaded', fetchTasks);

// Handle Form Submission (Create or Update)
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = taskIdInput.value;
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) return;

  const taskData = { title, description };

  if (id) {
    // Update existing task (PUT)
    await updateTask(id, taskData);
  } else {
    // Create new task (POST)
    await createTask(taskData);
  }

  resetForm();
  await fetchTasks();
});

// Cancel Edit button action
cancelBtn.addEventListener('click', resetForm);

// Fetch all tasks from backend API
async function fetchTasks() {
  loadingDiv.classList.remove('hidden');
  taskList.innerHTML = '';

  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();

    loadingDiv.classList.add('hidden');

    if (tasks.length === 0) {
      taskList.innerHTML = '<p class="text-muted">No tasks available. Add one above!</p>';
      return;
    }

    tasks.forEach(task => {
      const taskCard = document.createElement('div');
      taskCard.className = 'task-item';
      
      const dateFormatted = new Date(task.created_at).toLocaleString();

      taskCard.innerHTML = `
        <div class="task-content">
          <h3>${escapeHtml(task.title)}</h3>
          <p>${escapeHtml(task.description || 'No description provided.')}</p>
          <small>Created: ${dateFormatted}</small>
        </div>
        <div class="task-actions">
          <button class="btn btn-secondary" onclick="editTask('${task.id}', '${escapeJs(task.title)}', '${escapeJs(task.description)}')">Edit</button>
          <button class="btn btn-danger" onclick="deleteTask('${task.id}')">Delete</button>
        </div>
      `;

      taskList.appendChild(taskCard);
    });
  } catch (error) {
    loadingDiv.classList.add('hidden');
    taskList.innerHTML = '<p class="text-muted" style="color: red;">Failed to load tasks from server.</p>';
  }
}

// Create a new task via API
async function createTask(taskData) {
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
  } catch (error) {
    alert('Error creating task.');
  }
}

// Update a task via API
async function updateTask(id, taskData) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    });
  } catch (error) {
    alert('Error updating task.');
  }
}

// Delete a task via API
async function deleteTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    await fetchTasks();
  } catch (error) {
    alert('Error deleting task.');
  }
}

// Populate form fields to edit a task
function editTask(id, title, description) {
  taskIdInput.value = id;
  titleInput.value = title;
  descriptionInput.value = description === 'null' ? '' : description;

  formTitle.textContent = 'Edit Task';
  saveBtn.textContent = 'Update Task';
  cancelBtn.classList.remove('hidden');
}

// Reset form to default creation mode
function resetForm() {
  taskIdInput.value = '';
  titleInput.value = '';
  descriptionInput.value = '';

  formTitle.textContent = 'Add New Task';
  saveBtn.textContent = 'Save Task';
  cancelBtn.classList.add('hidden');
}

// Utility functions to prevent XSS injection in raw output strings
function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeJs(str) {
  return String(str || '').replace(/'/g, "\\'").replace(/"/g, '\\"');
}