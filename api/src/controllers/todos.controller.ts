import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Todo } from '@prisma/client';
import prisma from '../lib/prisma';
import { uploadToS3, deleteFromS3, getPresignedUrl } from '../services/s3.service';
import { sendImageProcessingJob } from '../services/sqs.service';

async function withPresignedUrl(todo: Todo) {
  if (!todo.imageKey) return todo;
  return { ...todo, imageUrl: await getPresignedUrl(todo.imageKey) };
}

const createSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
});

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  completed: z.boolean().optional(),
});

export async function listTodos(req: Request, res: Response, next: NextFunction) {
  try {
    const todos = await prisma.todo.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(await Promise.all(todos.map(withPresignedUrl)));
  } catch (err) {
    next(err);
  }
}

export async function getTodo(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
    if (!todo) return res.status(404).json({ error: 'Not found' });
    res.json(await withPresignedUrl(todo));
  } catch (err) {
    next(err);
  }
}

export async function createTodo(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const todo = await prisma.todo.create({ data: parsed.data });
    res.status(201).json(todo);
  } catch (err) {
    next(err);
  }
}

export async function updateTodo(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
    if (!todo) return res.status(404).json({ error: 'Not found' });

    const updated = await prisma.todo.update({ where: { id: req.params.id }, data: parsed.data });
    res.json(await withPresignedUrl(updated));
  } catch (err) {
    next(err);
  }
}

export async function deleteTodo(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
    if (!todo) return res.status(404).json({ error: 'Not found' });

    if (todo.imageKey) {
      await deleteFromS3(todo.imageKey).catch(console.error);
    }

    await prisma.todo.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
    if (!todo) return res.status(404).json({ error: 'Not found' });

    if (todo.imageKey) {
      await deleteFromS3(todo.imageKey).catch(console.error);
    }

    const ext = req.file.originalname.split('.').pop();
    const key = `todos/${req.params.id}/${randomUUID()}.${ext}`;

    const imageUrl = await uploadToS3(key, req.file.buffer, req.file.mimetype);

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: { imageUrl, imageKey: key, imageStatus: 'PENDING' },
    });

    await sendImageProcessingJob({
      todoId: req.params.id,
      imageKey: key,
      bucket: process.env.S3_BUCKET_NAME!,
    });

    res.json(await withPresignedUrl(updated));
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(req: Request, res: Response, next: NextFunction) {
  try {
    const todo = await prisma.todo.findUnique({ where: { id: req.params.id } });
    if (!todo) return res.status(404).json({ error: 'Not found' });
    if (!todo.imageKey) return res.status(404).json({ error: 'No image' });

    await deleteFromS3(todo.imageKey);

    const updated = await prisma.todo.update({
      where: { id: req.params.id },
      data: { imageUrl: null, imageKey: null, imageStatus: 'NONE' },
    });

    res.json(await withPresignedUrl(updated));
  } catch (err) {
    next(err);
  }
}
