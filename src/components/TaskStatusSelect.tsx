"use client";

import type { ComponentProps } from "react";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TASK_STATUSES, isTaskStatus, type TaskStatus } from "@/lib/tasks";

type TaskStatusSelectProps = Omit<ComponentProps<typeof NativeSelect>, "value" | "onChange"> & {
  value: TaskStatus;
  onValueChange: (status: TaskStatus) => void;
};

// 選択肢は TASK_STATUSES から作るので、ステータスを追加しても変更は不要
export function TaskStatusSelect({ value, onValueChange, ...props }: TaskStatusSelectProps) {
  return (
    <NativeSelect
      {...props}
      value={value}
      onChange={(event) => {
        const status = event.target.value;
        if (isTaskStatus(status)) onValueChange(status);
      }}
    >
      {TASK_STATUSES.map((status) => (
        <NativeSelectOption key={status.value} value={status.value}>
          {status.label}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
