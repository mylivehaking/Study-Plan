const { neon } = require('@neondatabase/serverless');

export default async (req, res) => {
  const method = req.method;
  const dbUrl = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.POSTGRES_URL;
  const apiKey = req.headers['x-api-key'];
  const EXPECTED_API_KEY = process.env.APP_API_KEY || 'today-plan-secret-key';

  console.log(`[Function] Method: ${method} - Path: ${req.url}`);
  console.log(`[Function] Header API Key: ${apiKey}`);

  // بررسی امنیت API - فعلاً غیرفعال برای تست
  // if (apiKey !== EXPECTED_API_KEY) {
  //   console.error(`[Function] Unauthorized: Received "${apiKey}", Expected "${EXPECTED_API_KEY}"`);
  //   return res.status(401).json({ error: "Unauthorized" });
  // }
  // console.warn("[Function] Bypassing 401 for debugging...");

  if (!dbUrl) {
    console.error("[Function] DATABASE_URL is missing");
    return res.status(500).json({ error: "Database URL is missing" });
  }

  console.log(`[Function] DB URL present: ${!!dbUrl}`);
  console.log(`[Function] Attempting database connection...`);

  const sql = neon(dbUrl);
  const DATA_ID = "today_plan_default";

  // جدول app_data باید از قبل در دیتابیس Neon وجود داشته باشد
  // در Neon Console: Tables -> New Table -> نام: app_data
  // ستون‌ها: id (text, primary), content (jsonb), updated_at (timestamp, default: now())

  try {
    console.log(`[Function] Processing ${method} request...`);
    
    if (method === "GET") {
      console.log(`[Function] Executing SELECT query...`);
      const result = await sql`SELECT content FROM app_data WHERE id = ${DATA_ID}`;
      console.log(`[Function] SELECT result:`, result.length, "rows");
      const data = result.length > 0 ? result[0].content : null;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).json(data || {});
    }

    if (method === "POST") {
      console.log(`[Function] Processing POST request...`);
      let body = req.body;
      console.log(`[Function] Raw body type:`, typeof body);
      
      // Handle potential string body from Vercel
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
          console.log(`[Function] Parsed string body successfully`);
        } catch (e) {
          console.error(`[Function] Failed to parse string body:`, e);
          return res.status(400).json({ error: "Invalid JSON" });
        }
      }

      if (!body || typeof body !== 'object') {
        console.error(`[Function] Invalid body format:`, body);
        return res.status(400).json({ error: "Invalid body format" });
      }
      
      const content = JSON.stringify(body);
      console.log(`[Function] Content to save:`, content.substring(0, 100) + "...");
      
      console.log(`[Function] Executing INSERT/UPDATE query...`);
      await sql`
        INSERT INTO app_data (id, content, updated_at)
        VALUES (${DATA_ID}, ${content}, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET content = ${content}, updated_at = CURRENT_TIMESTAMP;
      `;
      console.log(`[Function] INSERT/UPDATE completed successfully`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("[Function] Runtime Error:", error);
    console.error("[Function] Error details:", {
      message: error.message,
      code: error.code,
      severity: error.severity,
      detail: error.detail
    });
    return res.status(500).json({ error: error.message });
  }
};
