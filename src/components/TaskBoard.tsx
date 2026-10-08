"use client";

import { useId } from "react";
import { createTask } from "@/app/actions";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { TASK_STATUSES, type Task } from "@/lib/tasks";

type TaskBoardProps = {
  tasks: Task[];
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
        <h2 className="mb-3 text-lg font-semibold">新しいタスク</h2>
        <TaskForm label="タスクを追加" submitLabel="追加" resetOnSuccess onSubmit={createTask} />
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <TaskColumn
            key={status.value}
            label={status.label}
            tasks={tasks.filter((task) => task.status === status.value)}
          />
        ))}
      </div>
    </div>
  );
}

type TaskColumnProps = {
  label: string;
  tasks: Task[];
};

function TaskColumn({ label, tasks }: TaskColumnProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800"
    >
      <div className="flex items-center justify-between">
        <h2 id={headingId} className="font-semibold">
          {label}
        </h2>
        <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-sm font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
          {tasks.length}件
        </span>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-500">タスクがありません</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}
