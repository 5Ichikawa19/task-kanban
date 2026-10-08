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
├ app/			# ページとレイアウト
│  ├ page.tsx	# トップページ（カンバン。一覧取得は async の TaskBoardLoader）
│  ├ actions.ts	# タスクの追加・更新・削除の Server Action
│  ├ layout.tsx	# 共通レイアウト
│  └ globals.css	# グローバルスタイル
├ components/		# クライアントコンポーネント（TaskBoard / TaskCard / TaskForm / ConfirmDialog）
├ lib/
│  ├ supabase.ts	# Supabase クライアント（publishable key）
│  ├ supabase-server.ts	# サーバー専用 Supabase クライアント（secret key）
│  ├ database.types.ts	# Supabase MCP で生成した DB の型
│  ├ tasks.ts	# タスクの型・ステータス定数・入力制限（クライアントとサーバーで共用）
│  └ task-queries.ts	# タスク一覧の取得（サーバー専用、'use cache'）
└ instrumentation.ts	# サーバー起動時の Supabase 接続チェック

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

## Supabase

- プロジェクト: `task-kanban`（project ref: `fmvvwvwlctbyjmsdnixv`、リージョン: `ap-northeast-1`）。スキーマ確認・マイグレーション・型生成は Supabase MCP で行う。
- 環境変数（キー名は `.env.example`、実際の値は `.env.local`。`.env.local` はコミットしない）:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` … 新しい形式の publishable key（`sb_publishable_...`）。旧形式の anon key（`NEXT_PUBLIC_SUPABASE_ANON_KEY`）は使わない。
  - `SUPABASE_SECRET_KEY` … secret key（`sb_secret_...`）。RLS をバイパスするサーバー専用のキー。`NEXT_PUBLIC_` を付けず、`@/lib/supabase-server` 以外では参照しない。
    - MCP では取得できないので、ダッシュボードの Project Settings → API Keys から取得する。
    - 未設定だと `supabase-server.ts` の読み込み時に例外が出て、トップページが 500 になる。
- クライアントは `@supabase/supabase-js` の `createClient` で作った `supabase`（`@/lib/supabase`）を使う。新しいクライアントを作らず、これを import する。環境変数が未設定ならモジュール読み込み時に例外を投げる。
  - `@supabase/ssr` は未導入（Cookie を使う認証は未対応）。認証を追加するときに導入を検討する。
- `src/instrumentation.ts` の `register()` がサーバー起動時に一度だけ接続を確認する。失敗したときだけ `console.error` で `[Supabase] ...` を出し、成功時は何も出さない。
  - 確認には `/auth/v1/health` を使う（publishable key では `/rest/v1/` のルートが 401 になるため）。わかるのは「URL に届くか」と「キーが有効か」までで、DB のテーブルへのアクセスは確かめない。
- publishable key はブラウザにも公開される前提のキー。テーブルを作るときは RLS を有効にし、ポリシーでアクセスを制御する。
- **tasks テーブル**: `id`(uuid) / `title`(1〜100文字) / `description`(null 可, 1000文字以内) / `status`('todo' | 'in_progress' | 'done') / `created_at` / `updated_at`（トリガーで自動更新）。
  - RLS は有効、ポリシーはなし。権限は `service_role` にだけ CRUD を GRANT しているので、tasks の読み書きは必ずサーバー側の `supabaseServer`（Server Action / Server Component）から行う。publishable key からは permission denied になる。
  - このプロジェクトでは、新しいテーブルを作っても `service_role` に CRUD 権限が自動では付かない。テーブルを追加するときは、マイグレーションで明示的に GRANT する。
  - 適用済みのマイグレーション: `create_tasks_table`（テーブル・インデックス・RLS・`set_updated_at` トリガー）、`grant_tasks_to_service_role`。
  - スキーマ変更は MCP の `apply_migration` で行い、手順は次のとおり。
    1. 変更前に `list_tables` で現状を確認する
    2. 適用後に `get_advisors`（security）を確認する。`rls_enabled_no_policy` の INFO は意図どおり
    3. `generate_typescript_types` で `src/lib/database.types.ts` を再生成する
  - 関数を作るときは `set search_path = ''` を付ける（advisor の警告対策）。
  - 権限確認は `execute_sql` で行う。`begin; set local role service_role; ...; rollback;` とすれば、データを残さずに確かめられる。
- **一覧への反映**: `getTasks()` は `'use cache'` + `cacheTag("tasks")` で取得する。Server Action は成功時に `updateTag("tasks")` を呼ぶ。これで同じ往復の中でページが再描画され、リロードなしで一覧に反映される。
  - 入力チェックは `src/app/actions.ts` のサーバー側で必ず行う。上限値は `@/lib/tasks` の定数を使う。
- **テストでのモック**:
  - Server Action のテストでは `@/lib/supabase-server` と `next/cache` をモックする
  - UI のテストでは Server Action（`@/app/actions`）を外部依存（サーバー呼び出し）としてモックする
  - publishable key を使うコードのテストでは `@/lib/supabase` をモックする

## タスク機能の構成

- **データの流れ**:
  - 表示: `page.tsx` の `TaskBoardLoader`（async、`<Suspense>` 内）→ `getTasks()` → `TaskBoard`（client）→ 列ごとの `TaskColumn` → `TaskCard`
  - 変更: `TaskForm` / `TaskCard` → Server Action（`createTask` / `updateTask(id, input)` / `deleteTask(id)`）→ `updateTag("tasks")` → 再描画
- **サーバー専用とクライアント共用の分離**:
  - `"use client"` のコンポーネントから import してよいのは `@/lib/tasks`（型・定数）と `@/app/actions` だけ
  - `@/lib/supabase-server` と `@/lib/task-queries` はサーバー専用。client から import すると secret key を使うモジュールがバンドルに入るので禁止
- **Server Action の戻り値**: 例外を投げずに `ActionResult`（`{ ok: true } | { ok: false, error: string }`）を返す。UI は `error` を `role="alert"` で表示する。
  - エラーメッセージは日本語で書き、DB の生のエラーは画面に出さない
- **DB の行とアプリの型**: DB は snake_case（`created_at`）、アプリの `Task` 型は camelCase（`createdAt`）。変換は `getTasks()` で行い、想定外の status の行は除外する。
- **ステータスを追加・変更するとき**: 次の2か所を必ずそろえる。表示する列・ラベル・件数・選択肢は `TASK_STATUSES` から自動で作られる。
  - `@/lib/tasks` の `TASK_STATUSES`
  - DB の `tasks.status` の check 制約（マイグレーション）
- **UI の決まりごと**:
  - 列見出し（`h2`）にはステータス名だけを入れる。件数バッジ（`n件`）は `h2` の外に置く。列の名前（region 名）がテストで使われているため
  - 削除などの取り消せない操作は、`ConfirmDialog` で確認してから実行する
  - スタイルは Tailwind で、`dark:` のスタイルも付ける

## テスト

- Vitest + React Testing Library + jsdom（設定: `vitest.config.mts`）。tsconfig のパス解決は Vite ネイティブの `resolve.tsconfigPaths: true` を使用（`vite-tsconfig-paths` プラグインは不要）。
- テストは `__tests__/` に配置。`globals` は無効なので `expect` / `test` などは `vitest` から import し、`afterEach(cleanup)` を明示的に呼ぶ。
- Vitest は `async` Server Component に未対応。そうしたコンポーネントは E2E テストで検証する。
  - `page.test.tsx` は `@/lib/supabase-server` をモックし、見出しだけを確認している
- **テストファイル**:
  - `actions.test.ts`: Server Action の入力チェック・境界値・DB エラー
  - `TaskBoard.test.tsx`: 一覧・件数・追加・編集・ステータス変更・削除の画面操作
  - `page.test.tsx`: トップページ
- **進め方**: 機能追加はテストを先に書き、失敗することを確認してから実装する（TDD）。
- **UI テストの書き方**:
  - 操作は `@testing-library/user-event`（`userEvent.setup()`）で行う
  - 要素はロールとアクセシブルな名前で取得する。主な名前:
    - 列: `getByRole("region", { name: "Todo" })`
    - フォーム: `getByRole("form", { name: "タスクを追加" | "タスクを編集" })`
    - カードのボタン: `「{title}」を編集` / `「{title}」を削除`
    - ステータス選択: `「{title}」のステータス`
    - 削除の確認: `getByRole("alertdialog")`
    - エラー: `getByRole("alert")`
  - UI を変えるときも、これらの名前は保つ
  - モックは `vi.hoisted` で作り、`vi.mock` に渡す。毎回 `vi.resetAllMocks()` で状態を戻す

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
