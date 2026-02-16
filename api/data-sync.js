const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const method = event.httpMethod;
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  console.log(`[Function] Method: ${method} - Path: ${event.path}`);

  if (!dbUrl) {
    console.error("[Function] DATABASE_URL is missing");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Database URL is missing" })
    };
  }

  const sql = neon(dbUrl);
  const DATA_ID = "today_plan_default";

  // ایجاد جدول
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS app_data (
        id TEXT PRIMARY KEY,
        content JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (e) {
    console.error("[Function] Table Error:", e);
  }

  try {
    if (method === "GET") {
      const result = await sql`SELECT content FROM app_data WHERE id = ${DATA_ID}`;
      const data = result.length > 0 ? result[0].content : null;
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify(data || {})
      };
    }

    if (method === "POST") {
      const body = JSON.parse(event.body);
      await sql`
        INSERT INTO app_data (id, content, updated_at)
        VALUES (${DATA_ID}, ${JSON.stringify(body)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP;
      `;
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (error) {
    console.error("[Function] Runtime Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
