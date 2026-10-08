"use client";

import { useId, useState, type FormEvent } from "react";
import {
  DESCRIPTION_MAX_LENGTH,
  TASK_STATUSES,
  TITLE_MAX_LENGTH,
  isTaskStatus,
  type ActionResult,
  type TaskInput,
} from "@/lib/tasks";

type TaskFormProps = {
  label: string;
  submitLabel: string;
  initialValues?: TaskInput;
  resetOnSuccess?: boolean;
  onSubmit: (input: TaskInput) => Promise<ActionResult>;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const emptyValues: TaskInput = { title: "", description: "", status: "todo" };

export function TaskForm({
  label,
  submitLabel,
  initialValues = emptyValues,
  resetOnSuccess = false,
  onSubmit,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const id = useId();
  const [values, setValues] = useState<TaskInput>(initialValues);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setError(null);
    const result = await onSubmit(values);
    setIsPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (resetOnSuccess) setValues(emptyValues);
    onSuccess?.();
  }

  return (
    <form aria-label={label} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-title`} className="text-sm font-medium">
          タイトル
        </label>
        <input
          id={`${id}-title`}
          type="text"
          required
          maxLength={TITLE_MAX_LENGTH}
          value={values.title}
          onChange={(event) => setValues({ ...values, title: event.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-description`} className="text-sm font-medium">
          説明
        </label>
        <textarea
          id={`${id}-description`}
          rows={2}
          maxLength={DESCRIPTION_MAX_LENGTH}
          value={values.description}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-status`} className="text-sm font-medium">
          ステータス
        </label>
        <select
          id={`${id}-status`}
          value={values.status}
          onChange={(event) => {
            const status = event.target.value;
            if (isTaskStatus(status)) setValues({ ...values, status });
          }}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
        >
          {TASK_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
