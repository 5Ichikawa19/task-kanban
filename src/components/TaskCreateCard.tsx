"use client";

import { Plus } from "lucide-react";
import { createTask } from "@/app/actions";
import { TaskForm } from "@/components/TaskForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TaskCreateCard() {
  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Plus className="size-4" aria-hidden="true" />
          </span>
          <h2>新しいタスク</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm label="タスクを追加" submitLabel="追加" resetOnSuccess onSubmit={createTask} />
      </CardContent>
    </Card>
  );
}
