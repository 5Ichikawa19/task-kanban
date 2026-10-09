import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TaskStatusSelect } from "@/components/TaskStatusSelect";

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("TaskStatusSelect", () => {
  test("すべてのステータスが選択肢として表示され、渡した値が選択されている", () => {
    render(<TaskStatusSelect aria-label="ステータス" value="in_progress" onValueChange={vi.fn()} />);
    const select = screen.getByRole<HTMLSelectElement>("combobox", { name: "ステータス" });

    const options = within(select).getAllByRole<HTMLOptionElement>("option");
    expect(options.map((option) => option.textContent)).toEqual(["Todo", "In Progress", "Done"]);
    expect(select.value).toBe("in_progress");
  });

  test("別のステータスを選ぶと、選んだステータスで onValueChange が呼ばれる", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TaskStatusSelect aria-label="ステータス" value="todo" onValueChange={onValueChange} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "ステータス" }), "done");

    expect(onValueChange).toHaveBeenCalledWith("done");
  });
});
