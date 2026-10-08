import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskBoard } from "@/components/TaskBoard";
import type { Task } from "@/lib/tasks";

// Server Action はサーバーへのネットワーク呼び出しなので外部依存としてモックする
const mocks = vi.hoisted(() => ({
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("@/app/actions", () => mocks);

const tasks: Task[] = [
  {
    id: "1",
    title: "企画書を書く",
    description: "来週の会議用",
    status: "todo",
    createdAt: "2026-10-01T00:00:00Z",
  },
  {
    id: "2",
    title: "レビュー対応",
    description: null,
    status: "in_progress",
    createdAt: "2026-10-02T00:00:00Z",
  },
];

function getColumn(name: string) {
  return screen.getByRole("region", { name });
}

beforeEach(() => {
  mocks.createTask.mockResolvedValue({ ok: true });
  mocks.updateTask.mockResolvedValue({ ok: true });
  mocks.deleteTask.mockResolvedValue({ ok: true });
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("一覧表示", () => {
  test("タスクがあるとき、ステータスに対応する列に表示される", () => {
    render(<TaskBoard tasks={tasks} />);

    expect(within(getColumn("Todo")).getByText("企画書を書く")).toBeDefined();
    expect(within(getColumn("Todo")).getByText("来週の会議用")).toBeDefined();
    expect(within(getColumn("In Progress")).getByText("レビュー対応")).toBeDefined();
  });

  test("タスクがない列には「タスクがありません」と表示される", () => {
    render(<TaskBoard tasks={tasks} />);

    expect(within(getColumn("Done")).getByText("タスクがありません")).toBeDefined();
    expect(within(getColumn("Todo")).queryByText("タスクがありません")).toBeNull();
  });

  test("タスクが0件のとき、すべての列に「タスクがありません」と表示される", () => {
    render(<TaskBoard tasks={[]} />);

    expect(screen.getAllByText("タスクがありません")).toHaveLength(3);
  });

  test("新しいタスク一覧で再描画されたとき、一覧に反映される", () => {
    const { rerender } = render(<TaskBoard tasks={tasks} />);

    rerender(
      <TaskBoard
        tasks={[...tasks.slice(1), { ...tasks[0], id: "3", title: "新しいタスク", status: "done" }]}
      />,
    );

    expect(screen.queryByText("企画書を書く")).toBeNull();
    expect(within(getColumn("Done")).getByText("新しいタスク")).toBeDefined();
  });
});

describe("件数表示", () => {
  test("各列に、その列のタスク件数が表示される", () => {
    render(
      <TaskBoard
        tasks={[...tasks, { ...tasks[0], id: "3", title: "資料を印刷", status: "todo" }]}
      />,
    );

    expect(within(getColumn("Todo")).getByText("2件")).toBeDefined();
    expect(within(getColumn("In Progress")).getByText("1件")).toBeDefined();
  });

  test("タスクがない列には0件と表示される", () => {
    render(<TaskBoard tasks={tasks} />);

    expect(within(getColumn("Done")).getByText("0件")).toBeDefined();
  });

  test("タスクのステータスが変わった一覧で再描画されたとき、件数が更新される", () => {
    const { rerender } = render(<TaskBoard tasks={tasks} />);

    rerender(<TaskBoard tasks={[{ ...tasks[0], status: "done" }, tasks[1]]} />);

    expect(within(getColumn("Todo")).getByText("0件")).toBeDefined();
    expect(within(getColumn("Done")).getByText("1件")).toBeDefined();
  });
});

describe("追加", () => {
  test("タイトルと説明を入力して追加すると、入力内容で追加され入力欄が空になる", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={[]} />);
    const form = screen.getByRole("form", { name: "タスクを追加" });

    await user.type(within(form).getByLabelText("タイトル"), "新しいタスク");
    await user.type(within(form).getByLabelText("説明"), "詳細");
    await user.click(within(form).getByRole("button", { name: "追加" }));

    expect(mocks.createTask).toHaveBeenCalledWith({
      title: "新しいタスク",
      description: "詳細",
      status: "todo",
    });
    expect(within(form).getByLabelText<HTMLInputElement>("タイトル").value).toBe("");
    expect(within(form).getByLabelText<HTMLTextAreaElement>("説明").value).toBe("");
  });

  test("ステータスを選んで追加すると、選んだステータスで追加される", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={[]} />);
    const form = screen.getByRole("form", { name: "タスクを追加" });

    await user.type(within(form).getByLabelText("タイトル"), "途中のタスク");
    await user.selectOptions(within(form).getByLabelText("ステータス"), "in_progress");
    await user.click(within(form).getByRole("button", { name: "追加" }));

    expect(mocks.createTask).toHaveBeenCalledWith(
      expect.objectContaining({ status: "in_progress" }),
    );
  });

  test("追加に失敗したとき、エラーメッセージが表示され入力内容が残る", async () => {
    mocks.createTask.mockResolvedValue({ ok: false, error: "タスクの追加に失敗しました" });
    const user = userEvent.setup();
    render(<TaskBoard tasks={[]} />);
    const form = screen.getByRole("form", { name: "タスクを追加" });

    await user.type(within(form).getByLabelText("タイトル"), "新しいタスク");
    await user.click(within(form).getByRole("button", { name: "追加" }));

    expect(within(form).getByRole("alert").textContent).toBe("タスクの追加に失敗しました");
    expect(within(form).getByLabelText<HTMLInputElement>("タイトル").value).toBe("新しいタスク");
  });
});

describe("編集", () => {
  test("編集ボタンを押すと、現在の値が入った編集フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を編集" }));

    const form = screen.getByRole("form", { name: "タスクを編集" });
    expect(within(form).getByLabelText<HTMLInputElement>("タイトル").value).toBe("企画書を書く");
    expect(within(form).getByLabelText<HTMLTextAreaElement>("説明").value).toBe("来週の会議用");
    expect(within(form).getByLabelText<HTMLSelectElement>("ステータス").value).toBe("todo");
  });

  test("内容を変更して保存すると、変更内容で更新され表示に戻る", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を編集" }));
    const form = screen.getByRole("form", { name: "タスクを編集" });
    const titleInput = within(form).getByLabelText("タイトル");
    await user.clear(titleInput);
    await user.type(titleInput, "企画書を仕上げる");
    await user.click(within(form).getByRole("button", { name: "保存" }));

    expect(mocks.updateTask).toHaveBeenCalledWith("1", {
      title: "企画書を仕上げる",
      description: "来週の会議用",
      status: "todo",
    });
    expect(screen.queryByRole("form", { name: "タスクを編集" })).toBeNull();
  });

  test("キャンセルを押すと、更新せずに元の表示に戻る", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を編集" }));
    const form = screen.getByRole("form", { name: "タスクを編集" });
    await user.type(within(form).getByLabelText("タイトル"), "変更");
    await user.click(within(form).getByRole("button", { name: "キャンセル" }));

    expect(mocks.updateTask).not.toHaveBeenCalled();
    expect(screen.queryByRole("form", { name: "タスクを編集" })).toBeNull();
    expect(screen.getByText("企画書を書く")).toBeDefined();
  });

  test("保存に失敗したとき、エラーメッセージが表示され編集フォームが残る", async () => {
    mocks.updateTask.mockResolvedValue({ ok: false, error: "タスクの更新に失敗しました" });
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を編集" }));
    const form = screen.getByRole("form", { name: "タスクを編集" });
    await user.click(within(form).getByRole("button", { name: "保存" }));

    expect(within(form).getByRole("alert").textContent).toBe("タスクの更新に失敗しました");
    expect(screen.getByRole("form", { name: "タスクを編集" })).toBeDefined();
  });
});

