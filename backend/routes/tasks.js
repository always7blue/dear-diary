import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
const router = express.Router();

let tasks = [];

// GET tasks
router.get('/', authMiddleware, (req,res)=>{
  const { date } = req.query; // YYYY-MM-DD
  let userTasks = tasks.filter(t => t.userId === req.user.id);
  if (date) {
    userTasks = userTasks.filter(t => t.day === date);
  }
  res.json(userTasks);
});

// POST task
router.post('/', authMiddleware, (req,res)=>{
  const { text, date } = req.body;
  if(!text) return res.status(400).json({ message:'Text required' });
  const day = date || new Date().toISOString().slice(0,10);
  const newTask = { id: Date.now(), userId: req.user.id, text, done:false, day, date: `${day}T00:00:00.000Z` };
  tasks.push(newTask);
  res.json(newTask);
});

// PATCH toggle
router.patch('/:id', authMiddleware, (req,res)=>{
  const task = tasks.find(t=>t.id==req.params.id && t.userId === req.user.id);
  if(!task) return res.status(404).json({ message:'Not found' });
  task.done = !task.done;
  res.json(task);
});

// DELETE
router.delete('/:id', authMiddleware, (req,res)=>{
  tasks = tasks.filter(t=> !(t.id==req.params.id && t.userId === req.user.id));
  res.json({ message:'Deleted' });
});

export default router;
