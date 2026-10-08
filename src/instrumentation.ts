// サーバー起動時に一度だけ呼ばれ、Supabase への接続に失敗した場合のみコンソールに表示する
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    console.error("[Supabase] 環境変数が未設定です (.env.local を確認してください)");
    return;
  }

  try {
    // Auth のヘルスチェックで URL への到達性と API キーの有効性を確認する
    const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: supabasePublishableKey },
    });

    if (!response.ok) {
      console.error(`[Supabase] 接続失敗: HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Supabase] 接続失敗: ${message}`);
  }
}
