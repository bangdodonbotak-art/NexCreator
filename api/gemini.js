// Vercel Serverless Function: proxy Gemini agar API key tidak terekspos ke browser.
// Env: GEMINI_API_KEY (wajib), GEMINI_MODEL (opsional, default gemini-2.5-flash)
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY belum diset di Vercel' });

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.slice(0, 4000) : '';
  if (!prompt) return res.status(400).json({ error: 'prompt kosong' });

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!r.ok) return res.status(502).json({ error: 'Upstream ' + r.status });
    const d = await r.json();
    return res.status(200).json({ text: d?.candidates?.[0]?.content?.parts?.[0]?.text || '' });
  } catch (e) {
    return res.status(500).json({ error: 'Proxy error' });
  }
};
