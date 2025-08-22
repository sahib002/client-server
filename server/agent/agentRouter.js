import express from 'express';
import { handleMessage } from './controller.js';

const router = express.Router();

router.get('/health', (req, res) => res.json({ ok: true }));
// POST /api/agent/messages
router.post('/messages', handleMessage);

export default router;
