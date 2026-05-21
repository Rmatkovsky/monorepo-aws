import { Router, Request, Response } from 'express';
import { addClient, removeClient } from '../lib/sse';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  addClient(res);
  req.on('close', () => removeClient(res));
});

export default router;
