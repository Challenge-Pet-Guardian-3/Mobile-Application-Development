import React from 'react';
import { TaskFormModal } from '../../../components/TaskFormModal';
import { useHomeData } from '../../../hooks/useHomeData';

interface HomeTaskModalProps {
  taskModal: ReturnType<typeof useHomeData>['taskModal'];
  pets: ReturnType<typeof useHomeData>['pets'];
}

export function HomeTaskModal({ taskModal, pets }: HomeTaskModalProps) {
  const { editingTask, close, isUpdating, initialData, submit } = taskModal;

  return (
    <TaskFormModal
      visible={Boolean(editingTask)}
      onClose={close}
      mode="edit"
      taskId={editingTask?.id}
      pets={pets?.list ?? []}
      isLoading={isUpdating}
      initialData={initialData}
      onSubmit={submit}
    />
  );
}
