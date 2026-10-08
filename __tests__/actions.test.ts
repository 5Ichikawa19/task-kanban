import { beforeEach, describe, expect, test, vi } from "vitest";
import { createTask, deleteTask, updateTask } from "@/app/actions";
import type { TaskInput } from "@/lib/tasks";

const mocks = vi.hoisted(() => ({
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
  updateTag: vi.fn(),
}));

vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: {
    from: () => ({
      insert: mocks.insert,
      update: mocks.update,
      delete: mocks.delete,
    }),
  },
}));

vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
}));

const validInput: TaskInput = {
  title: "買い物に行く",
  description: "牛乳と卵",
  status: "todo",
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.insert.mockResolvedValue({ error: null });
  mocks.eq.mockResolvedValue({ error: null });
  mocks.update.mockReturnValue({ eq: mocks.eq });
  mocks.delete.mockReturnValue({ eq: mocks.eq });
});

describe("createTask", () => {
  test("正しい入力のとき、前後の空白を除いたタイトルで保存し一覧を更新して成功を返す", async () => {
    const result = await createTask({ ...validInput, title: "  買い物に行く  " });

    expect(result).toEqual({ ok: true });
    expect(mocks.insert).toHaveBeenCalledWith({
      title: "買い物に行く",
      description: "牛乳と卵",
      status: "todo",
    });
    expect(mocks.updateTag).toHaveBeenCalledWith("tasks");
  });

  test("説明が空のとき、説明を null として保存する", async () => {
    await createTask({ ...validInput, description: "   " });

    expect(mocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({ description: null }),
    );
  });

  test.each([
    ["1文字", "a"],
    ["100文字", "a".repeat(100)],
  ])("タイトルが%sのとき、保存に成功する", async (_, title) => {
    const result = await createTask({ ...validInput, title });

    expect(result).toEqual({ ok: true });
  });

  test.each([
    ["空", ""],
    ["空白のみ", "   "],
    ["101文字", "a".repeat(101)],
  ])("タイトルが%sのとき、保存せずにエラーを返す", async (_, title) => {
    const result = await createTask({ ...validInput, title });

    expect(result).toEqual({ ok: false, error: expect.stringContaining("タイトル") });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });

  test("説明が1001文字のとき、保存せずにエラーを返す", async () => {
    const result = await createTask({ ...validInput, description: "a".repeat(1001) });

    expect(result).toEqual({ ok: false, error: expect.stringContaining("説明") });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  test("ステータスが不正な値のとき、保存せずにエラーを返す", async () => {
    const result = await createTask({
      ...validInput,
      status: "archived" as TaskInput["status"],
    });

    expect(result).toEqual({ ok: false, error: expect.stringContaining("ステータス") });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  test("データベースがエラーを返したとき、エラーを返し一覧は更新しない", async () => {
    mocks.insert.mockResolvedValue({ error: { message: "db error" } });

    const result = await createTask(validInput);

    expect(result).toEqual({ ok: false, error: "タスクの追加に失敗しました" });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});

describe("updateTask", () => {
  test("正しい入力のとき、指定したタスクを更新し一覧を更新して成功を返す", async () => {
    const result = await updateTask("task-1", { ...validInput, status: "done" });

    expect(result).toEqual({ ok: true });
    expect(mocks.update).toHaveBeenCalledWith({
      title: "買い物に行く",
      description: "牛乳と卵",
      status: "done",
    });
    expect(mocks.eq).toHaveBeenCalledWith("id", "task-1");
    expect(mocks.updateTag).toHaveBeenCalledWith("tasks");
  });

  test("タイトルが空のとき、更新せずにエラーを返す", async () => {
    const result = await updateTask("task-1", { ...validInput, title: "" });

    expect(result.ok).toBe(false);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  test("データベースがエラーを返したとき、エラーを返し一覧は更新しない", async () => {
    mocks.eq.mockResolvedValue({ error: { message: "db error" } });

    const result = await updateTask("task-1", validInput);

    expect(result).toEqual({ ok: false, error: "タスクの更新に失敗しました" });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});

describe("deleteTask", () => {
  test("指定したタスクを削除し一覧を更新して成功を返す", async () => {
    const result = await deleteTask("task-1");

    expect(result).toEqual({ ok: true });
    expect(mocks.delete).toHaveBeenCalled();
    expect(mocks.eq).toHaveBeenCalledWith("id", "task-1");
    expect(mocks.updateTag).toHaveBeenCalledWith("tasks");
  });

  test("データベースがエラーを返したとき、エラーを返し一覧は更新しない", async () => {
    mocks.eq.mockResolvedValue({ error: { message: "db error" } });

    const result = await deleteTask("task-1");

    expect(result).toEqual({ ok: false, error: "タスクの削除に失敗しました" });
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });
});
