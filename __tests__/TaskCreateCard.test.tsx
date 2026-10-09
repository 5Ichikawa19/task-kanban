import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCreateCard } from "@/components/TaskCreateCard";

// Server Action はサーバーへのネットワーク呼び出しなので外部依存としてモックする
const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("@/app/actions", () => mocks);

beforeEach(() => {
  mocks.createTask.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("TaskCreateCard", () => {
  test("「新しいタスク」の見出しと、編集のキャンセルボタンを持たない追加フォームが表示される", () => {
    render(<TaskCreateCard />);

    expect(screen.getByRole("heading", { name: "新しいタスク" })).toBeDefined();
    const form = screen.getByRole("form", { name: "タスクを追加" });
    expect(within(form).queryByRole("button", { name: "キャンセル" })).toBeNull();
  });

  test("タイトルを入力して追加すると、createTask が呼ばれる", async () => {
    const user = userEvent.setup();
    render(<TaskCreateCard />);
    const form = screen.getByRole("form", { name: "タスクを追加" });

    await user.type(within(form).getByLabelText("タイトル"), "新しいタスク");
    await user.click(within(form).getByRole("button", { name: "追加" }));

    expect(mocks.createTask).toHaveBeenCalledWith({
      title: "新しいタスク",
      description: "",
      status: "todo",
    });
  });
});
