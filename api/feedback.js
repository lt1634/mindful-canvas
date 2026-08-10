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

    const msg = [
      `🪷 *覺知畫布 — 新回饋*`,
      ``,
      `📋 模式：${modeLabel[mode] || mode}`,
      `💬 留言：${comment || "(無)"}`,
      `⏰ 時間：${new Date(time).toLocaleString("zh-Hant", { timeZone: "Asia/Hong_Kong" })}`,
      `📱 裝置：${(device || "未知").substring(0, 60)}`,
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
          parse_mode: "Markdown",
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
