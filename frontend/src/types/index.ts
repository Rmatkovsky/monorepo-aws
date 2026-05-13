export type ImageStatus = 'NONE' | 'PENDING' | 'PROCESSED' | 'FAILED';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  imageUrl: string | null;
  imageKey: string | null;
  imageStatus: ImageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}
