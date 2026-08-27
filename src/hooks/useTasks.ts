import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../services/tasks';
import { queryKeys } from '../lib/queryKeys';
import { TarefaConclusaoRequest, TarefaRequest } from '../types/task';

export function useTasks(page = 0, size = 50) {
  return useQuery({
    queryKey: queryKeys.tasks.list(page, size),
    queryFn: () => TaskService.getTarefas(page, size),
  });
}

export function useUserTasks(userId?: number, page = 0, size = 50) {
  return useQuery({
    queryKey: userId ? queryKeys.tasks.byUser(userId) : ['tasks', 'byUser', 'null'],
    queryFn: () => (userId ? TaskService.getTarefasPorUsuario(userId, page, size) : Promise.reject('User ID nulo')),
    enabled: !!userId,
  });
}

export function useUserPoints(userId?: number) {
  return useQuery({
    queryKey: userId ? queryKeys.tasks.userPoints(userId) : ['tasks', 'userPoints', 'null'],
    queryFn: () => (userId ? TaskService.getPontosUsuario(userId) : Promise.reject('User ID nulo')),
    enabled: !!userId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TarefaRequest) => TaskService.createTarefa(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TarefaRequest }) => TaskService.updateTarefa(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TarefaConclusaoRequest }) =>
      TaskService.concluirTarefa(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => TaskService.deleteTarefa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
