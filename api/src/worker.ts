import 'dotenv/config';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import sharp from 'sharp';
import prisma from './lib/prisma';

const sqs = new SQSClient({ region: process.env.AWS_REGION! });
const s3 = new S3Client({ region: process.env.AWS_REGION! });

const QUEUE_URL = process.env.SQS_QUEUE_URL!;
const BUCKET = process.env.S3_BUCKET_NAME!;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

const API_URL = `http://localhost:${process.env.PORT || 3001}`;

async function notify(todoId: string, imageStatus: string) {
  await fetch(`${API_URL}/api/internal/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ todoId, imageStatus }),
  }).catch(() => {});
}

async function processMessage(body: string, receiptHandle: string) {
  const { todoId, imageKey } = JSON.parse(body);

  try {
    const { Body } = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: imageKey }));
    const original = await streamToBuffer(Body as Readable);

    const processed = await sharp(original)
      .resize({ width: 1200, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: imageKey,
        Body: processed,
        ContentType: 'image/jpeg',
      })
    );

    await prisma.todo.update({
      where: { id: todoId },
      data: { imageStatus: 'PROCESSED' },
    });

    await notify(todoId, 'PROCESSED');
    console.log(`[worker] processed ${imageKey}`);
  } catch (err) {
    console.error(`[worker] failed ${imageKey}`, err);
    await prisma.todo.update({
      where: { id: todoId },
      data: { imageStatus: 'FAILED' },
    });
    await notify(todoId, 'FAILED');
  }

  await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: receiptHandle }));
}

async function poll() {
  while (true) {
    const { Messages } = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 5,
        WaitTimeSeconds: 20,
      })
    );

    if (Messages?.length) {
      await Promise.all(
        Messages.map((m) => processMessage(m.Body!, m.ReceiptHandle!))
      );
    }
  }
}

console.log('[worker] starting...');
poll().catch((err) => {
  console.error('[worker] fatal', err);
  process.exit(1);
});
