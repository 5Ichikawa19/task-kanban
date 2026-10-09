"use client";

import { TaskColumn } from "@/components/TaskColumn";
import { TaskCreateCard } from "@/components/TaskCreateCard";
import { TASK_STATUSES, type Task } from "@/lib/tasks";

type TaskBoardProps = {
  tasks: Task[];
};

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="flex flex-col gap-8">
      <TaskCreateCard />
      <div className="grid items-start gap-4 md:grid-cols-3">
        {TASK_STATUSES.map((status) => (
          <TaskColumn
            key={status.value}
            status={status.value}
            label={status.label}
            tasks={tasks.filter((task) => task.status === status.value)}
          />
        ))}
      </div>
    </div>
  );
}
