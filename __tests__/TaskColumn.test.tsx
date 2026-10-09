import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { TaskColumn } from "@/components/TaskColumn";
import type { Task } from "@/lib/tasks";

// カード内の操作が Server Action を import するため、外部依存としてモックする
vi.mock("@/app/actions", () => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

const task: Task = {
  id: "1",
  title: "企画書を書く",
  description: null,
  status: "todo",
  createdAt: "2026-10-01T00:00:00Z",
};

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("TaskColumn", () => {
  test("ステータス名を見出しにした列として、件数とタスクが表示される", () => {
    render(
      <TaskColumn
        status="todo"
        label="Todo"
        tasks={[task, { ...task, id: "2", title: "資料を印刷" }]}
      />,
    );
    const column = screen.getByRole("region", { name: "Todo" });

    expect(within(column).getByRole("heading", { level: 2 }).textContent).toBe("Todo");
    expect(within(column).getByText("2件")).toBeDefined();
    expect(within(column).getAllByRole("listitem")).toHaveLength(2);
    expect(within(column).queryByText("タスクがありません")).toBeNull();
  });

  test("タスクがないとき、0件と「タスクがありません」が表示され、一覧は表示されない", () => {
    render(<TaskColumn status="done" label="Done" tasks={[]} />);
    const column = screen.getByRole("region", { name: "Done" });

    expect(within(column).getByText("0件")).toBeDefined();
    expect(within(column).getByText("タスクがありません")).toBeDefined();
    expect(within(column).queryByRole("list")).toBeNull();
  });
});
