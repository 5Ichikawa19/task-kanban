export const TASK_STATUSES = [
  { value: "todo", label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
};

export type TaskInput = {
  title: string;
  description: string;
  status: TaskStatus;
};

export type ActionResult = { ok: true } | { ok: false; error: string };

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 1000;

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.some((status) => status.value === value);
}
