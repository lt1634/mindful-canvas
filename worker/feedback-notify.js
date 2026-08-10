// Cloudflare Worker — Mindful Canvas Feedback → Telegram
// Deploy: wrangler deploy

const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN"; // 問 Tim 攞
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID"; // Tim 嘅 chat ID

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("OK", { status: 200 });
    }

    try {
      const data = await request.json();
      const { time, mode, comment, device } = data;

      const modeLabel = {
        welcome: "意見回饋",
        free: "自由畫布",
        zen: "禪繞唐卡",
        sumi: "墨流畫布",
      };

      const msg = [
        `🪷 *覺知畫布 — 新回饋*`,
        ``,
        `📋 模式：${modeLabel[mode] || mode}`,
        `💬 留言：${comment || "(無)"}`,
        `⏰ 時間：${new Date(time).toLocaleString("zh-Hant", { timeZone: "Asia/Hong_Kong" })}`,
        `📱 裝置：${device || "未知"}`,
      ].join("\n");

      // Send to Telegram
      const tgRes = await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TG_CHAT_ID,
          text: msg,
          parse_mode: "Markdown",
        }),
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) {
        console.error("Telegram error:", tgData);
      }

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ status: "error", message: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
