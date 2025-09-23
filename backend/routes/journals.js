import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
let journals = [];

router.get('/', authMiddleware, (req, res) => {
  const { date } = req.query; // YYYY-MM-DD
  let userJournals = journals.filter(j => j.userId === req.user.id);
  if (date) {
    userJournals = userJournals.filter(j => j.day === date);
  }
  res.json(userJournals);
});

router.post('/', authMiddleware, (req, res) => {
  const { content, date } = req.body;
  if (!content) return res.status(400).json({ message: 'Content is required' });
  const day = date || new Date().toISOString().slice(0,10);
  const newJournal = { id: Date.now(), userId: req.user.id, content, day, created_at: new Date(`${day}T00:00:00.000Z`) };
  journals.push(newJournal);
  res.json(newJournal);
});

router.delete('/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const before = journals.length;
  journals = journals.filter(j => {
    const isTarget = j.id == id;
    const isOwner = j.userId === req.user.id;
    const isLegacy = typeof j.userId === 'undefined' || j.userId === null;
    return !(isTarget && (isOwner || isLegacy));
  });
  // Make delete idempotent: return success even if already deleted/not found
  res.json({ message: 'Deleted' });
});

export default router;
