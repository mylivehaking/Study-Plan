const { createClient } = require('@supabase/supabase-js');

export default async (req, res) => {
  const method = req.method;
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.SUPABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || dbUrl;
  const supabaseKey = process.env.SUPABASE_KEY;
  const apiKey = req.headers['x-api-key'];
  const EXPECTED_API_KEY = process.env.APP_API_KEY || 'today-plan-secret-key';

  console.log(`[Function] Method: ${method} - Path: ${req.url}`);
  console.log(`[Function] Header API Key: ${apiKey}`);

  // بررسی امنیت API - فعلاً غیرفعال برای تست
  // if (apiKey !== EXPECTED_API_KEY) {
  //   console.error(`[Function] Unauthorized: Received "${apiKey}", Expected "${EXPECTED_API_KEY}"`);
  //   return res.status(401).json({ error: "Unauthorized" });
  // }

  if (!supabaseUrl || !supabaseKey) {
    console.error("[Function] Supabase credentials missing");
    console.error("[Function] SUPABASE_URL:", supabaseUrl ? "present" : "missing");
    console.error("[Function] SUPABASE_KEY:", supabaseKey ? "present" : "missing");
    return res.status(500).json({ error: "Supabase credentials missing" });
  }

  console.log(`[Function] Supabase URL present: ${!!supabaseUrl}`);
  console.log(`[Function] Attempting Supabase connection...`);

  const supabase = createClient(supabaseUrl, supabaseKey);
  const DATA_ID = "today_plan_default";

  try {
    console.log(`[Function] Processing ${method} request...`);
    
    if (method === "GET") {
      console.log(`[Function] Executing SELECT query...`);
      const { data, error } = await supabase
        .from('app_data')
        .select('content')
        .eq('id', DATA_ID)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error("[Function] SELECT error:", error);
        throw error;
      }
      
      console.log(`[Function] SELECT result:`, data ? "found" : "not found");
      const content = data ? data.content : null;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      return res.status(200).json(content || {});
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
      
      console.log(`[Function] Content to save:`, JSON.stringify(body).substring(0, 100) + "...");
      
      console.log(`[Function] Executing UPSERT query...`);
      const { data, error } = await supabase
        .from('app_data')
        .upsert({
          id: DATA_ID,
          content: body,
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        console.error("[Function] UPSERT error:", error);
        throw error;
      }
      
      console.log(`[Function] UPSERT completed successfully`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("[Function] Runtime Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
