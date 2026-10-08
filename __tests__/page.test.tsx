import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import Page from "@/app/page";

// タスク一覧の取得部分（async Server Component）は Vitest では検証できないため、Supabase をモックして見出しのみ確認する
vi.mock("@/lib/supabase-server", () => ({
  supabaseServer: {},
}));

afterEach(() => {
  cleanup();
});

test("ホームページに見出しが表示される", () => {
  render(<Page />);
  expect(
    screen.getByRole("heading", { level: 1, name: "タスクカンバン" }),
  ).toBeDefined();
});
