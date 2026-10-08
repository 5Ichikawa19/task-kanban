# task-kanban

## 概要
タスク管理カンバン。タスクの追加・編集・削除・一覧表示とステータス管理（Todo / In Progress / Done）ができる。
Next.js + Supabaseで構築し、Vercelにデプロイする。

## 技術スタック
- Next.js  (App router)
- TypeScript
- Supabase (データベース)
- Vitest + Testing Library (テスト)
- Vercel (デプロイ)

## ディレクトリ構成
src/
└ app/			# ページとレイアウト
    ├ page.tsx	# トップページ
    ├ layout.tsx	# 共通レイアウト
    └ globals.css	# グローバルスタイル

## コマンド

```bash
npm run dev        # 開発サーバー (http://localhost:3000)
npm run build      # 本番ビルド
npm run lint       # ESLint (flat config: eslint.config.mjs)
npx tsc --noEmit   # 型チェック

npm test           # Vitest (watch モード)
npm run test:run   # Vitest を1回だけ実行
npx vitest run __tests__/page.test.tsx   # 単一ファイルを実行
npx vitest run -t "テスト名"              # テスト名で絞り込み
```

## 構成

- App Router 構成で、ソースは `src/app/` 配下。パスエイリアス `@/*` → `./src/*`。
- **Tailwind CSS v4 は PostCSS ではなく Turbopack ローダー経由**で読み込んでいる（`next.config.ts` の `turbopack.rules` で `*.css` に `@tailwindcss/turbopack` を適用）。`postcss.config` は存在しない。テーマ変数は `src/app/globals.css` の `@theme inline` で定義。
- `next.config.ts` で `cacheComponents: true` と `partialPrefetching: true` を有効化している。データ取得やキャッシュの書き方はこれらの前提に従うこと（詳細は同梱ドキュメント参照）。
- `LayoutProps<"/">` などのルート型はグローバルに生成される型ヘルパーを使っている（import 不要）。

## テスト

- Vitest + React Testing Library + jsdom（設定: `vitest.config.mts`）。tsconfig のパス解決は Vite ネイティブの `resolve.tsconfigPaths: true` を使用（`vite-tsconfig-paths` プラグインは不要）。
- テストは `__tests__/` に配置。`globals` は無効なので `expect` / `test` などは `vitest` から import し、`afterEach(cleanup)` を明示的に呼ぶ。
- Vitest は `async` Server Component に未対応。そうしたコンポーネントは E2E テストで検証する。

## コーディングルール
- 変更後は必ず `npm test` でテストが通ることを確認してください
- 変更は1つの関心ごとに絞り、小さい単位で行ってください
- 指示された範囲以外のコードを変更しないでください

## コーディング規約
- コンポーネントは関数コンポーネントで記述してください
- 変数名・関数名はキャメルケースで書いてください
- コミットメッセージは日本語で書いてください

## テストルール
- 網羅性: 正常系・異常系・環境値を検討してください
- 可読性: テスト名に条件と期待する結果を明示してください
- 保守性: 実装の内部構造ではなくユーザーから見た振る舞いをテストしてくさい
- 独立性: テスト間で状態を共有しないでください
- 状態遷移: 画面遷移の順方向・逆方向を検討してください
- モック方針: 外部依存のみモック化してください

## 禁止事項
- console.logを本番コードに残さないでください
- 既存のテストを削除しないでください
- any型を使用しないでください

## MCP活用ルール
- Next.js・Supabase・Vitestなどの最新仕様はContext7 MCPを使って公式ドキュメントを確認してください
