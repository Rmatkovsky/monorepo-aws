# AWS Todos

A full-stack Todo application built with React, Node.js, MySQL, and AWS services (S3, SQS). Structured as a monorepo with separate `frontend` and `api` packages.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TanStack Query |
| API | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | MySQL |
| Image storage | AWS S3 |
| Async processing | AWS SQS |
| Frontend hosting | AWS Amplify |

## Project Structure

```
aws/
├── amplify.yml              # AWS Amplify build config
├── package.json             # Monorepo root (npm workspaces)
├── api/
│   ├── prisma/
│   │   └── schema.prisma    # MySQL schema (Todo model)
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Multer upload (5 MB limit)
│   │   ├── routes/          # Express routes
│   │   ├── services/
│   │   │   ├── s3.service.ts
│   │   │   └── sqs.service.ts
│   │   └── index.ts         # Express entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/             # Axios client + typed API calls
    │   ├── components/      # AddTodo, TodoList, TodoItem, ImageUpload
    │   ├── hooks/           # React Query hooks
    │   └── types/           # Shared TypeScript types
    └── package.json
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/todos` | List all todos |
| `POST` | `/api/todos` | Create a todo |
| `GET` | `/api/todos/:id` | Get a single todo |
| `PATCH` | `/api/todos/:id` | Update title / description / completed |
| `DELETE` | `/api/todos/:id` | Delete a todo (also removes S3 image) |
| `POST` | `/api/todos/:id/image` | Upload image → S3, enqueue SQS job |
| `DELETE` | `/api/todos/:id/image` | Remove image from S3 |

## Image Processing Flow

1. Client uploads an image via `POST /api/todos/:id/image` (max 5 MB, JPEG / PNG / WebP / GIF).
2. API stores the file in S3 under `todos/<id>/<uuid>.<ext>`.
3. Todo `imageStatus` is set to `PENDING`.
4. A message is sent to SQS with `{ todoId, imageKey, bucket }`.
5. A downstream Lambda (or worker) consumes the queue, processes the image, and updates `imageStatus` to `PROCESSED` or `FAILED`.

## Local Setup

### Prerequisites

- Node.js 20+
- MySQL 8 running locally (or via Docker)
- AWS credentials with access to S3 and SQS

### 1. Clone and install

```bash
git clone <repo-url>
cd aws
npm install
```

### 2. Configure environment

```bash
cp api/.env.example api/.env
```

Fill in `api/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173

DATABASE_URL="mysql://root:password@localhost:3306/todos_db"

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

S3_BUCKET_NAME=your-todos-bucket
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/todos-image-processing
```

### 3. Run database migrations

```bash
cd api
npx prisma migrate dev --name init
```

### 4. Start dev servers

```bash
# from the repo root — starts both api and frontend concurrently
npm run dev
```

- API: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## Deployment

### Frontend — AWS Amplify

Connect the repository to AWS Amplify. The `amplify.yml` in the root handles the monorepo build automatically (`appRoot: frontend`).

Add the following environment variable in **Amplify Console → App settings → Environment variables**:

```
VITE_API_URL = https://your-api-url
```

Add a rewrite rule under **Rewrites and redirects** for SPA routing:

| Source | Target | Type |
|---|---|---|
| `/<*>` | `/index.html` | 200 (Rewrite) |

### API — AWS (ECS / Elastic Beanstalk / Lambda)

1. Build the API:
   ```bash
   cd api && npm run build
   ```
2. Set environment variables on the target service (same keys as `.env.example`).
3. Run migrations against the production database before deploying:
   ```bash
   npx prisma migrate deploy
   ```

### S3 Bucket

- Enable CORS so the frontend can display images directly.
- Keep the bucket private; use the generated public URLs or presigned URLs for access.

### SQS Queue

- Create a standard queue named (e.g.) `todos-image-processing`.
- Attach a Lambda or ECS task as the consumer.
- The message body is JSON: `{ "todoId": "...", "imageKey": "...", "bucket": "..." }`.

## Database Schema

```prisma
model Todo {
  id          String      @id @default(cuid())
  title       String
  description String?
  completed   Boolean     @default(false)
  imageUrl    String?
  imageKey    String?
  imageStatus ImageStatus @default(NONE)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

enum ImageStatus {
  NONE
  PENDING
  PROCESSED
  FAILED
}
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start API + frontend in watch mode |
| `npm run build` | Build both packages for production |
| `cd api && npm run db:migrate` | Run Prisma migrations (dev) |
| `cd api && npm run db:studio` | Open Prisma Studio (DB GUI) |
