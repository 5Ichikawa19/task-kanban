import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { TaskBoardSkeleton } from "@/components/TaskBoardSkeleton";

afterEach(() => {
  cleanup();
});

describe("TaskBoardSkeleton", () => {
  test("読み込み中であることが文言で伝わり、列やフォームはまだ表示されない", () => {
    render(<TaskBoardSkeleton />);

    expect(screen.getByText("読み込み中…")).toBeDefined();
    expect(screen.queryByRole("region")).toBeNull();
    expect(screen.queryByRole("form")).toBeNull();
  });
});
