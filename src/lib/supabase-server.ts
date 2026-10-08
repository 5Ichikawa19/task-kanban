import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// サーバー専用クライアント。secret key は RLS をバイパスするため、ブラウザに渡るコードから import しないこと
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SECRET_KEY を .env.local に設定してください",
  );
}

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false },
});
