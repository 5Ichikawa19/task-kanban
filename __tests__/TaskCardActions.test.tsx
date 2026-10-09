import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskCardActions } from "@/components/TaskCardActions";

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("TaskCardActions", () => {
  test("編集ボタンを押すと onEdit が呼ばれ、onDelete は呼ばれない", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TaskCardActions title="企画書を書く" onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を編集" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  test("削除ボタンを押すと onDelete が呼ばれ、onEdit は呼ばれない", async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(<TaskCardActions title="企画書を書く" onEdit={onEdit} onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "「企画書を書く」を削除" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
