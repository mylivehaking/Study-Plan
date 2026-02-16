const { neon } = require('@neondatabase/serverless');

export default async (req, res) => {
  const method = req.method;
  const dbUrl = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  console.log(`[Function] Method: ${method} - Path: ${req.url}`);

  if (!dbUrl) {
    console.error("[Function] DATABASE_URL is missing");
    return res.status(500).json({ error: "Database URL is missing" });
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
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).json(data || {});
    }

    if (method === "POST") {
      const body = req.body;
      await sql`
        INSERT INTO app_data (id, content, updated_at)
        VALUES (${DATA_ID}, ${JSON.stringify(body)}::jsonb, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET content = EXCLUDED.content, updated_at = CURRENT_TIMESTAMP;
      `;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("[Function] Runtime Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
