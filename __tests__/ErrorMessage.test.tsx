import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ErrorMessage } from "@/components/ErrorMessage";

afterEach(() => {
  cleanup();
});

describe("ErrorMessage", () => {
  test("メッセージがあるとき、alert として表示される", () => {
    render(<ErrorMessage message="タスクの追加に失敗しました" />);

    expect(screen.getByRole("alert").textContent).toBe("タスクの追加に失敗しました");
  });

  test("メッセージが null のとき、何も表示されない", () => {
    render(<ErrorMessage message={null} />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
