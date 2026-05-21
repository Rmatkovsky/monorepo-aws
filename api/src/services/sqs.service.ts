import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqs = new SQSClient({
  region: process.env.AWS_REGION!,
});

export interface ImageProcessingMessage {
  todoId: string;
  imageKey: string;
  bucket: string;
}

export async function sendImageProcessingJob(payload: ImageProcessingMessage): Promise<void> {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.SQS_QUEUE_URL!,
      MessageBody: JSON.stringify(payload),
      MessageAttributes: {
        EventType: {
          DataType: 'String',
          StringValue: 'IMAGE_PROCESSING',
        },
      },
    })
  );
}
