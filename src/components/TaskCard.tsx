"use client";

import { useState } from "react";
import { deleteTask, updateTask } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TaskCardActions } from "@/components/TaskCardActions";
import { TaskForm } from "@/components/TaskForm";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";
import { cn } from "@/lib/utils";
import type { Task, TaskInput, TaskStatus } from "@/lib/tasks";

type TaskCardProps = {
  task: Task;
};

const cardClassName =
  "rounded-xl bg-card p-4 text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10";

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentValues: TaskInput = {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
  };

  async function handleStatusChange(status: TaskStatus) {
    setError(null);
    const result = await updateTask(task.id, { ...currentValues, status });
    if (!result.ok) setError(result.error);
  }

  async function handleDelete() {
    setIsConfirmingDelete(false);
    setError(null);
    const result = await deleteTask(task.id);
    if (!result.ok) setError(result.error);
  }

  if (isEditing) {
    return (
      <li className={cn(cardClassName, "ring-2 ring-ring/40")}>
        <TaskForm
          label="タスクを編集"
          submitLabel="保存"
          initialValues={currentValues}
          onSubmit={(input) => updateTask(task.id, input)}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </li>
    );
  }

  return (
    <li
      className={cn(
        cardClassName,
        "group/task flex flex-col gap-3 transition-shadow hover:shadow-md hover:ring-foreground/20",
      )}
    >
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 font-medium leading-snug break-words">{task.title}</h3>
        <TaskCardActions
          title={task.title}
          onEdit={() => setIsEditing(true)}
          onDelete={() => setIsConfirmingDelete(true)}
        />
      </div>
      {task.description && (
        <p className="whitespace-pre-wrap break-words text-muted-foreground">
          {task.description}
        </p>
      )}
      <TaskStatusSelect
        size="sm"
        aria-label={`「${task.title}」のステータス`}
        value={task.status}
        onValueChange={handleStatusChange}
      />
      <ErrorMessage message={error} />
      {isConfirmingDelete && (
        <ConfirmDialog
          message={`「${task.title}」を削除しますか？`}
          confirmLabel="削除する"
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </li>
  );
}
