"use client";

import { useState } from "react";
import { deleteTask, updateTask } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TaskForm } from "@/components/TaskForm";
import { TASK_STATUSES, isTaskStatus, type Task, type TaskInput } from "@/lib/tasks";

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentValues: TaskInput = {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
  };

  async function handleStatusChange(status: string) {
    if (!isTaskStatus(status)) return;
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
      <li className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
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
    <li className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <h3 className="font-medium break-words">{task.title}</h3>
      {task.description && (
        <p className="text-sm whitespace-pre-wrap break-words text-zinc-600 dark:text-zinc-400">
          {task.description}
        </p>
      )}
      <select
        aria-label={`「${task.title}」のステータス`}
        value={task.status}
        onChange={(event) => handleStatusChange(event.target.value)}
        className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-900"
      >
        {TASK_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={`「${task.title}」を編集`}
          onClick={() => setIsEditing(true)}
          className="rounded border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
        >
          編集
        </button>
        <button
          type="button"
          aria-label={`「${task.title}」を削除`}
          onClick={() => setIsConfirmingDelete(true)}
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
        >
          削除
        </button>
      </div>
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
