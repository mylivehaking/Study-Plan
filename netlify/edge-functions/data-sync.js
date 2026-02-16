import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("user_data");
  const method = req.method;

  // برای تست ساده، از یک کلید ثابت استفاده می‌کنیم
  // در آینده می‌توان بر اساس User ID (اگر Auth اضافه شود) تفکیک کرد
  const DATA_KEY = "today_plan_data";

  try {
    if (method === "GET") {
      const data = await store.get(DATA_KEY, { type: "json" });
      return new Response(JSON.stringify(data || {}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (method === "POST") {
      const body = await req.json();
      await store.setJSON(DATA_KEY, body);
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/data",
};
