import { neon } from '@netlify/neon';

export default async (req, context) => {
  const method = req.method;
  
  // دیتابیس نتلیفای به طور خودکار از NETLIFY_DATABASE_URL استفاده می‌کند
  const sql = neon();

  // ایجاد جدول اگر وجود نداشته باشد
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
      console.log("Fetching data for ID:", DATA_ID);
      const result = await sql`SELECT content FROM app_data WHERE id = ${DATA_ID}`;
      console.log("DB Result:", JSON.stringify(result));
      
      const data = result.length > 0 ? result[0].content : null;
      
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "no-cache" 
        },
      });
    }

    if (method === "POST") {
      const body = await req.json();
      console.log("Saving data for ID:", DATA_ID);
      
      await sql`
        INSERT INTO app_data (id, content, updated_at)
        VALUES (${DATA_ID}, ${JSON.stringify(body)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP;
      `;
      console.log("Data saved successfully");

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
