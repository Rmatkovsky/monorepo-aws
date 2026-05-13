import client from './client';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '../types';

export const todosApi = {
  list: () => client.get<Todo[]>('/todos').then((r) => r.data),
  get: (id: string) => client.get<Todo>(`/todos/${id}`).then((r) => r.data),
  create: (data: CreateTodoInput) => client.post<Todo>('/todos', data).then((r) => r.data),
  update: (id: string, data: UpdateTodoInput) =>
    client.patch<Todo>(`/todos/${id}`, data).then((r) => r.data),
  remove: (id: string) => client.delete(`/todos/${id}`),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('image', file);
    return client.post<Todo>(`/todos/${id}/image`, form).then((r) => r.data);
  },
  deleteImage: (id: string) => client.delete<Todo>(`/todos/${id}/image`).then((r) => r.data),
};
