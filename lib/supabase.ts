import { createClient } from "@supabase/supabase-js";

function cleanEnv(value: string | undefined) {
  return (value ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

const supabaseUrl = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_URL
);

const supabaseKey = cleanEnv(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing."
  );
}

if (!supabaseKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing."
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);