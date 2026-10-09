"use client";

import { useId, useState, type FormEvent } from "react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
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

  // 幅の広い場所（追加フォーム）ではタイトルとステータスを横に並べる
  return (
    <form aria-label={label} onSubmit={handleSubmit} className="@container">
      <div className="grid gap-4 @xl:grid-cols-[1fr_12rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-title`}>タイトル</Label>
          <Input
            id={`${id}-title`}
            type="text"
            required
            maxLength={TITLE_MAX_LENGTH}
            placeholder="やることを入力"
            value={values.title}
            onChange={(event) => setValues({ ...values, title: event.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-status`}>ステータス</Label>
          <TaskStatusSelect
            id={`${id}-status`}
            className="w-full"
            value={values.status}
            onValueChange={(status) => setValues({ ...values, status })}
          />
        </div>
        <div className="flex flex-col gap-2 @xl:col-span-2">
          <Label htmlFor={`${id}-description`}>説明</Label>
          <Textarea
            id={`${id}-description`}
            rows={2}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder="詳細（任意）"
            value={values.description}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
          />
        </div>
      </div>
      <ErrorMessage message={error} className="mt-3" />
      <div className="mt-4 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            キャンセル
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
