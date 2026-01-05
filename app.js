// اول کلاینت رو بساز
const SUPABASE_URL = "https://ybriihvekjhzrbrnvpyq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tyAGKGzwzxfoiMZMjtK3ww_bey6DEcT";
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ساخت جدول study_plan با RPC
async function createStudyPlanTable() {
  const { data, error } = await client.rpc('exec_sql', {
    sql: `
      create table if not exists study_plan (
        id uuid primary key default gen_random_uuid(),
        user_id uuid references auth.users(id) on delete cascade,
        date date not null,
        subject text not null,
        topic text not null,
        is_completed boolean default false,
        created_at timestamp default now()
      );
    `
  });

  if (error) {
    console.error("Error creating table:", error);
  } else {
    console.log("Table created:", data);
  }
}

createStudyPlanTable();
