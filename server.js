const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Load environment variables from .env file
dotenv.config();

// Verify required environment variables exist
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be defined in .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    realtime: {
      transport: ws,
    },
  }
);

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------

// 1. GET ALL TASKS
// HTTP Method: GET | Endpoint: /api/tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET SINGLE TASK BY ID
// HTTP Method: GET | Endpoint: /api/tasks/:id
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. CREATE A NEW TASK
// HTTP Method: POST | Endpoint: /api/tasks
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title: title.trim(), description: description ? description.trim() : '' }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. UPDATE AN EXISTING TASK
// HTTP Method: PUT | Endpoint: /api/tasks/:id
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ title: title.trim(), description: description ? description.trim() : '' })
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Task not found for update' });
    }

    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. DELETE A TASK
// HTTP Method: DELETE | Endpoint: /api/tasks/:id
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Task not found for deletion' });
    }

    return res.status(200).json({ message: 'Task deleted successfully', deletedTask: data[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running smoothly on http://localhost:${PORT}`);
});