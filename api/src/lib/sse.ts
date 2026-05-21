import { Response } from 'express';

const clients = new Set<Response>();

export function addClient(res: Response) {
  clients.add(res);
}

export function removeClient(res: Response) {
  clients.delete(res);
}

export function broadcast(event: object) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  clients.forEach((res) => res.write(data));
}
