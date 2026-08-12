// Vercel Serverless Function — Feedback → Telegram
// Deploy: vercel --prod

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({ status: "ok" });
  }

  try {
    // Parse body explicitly
    let body = req.body;
    if (!body || typeof body === "string") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }

    const { time, mode, comment, device } = body;

    const modeLabel = {
      welcome: "意見回饋",
      free: "自由畫布",
      zen: "禪繞唐卡",
      sumi: "墨流畫布",
    };

    // Escape HTML to prevent Telegram parse errors
    const esc = (s) =>
      String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const msg = [
      `🪷 <b>覺知畫布 — 新回饋</b>`,
      ``,
      `📋 模式：${esc(modeLabel[mode] || mode)}`,
      `💬 留言：${esc(comment || "(無)")}`,
      `⏰ 時間：${esc(new Date(time).toLocaleString("zh-Hant", { timeZone: "Asia/Hong_Kong" }))}`,
      `📱 裝置：${esc((device || "未知").substring(0, 60))}`,
    ].join("\n");

    // Send to Telegram
    const tgRes = await fetch(
      `https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TG_CHAT_ID,
          text: msg,
          parse_mode: "HTML",
        }),
      }
    );

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error("Telegram error:", tgData);
    }

    return res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error", message: err.message });
  }
}
