"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTask, updateTask } from "@/app/actions";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { TASK_STATUSES, isTaskStatus, type Task, type TaskInput } from "@/lib/tasks";

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
        <div className="-mt-1 -mr-1.5 flex shrink-0 gap-0.5 opacity-100 transition-opacity md:opacity-0 md:group-hover/task:opacity-100 md:group-focus-within/task:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`「${task.title}」を編集`}
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`「${task.title}」を削除`}
            onClick={() => setIsConfirmingDelete(true)}
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {task.description && (
        <p className="whitespace-pre-wrap break-words text-muted-foreground">
          {task.description}
        </p>
      )}
      <NativeSelect
        size="sm"
        aria-label={`「${task.title}」のステータス`}
        value={task.status}
        onChange={(event) => handleStatusChange(event.target.value)}
      >
        {TASK_STATUSES.map((status) => (
          <NativeSelectOption key={status.value} value={status.value}>
            {status.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
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