describe("ステータス変更", () => {
  test("カードのステータスを変更すると、新しいステータスで更新される", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "「企画書を書く」のステータス" }),
      "done",
    );

    expect(mocks.updateTask).toHaveBeenCalledWith("1", {
      title: "企画書を書く",
      description: "来週の会議用",
      status: "done",
    });
  });

  test("ステータス変更に失敗したとき、エラーメッセージが表示される", async () => {
    mocks.updateTask.mockResolvedValue({ ok: false, error: "タスクの更新に失敗しました" });
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "「企画書を書く」のステータス" }),
      "done",
    );

    expect(screen.getByRole("alert").textContent).toBe("タスクの更新に失敗しました");
  });
});

describe("削除", () => {
  test("削除ボタンを押すと、タスク名を含む確認ダイアログが表示され、まだ削除されない", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));

    const dialog = screen.getByRole("alertdialog");
    expect(within(dialog).getByText("「企画書を書く」を削除しますか？")).toBeDefined();
    expect(mocks.deleteTask).not.toHaveBeenCalled();
  });

  test("確認ダイアログで「削除する」を押すと、タスクが削除されダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(mocks.deleteTask).toHaveBeenCalledWith("1");
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("確認ダイアログで「キャンセル」を押すと、削除されずにダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));
    await user.click(
      within(screen.getByRole("alertdialog")).getByRole("button", { name: "キャンセル" }),
    );

    expect(mocks.deleteTask).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(screen.getByText("企画書を書く")).toBeDefined();
  });

  test("確認ダイアログでEscキーを押すと、削除されずにダイアログが閉じる", async () => {
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));
    await user.keyboard("{Escape}");

    expect(mocks.deleteTask).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).toBeNull();
  });

  test("削除に失敗したとき、エラーメッセージが表示される", async () => {
    mocks.deleteTask.mockResolvedValue({ ok: false, error: "タスクの削除に失敗しました" });
    const user = userEvent.setup();
    render(<TaskBoard tasks={tasks} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(screen.getByRole("alert").textContent).toBe("タスクの削除に失敗しました");
  });
});
