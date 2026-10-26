// Vercel Serverless Function: kirim laporan ke Telegram tanpa mengekspos token.
// Env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (default tujuan)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return res.status(503).json({ error: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID belum diset' });

  const text = typeof req.body?.text === 'string' ? req.body.text.slice(0, 3800) : '';
  if (!text) return res.status(400).json({ error: 'text kosong' });

  try {
    // Chat tujuan selalu dari env, bukan dari klien, supaya endpoint tidak bisa disalahgunakan.
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text })
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(500).json({ error: 'Proxy error' });
  }
};
