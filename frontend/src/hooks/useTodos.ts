import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todosApi } from '../api/todos';
import type { CreateTodoInput, UpdateTodoInput } from '../types';

const KEY = ['todos'] as const;

export function useTodos() {
  return useQuery({ queryKey: KEY, queryFn: todosApi.list });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTodoInput) => todosApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoInput }) =>
      todosApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUploadImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => todosApi.uploadImage(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => todosApi.deleteImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
