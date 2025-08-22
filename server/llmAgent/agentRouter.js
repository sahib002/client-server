import express from 'express';
import { handleLLMMessage } from './controller.js';

console.log('[llmAgent] agentRouter loaded');

const router = express.Router();

router.get('/', (req, res) => res.json({ ok: true, service: 'agent' }));
router.get('/health', (req, res) => res.json({ ok: true }));
router.post('/messages', handleLLMMessage);

export default router;
