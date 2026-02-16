import { neon } from '@neondatabase/serverless';

export default async (req, context) => {
  const method = req.method;
  const dbUrl = Deno.env.get("DATABASE_URL");
  
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: "DATABASE_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(dbUrl);

  // ایجاد جدول اگر وجود نداشته باشد (برای شروع سریع)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS app_data (
        id TEXT PRIMARY KEY,
        content JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (e) {
    console.error("Error creating table:", e);
  }

  const DATA_ID = "today_plan_default";

  try {
    if (method === "GET") {
      const result = await sql`SELECT content FROM app_data WHERE id = ${DATA_ID}`;
      const data = result.length > 0 ? result[0].content : null;
      
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      const body = await req.json();
      
      await sql`
        INSERT INTO app_data (id, content, updated_at)
        VALUES (${DATA_ID}, ${JSON.stringify(body)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP;
      `;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (error) {
    console.error("DB Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/data",
};
