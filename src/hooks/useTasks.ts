import { useQuery, useMutation, useQueryClient, skipToken } from '@tanstack/react-query';
import { TaskService } from '../services/tasks';
import { queryKeys } from '../lib/queryKeys';
import { Page } from '../types/api';
import { TarefaConclusaoRequest, TarefaRequest, TarefaResponse } from '../types/task';

export function useTasks(page = 0, size = 50, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tasks.list(page, size),
    queryFn: () => TaskService.getTarefas(page, size),
    enabled,
  });
}

export function useUserTasks(userId?: number, page = 0, size = 50, status = 'ALL') {
  return useQuery({
    queryKey: [...queryKeys.tasks.byUser(userId), status, page, size],
    queryFn: userId
      ? () => TaskService.getTarefasPorUsuario(userId, page, size, status)
      : skipToken,
  });
}

export function useUserPoints(userId?: number) {
  return useQuery({
    queryKey: queryKeys.tasks.userPoints(userId),
    queryFn: userId ? () => TaskService.getPontosUsuario(userId) : skipToken,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: TarefaRequest) => TaskService.createTarefa(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: TarefaConclusaoRequest }) =>
      TaskService.concluirTarefa(id, request),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasksQueries = queryClient.getQueriesData<Page<TarefaResponse>>({
        queryKey: queryKeys.tasks.all,
      });

      queryClient.setQueriesData<Page<TarefaResponse>>(
        { queryKey: queryKeys.tasks.all },
        (old) => {
          if (!old || !old.content) return old;
          return {
            ...old,
            content: old.content.map((task) =>
              task.id === id ? { ...task, status: 'CONCLUIDO' as const } : task
            ),
          };
        }
      );

      return { previousTasksQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}

export function useUncompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, usuarioId }: { id: number; usuarioId: number }) =>
      TaskService.desmarcarTarefa(id, usuarioId),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      const previousTasksQueries = queryClient.getQueriesData<Page<TarefaResponse>>({
        queryKey: queryKeys.tasks.all,
      });

      queryClient.setQueriesData<Page<TarefaResponse>>(
        { queryKey: queryKeys.tasks.all },
        (old) => {
          if (!old || !old.content) return old;
          return {
            ...old,
            content: old.content.map((task) =>
              task.id === id ? { ...task, status: 'PENDENTE' as const, conclusao: null } : task
            ),
          };
        }
      );

      return { previousTasksQueries };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousTasksQueries) {
        context.previousTasksQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.pets.all });
    },
  });
}
