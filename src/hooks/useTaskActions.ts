import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useSession } from './useSession';
import { useCompleteTask, useUncompleteTask, useUpdateTask, useDeleteTask } from './useTasks';
import { TarefaResponse, TaskFormData } from '../types/task';
import { TaskSchema, formatZodError } from '../utils/schemas';
import { getApiErrorMessage } from '../utils/apiError';
import { normalizarPrazoParaIso } from '../utils/petUtils';

export interface ActionCallbacks {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export interface AlternarStatusOptions extends ActionCallbacks {
  onExpired?: (tarefa: TarefaResponse) => void;
}

/**
 * Hook de domínio reutilizável para centralizar o ciclo de vida e mutações de tarefas,
 * encapsulando validações com Zod, checagem de sessão, confirmações nativas e tratamento de erros.
 */
export function useTaskActions() {
  const { user } = useSession();

  const completeTaskMutation = useCompleteTask();
  const uncompleteTaskMutation = useUncompleteTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const alternarStatus = useCallback(
    (taskId: number, tarefas: TarefaResponse[], options?: AlternarStatusOptions) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para atualizar tarefas.');
        return;
      }

      const tarefa = tarefas.find((t) => t.id === taskId);
      if (!tarefa) return;

      if (tarefa.status === 'CONCLUIDO') {
        uncompleteTaskMutation.mutate(
          { id: taskId, usuarioId: user.id },
          {
            onSuccess: options?.onSuccess,
            onError: (err) => {
              Alert.alert('Erro ao Desmarcar', getApiErrorMessage(err, 'Não foi possível desmarcar a tarefa.'));
              options?.onError?.(err);
            },
          }
        );
      } else if (tarefa.status === 'EXPIRADO') {
        if (options?.onExpired) {
          options.onExpired(tarefa);
        } else {
          Alert.alert(
            'Tarefa Expirada',
            'Esta tarefa já expirou e não pode ser concluída diretamente. Para reativá-la como pendente, clique no lápis de edição e defina uma nova data e horário futuro.',
            [{ text: 'Entendi' }]
          );
        }
      } else {
        completeTaskMutation.mutate(
          {
            id: taskId,
            request: { concluinteId: user.id },
          },
          {
            onSuccess: options?.onSuccess,
            onError: (err) => {
              Alert.alert('Erro ao Concluir', getApiErrorMessage(err, 'Não foi possível concluir a tarefa.'));
              options?.onError?.(err);
            },
          }
        );
      }
    },
    [user, completeTaskMutation, uncompleteTaskMutation]
  );

  const excluirComConfirmacao = useCallback(
    (taskId: number, callbacks?: ActionCallbacks) => {
      Alert.alert('Remover Tarefa', 'Deseja realmente remover esta rotina?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            deleteTaskMutation.mutate(taskId, {
              onSuccess: callbacks?.onSuccess,
              onError: (err) => {
                Alert.alert('Erro ao Excluir', getApiErrorMessage(err, 'Não foi possível excluir a tarefa.'));
                callbacks?.onError?.(err);
              },
            });
          },
        },
      ]);
    },
    [deleteTaskMutation]
  );

  const atualizar = useCallback(
    (taskId: number, data: TaskFormData, callbacks?: ActionCallbacks) => {
      if (!user) {
        Alert.alert('Sessão expirada', 'Faça login novamente para atualizar uma tarefa.');
        return;
      }

      const validacao = TaskSchema.safeParse(data);
      if (!validacao.success) {
        Alert.alert('Dados da Tarefa', formatZodError(validacao.error));
        return;
      }

      const statusFinal = data.status || 'PENDENTE';
      const prazoIso = normalizarPrazoParaIso(data.prazo);
      const conclusaoIso =
        statusFinal === 'CONCLUIDO'
          ? (data.conclusao ? normalizarPrazoParaIso(data.conclusao, '12:00:00') : new Date().toISOString().slice(0, 19))
          : null;

      updateTaskMutation.mutate(
        {
          id: taskId,
          data: {
            titulo: data.titulo.trim(),
            descricao: data.descricao.trim(),
            pontosTarefa: Number(data.pontos),
            prazo: prazoIso,
            usuarioId: user.id,
            petId: data.petId,
            status: statusFinal,
            conclusao: conclusaoIso,
          },
        },
        {
          onSuccess: callbacks?.onSuccess,
          onError: (err) => {
            Alert.alert('Erro ao Atualizar', getApiErrorMessage(err, 'Não foi possível atualizar a tarefa.'));
            callbacks?.onError?.(err);
          },
        }
      );
    },
    [user, updateTaskMutation]
  );

  return {
    alternarStatus,
    excluirComConfirmacao,
    atualizar,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
    isUncompleting: uncompleteTaskMutation.isPending,
    isPending:
      completeTaskMutation.isPending ||
      uncompleteTaskMutation.isPending ||
      updateTaskMutation.isPending ||
      deleteTaskMutation.isPending,
  };
}
