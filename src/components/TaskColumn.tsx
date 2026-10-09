"use client";

import { useId } from "react";
import { Inbox } from "lucide-react";
import { TaskCard } from "@/components/TaskCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/tasks";

type TaskColumnProps = {
  status: TaskStatus;
  label: string;
  tasks: Task[];
};

// 列ごとのアクセントカラー（ステータスを追加したら型エラーで気づけるよう Record で持つ）
const statusAccents: Record<TaskStatus, { dot: string; bar: string }> = {
  todo: { dot: "bg-sky-500 dark:bg-sky-400", bar: "bg-sky-500/70 dark:bg-sky-400/70" },
  in_progress: {
    dot: "bg-amber-500 dark:bg-amber-400",
    bar: "bg-amber-500/70 dark:bg-amber-400/70",
  },
  done: {
    dot: "bg-emerald-500 dark:bg-emerald-400",
    bar: "bg-emerald-500/70 dark:bg-emerald-400/70",
  },
};

export function TaskColumn({ status, label, tasks }: TaskColumnProps) {
  const headingId = useId();
  const accent = statusAccents[status];

  return (
    <section
      aria-labelledby={headingId}
      className="relative flex flex-col gap-3 overflow-hidden rounded-xl bg-muted/60 p-3 ring-1 ring-foreground/5 dark:bg-muted/30"
    >
      <div aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", accent.bar)} />
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className={cn("size-2 rounded-full", accent.dot)} />
          <h2 id={headingId} className="text-sm font-semibold">
            {label}
          </h2>
        </div>
        <Badge variant="secondary" className="bg-background tabular-nums dark:bg-background/60">
          {tasks.length}件
        </Badge>
      </div>
      {tasks.length === 0 ? (
        <EmptyColumn />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-foreground/15 px-4 py-8 text-muted-foreground">
      <Inbox className="size-5" aria-hidden="true" />
      <p className="text-sm">タスクがありません</p>
    </div>
  );
}
