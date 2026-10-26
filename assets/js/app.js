/* ============ NexCreator AI v4 ============ */
(() => {
'use strict';
const CFG = window.NEX_CONFIG || {};
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rp = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const num = n => Math.round(n).toLocaleString('id-ID');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const uid = () => 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const safeUrl = u => /^https:\/\//i.test(u || '') ? u : '';

/* ---------- Storage ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('nex4_' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('nex4_' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('nex4_' + k); } catch {} }
};

/* ---------- Seed data ---------- */
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Rak Susun Lipat Portabel Besi Baja', category: 'Home', price: 85000, commPct: 15, sold7d: 4210, score: 96, hook: 'Nyesel banget baru tahu ada rak lipat sekuat ini pas kamar kos udah sumpek parah!' },
  { id: 'p2', name: 'TWS Earbuds Gaming Low Latency', category: 'Gadget', price: 115000, commPct: 12, sold7d: 3190, score: 92, hook: 'Jangan beli TWS mahal-mahal kalau yang harga seratus ribuan ini suaranya bikin merinding!' },
  { id: 'p3', name: 'Mop Pel Lantai Putar Otomatis', category: 'Home', price: 69000, commPct: 18, sold7d: 5840, score: 98, hook: 'Tangan gak perlu nyentuh air kotor lagi tiap ngepel, rahasianya ada di alat 60 ribuan ini.' },
  { id: 'p4', name: 'Lampu Meja LED Eye-Care Rechargeable', category: 'Gadget', price: 55000, commPct: 14, sold7d: 2140, score: 88, hook: 'Mati lampu pas lembur? Lampu meja estetik ini tahan nyala 12 jam tanpa colok listrik.' },
  { id: 'p5', name: 'Serum Niacinamide Brightening 20ml', category: 'Beauty', price: 62000, commPct: 20, sold7d: 3560, score: 90, hook: 'Skincare 60 ribuan ini bikin muka kusam temenku glowing dalam dua minggu, serius!' }
];
const SEED_CHARS = [
  { id: 'c1', name: 'Rania Putri', role: 'Anak Kos & Home Living', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80', pitch: 1.2 },
  { id: 'c2', name: 'Dimas Prakoso', role: 'Reviewer Gadget & Desk Setup', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80', pitch: 0.85 },
  { id: 'c3', name: 'Siti Nurhaliza', role: 'Ibu Muda & Dapur Rapi', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80', pitch: 1.1 }
];
const ACCOUNTS = [
  { handle: '@kamar.estetik.id', niche: 'Home & Living' },
  { handle: '@racun.gadget.lokal', niche: 'Smart Gadget' },
  { handle: '@rumah.rapi.terus', niche: 'Alat Rumah Tangga' }
];
const SEED_QUEUE = [
  { id: 'q1', title: '#01_POV_Kamar_Kos_Sempit', productName: 'Rak Susun Lipat Portabel Besi Baja', charName: 'Rania Putri', account: '@kamar.estetik.id', time: '12:15 WIB', status: 'Published', views: 31400 },
  { id: 'q2', title: '#02_Review_Jujur_Pel_Otomatis', productName: 'Mop Pel Lantai Putar Otomatis', charName: 'Siti Nurhaliza', account: '@rumah.rapi.terus', time: '17:30 WIB', status: 'Scheduled', views: 0 },
  { id: 'q3', title: '#03_Unbox_TWS_Transparan', productName: 'TWS Earbuds Gaming Low Latency', charName: 'Dimas Prakoso', account: '@racun.gadget.lokal', time: '20:00 WIB', status: 'Scheduled', views: 0 }
];

const S = {
  products: LS.get('products', SEED_PRODUCTS),
  chars: LS.get('chars', SEED_CHARS),
  queue: LS.get('queue', SEED_QUEUE),
  scripts: LS.get('scripts', []),
  log: [],
  angle: 'pov',
  charId: LS.get('charId', 'c1'),
  tab: 'command',
  speaking: false,
  prefs: LS.get('prefs', { fx: true, snd: false, auto: false }),
  sb: null,
  sbOk: false
};
const save = () => { LS.set('products', S.products); LS.set('chars', S.chars); LS.set('queue', S.queue); LS.set('scripts', S.scripts); LS.set('charId', S.charId); };

/* ---------- Toast / log / sound ---------- */
function toast(title, msg = '', err = false) {
  const t = document.createElement('div');
  t.className = 'toast' + (err ? ' err' : '');
  t.innerHTML = `<i data-lucide="${err ? 'alert-triangle' : 'check-circle-2'}" class="w-5 h-5 shrink-0" style="color:var(${err ? '--red' : '--cyan'})"></i><div><div class="text-xs font-bold">${esc(title)}</div><div class="text-[11px] text-[var(--muted)]">${esc(msg)}</div></div>`;
  $('#toasts').appendChild(t); icons();
  beep(err ? 160 : 740);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3800);
}
function log(msg, cls = 'c-cyan') {
  const t = new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' });
  S.log.push(`[${t}] ${msg}`); if (S.log.length > 400) S.log.shift();
  const box = $('#terminalLog'); if (!box) return;
  const d = document.createElement('div'); d.className = cls;
  d.innerHTML = `<span style="color:var(--muted)">[${t}]</span> ${esc(msg)}`;
  box.appendChild(d); box.scrollTop = box.scrollHeight;
  while (box.children.length > 200) box.firstChild.remove();
}
let actx;
function beep(f = 600) {
  if (!S.prefs.snd) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = 'square'; o.frequency.value = f; g.gain.value = .03;
    o.connect(g); g.connect(actx.destination); o.start();
    g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .12); o.stop(actx.currentTime + .13);
  } catch {}
}
const icons = () => window.lucide && lucide.createIcons();
function download(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------- Background FX (cyber grid + rain) ---------- */
function initFx() {
  const c = $('#fx'), x = c.getContext('2d');
  let w, h, cols, drops;
  const glyphs = '01ｱｲｳｴｵｶｷｸｹｺ<>/{}#$%'.split('');
  const size = 16;
  function resize() {
    w = c.width = innerWidth; h = c.height = innerHeight;
    cols = Math.ceil(w / size); drops = Array.from({ length: cols }, () => Math.random() * h / size);
  }
  addEventListener('resize', resize); resize();
  let last = 0;
  (function frame(ts) {
    requestAnimationFrame(frame);
    if (!S.prefs.fx || document.hidden || ts - last < 60) return;
    last = ts;
    x.fillStyle = 'rgba(245,248,255,.2)'; x.fillRect(0, 0, w, h);
    x.font = size + 'px JetBrains Mono';
    for (let i = 0; i < cols; i++) {
      if (i % 3) continue;
      const ch = glyphs[Math.random() * glyphs.length | 0];
      x.fillStyle = Math.random() > .93 ? '#0ea5e9' : '#2563eb';
      x.fillText(ch, i * size, drops[i] * size);
      if (drops[i] * size > h && Math.random() > .975) drops[i] = 0;
      drops[i] += .6;
    }
  })(0);
}
function applyFxPref() { document.body.classList.toggle('no-fx', !S.prefs.fx); }

/* ---------- Spotlight + reveal ---------- */
document.addEventListener('pointermove', e => {
  const c = e.target.closest?.('.cy-card'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  c.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .08 }) : null;
function observeReveal(root = document) { $$('.cy-card', root).forEach(el => { if (!el.classList.contains('reveal')) { el.classList.add('reveal'); } io ? io.observe(el) : el.classList.add('in'); }); }

/* ---------- Count-up ---------- */
function countUp(el, to, fmt = num, dur = 900) {
  const from = Number(el.dataset.v || 0); el.dataset.v = to;
  const t0 = performance.now();
  (function step(t) {
    const p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

/* ---------- Tabs ---------- */
const TABS = ['command', 'hunter', 'script', 'studio', 'publisher', 'analytics'];
function switchTab(id, push = true) {
  if (!TABS.includes(id)) id = 'command';
  S.tab = id;
  TABS.forEach(t => { const s = $('#tab-' + t); s.hidden = t !== id; });
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  if (push) history.replaceState(null, '', '#' + id);
  const s = $('#tab-' + id); s.style.animation = 'none'; void s.offsetWidth; s.style.animation = '';
  observeReveal(s);
  if (id === 'analytics') renderAnalytics();
  if (id === 'studio') renderStudio();
  if (id === 'publisher') { renderQueue(); renderTg(); }
  if (id === 'command') renderChart();
  scrollTo({ top: 0, behavior: 'smooth' }); beep(520);
}

/* ---------- KPIs ---------- */
function kpis() {
  const pub = S.queue.filter(q => q.status === 'Published');
  const views = pub.reduce((a, q) => a + (Number(q.views) || 0), 0);
  const top = S.products.length ? S.products.reduce((a, p) => a.commRp > p.commRp ? a : p, { commRp: 0 }) : null;
  const avgComm = S.products.length ? S.products.reduce((a, p) => a + commRp(p), 0) / S.products.length : 0;
  const clicks = Math.round(views * .032), orders = Math.round(clicks * .02);
  const revenue = Math.round(orders * avgComm);
  return { views, clicks, orders, revenue, avgComm, queued: S.queue.filter(q => q.status === 'Scheduled' || q.status === 'Processing').length, pubN: pub.length, top };
}
const commRp = p => Math.round(p.price * p.commPct / 100);
function renderKpis() {
  const k = kpis();
  const cards = [
    { t: 'ESTIMASI KOMISI', v: k.revenue, f: rp, i: 'wallet', c: 'c-grn', s: `${num(k.orders)} konversi dari ${num(k.views)} views` },
    { t: 'PRODUK TERSINKRON', v: S.products.length, f: n => Math.round(n) + ' Produk', i: 'database', c: 'c-cyan', s: S.sbOk ? 'Cloud: connected' : 'Mode lokal / offline' },
    { t: 'ANTREAN AUTO-POST', v: k.queued, f: n => Math.round(n) + ' Video', i: 'calendar-clock', c: 'c-mag', s: 'Puncak: 12:15 · 17:30 · 20:00' },
    { t: 'VIDEO TERBIT', v: k.pubN, f: n => Math.round(n) + ' Video', i: 'activity', c: 'c-yel', s: `Rata-rata ${num(k.pubN ? k.views / k.pubN : 0)} views/video` }
  ];
  $('#kpiGrid').innerHTML = cards.map((c, i) => `
    <div class="cy-card lift p-5" style="animation:rowIn .5s ${i * .08}s backwards">
      <div class="flex justify-between text-[10px] tracking-widest text-[var(--muted)] mb-2"><span>${c.t}</span><i data-lucide="${c.i}" class="w-4 h-4 ${c.c}"></i></div>
      <div class="kpi-val" data-kpi="${i}">0</div>
      <p class="text-[11px] text-[var(--muted)] mt-1">${esc(c.s)}</p>
    </div>`).join('');
  $$('[data-kpi]').forEach(el => { const c = cards[el.dataset.kpi]; countUp(el, c.v, c.f); });
  icons(); observeReveal($('#kpiGrid'));
}

/* ---------- Pipeline ---------- */
const NODES = [
  ['radar', 'Crawl4AI Scraper', 'Filter komisi >12% & tren 7 hari', 'c-cyan'],
  ['ear', 'Whisper STT', 'Transkrip hook kompetitor', 'c-yel'],
  ['brain-circuit', 'Dify + Gemini ATM', 'Tulis ulang POV & CTA', 'c-vio'],
  ['mic', 'F5-TTS Indonesia', 'Suara natural + jeda napas', 'c-mag'],
  ['scan-face', 'LivePortrait + FFmpeg', 'Lip-sync & B-roll 9:16', 'c-grn'],
  ['send', 'Postiz + Supabase', 'Auto-schedule & laporan', 'c-cyan']
];
function renderPipe() {
  $('#pipe').innerHTML = NODES.map((n, i) => `<div class="node" id="node${i}"><div class="flex justify-between mb-1"><span class="mono text-[10px] text-[var(--muted)]">NODE ${String(i + 1).padStart(2, '0')}</span><i data-lucide="${n[0]}" class="w-4 h-4 ${n[3]}"></i></div><div class="text-xs font-bold">${n[1]}</div><div class="text-[11px] text-[var(--muted)]">${n[2]}</div></div>`).join('');
}
let cycling = false;
async function runCycle() {
  if (cycling) return; cycling = true;
  const btn = $('#btnCycle'); btn.disabled = true;
  $('#pipeState').textContent = 'RUNNING'; $('#pipeState').className = 'chip c-mag';
  $$('.node').forEach(n => n.classList.remove('done', 'active')); $('#pipeProg').style.width = '0';
  log('[ORCHESTRATOR] Siklus 24/7 dimulai', 'c-grn');
  const prod = S.products.slice().sort((a, b) => b.score - a.score)[0];
  const ch = S.chars.find(c => c.id === S.charId) || S.chars[0];
  const msgs = [
    `[CRAWL] Memindai produk, menyaring komisi >12%...`,
    `[WHISPER] Mengekstrak hook dari video kompetitor...`,
    `[ATM] Meracik naskah untuk "${prod?.name || '-'}"...`,
    `[TTS] Menyintesis suara untuk ${ch?.name || '-'}...`,
    `[RENDER] Lip-sync + B-roll 9:16...`,
    `[PUBLISH] Menjadwalkan ke antrean & kirim laporan...`
  ];
  for (let i = 0; i < NODES.length; i++) {
    $$('.node').forEach(n => n.classList.remove('active'));
    $('#node' + i).classList.add('active'); log(msgs[i]);
    $('#pipeProg').style.width = ((i + 1) / NODES.length * 100) + '%';
    await new Promise(r => setTimeout(r, 850));
    $('#node' + i).classList.remove('active'); $('#node' + i).classList.add('done');
  }
  if (prod) {
    const item = {
      id: uid(), title: '#Auto_' + prod.name.split(' ').slice(0, 3).join('_'), productName: prod.name,
      charName: ch.name, account: ACCOUNTS[Math.random() * ACCOUNTS.length | 0].handle,
      time: ['12:15 WIB', '17:30 WIB', '20:00 WIB'][Math.random() * 3 | 0], status: 'Scheduled', views: 0
    };
    S.queue.unshift(item); save(); cloudInsertQueue(item, null);
    log(`[DONE] "${item.title}" masuk antrean`, 'c-grn');
  }
  $('#pipeState').textContent = 'COMPLETE'; $('#pipeState').className = 'chip c-grn';
  toast('Siklus selesai', '6 node dieksekusi, 1 video masuk antrean.');
  renderKpis(); renderQueue(); renderTg();
  btn.disabled = false; cycling = false;
}

/* ---------- ROI ---------- */
function calcRoi() {
  const v = +$('#rVid').value, vw = +$('#rViews').value, pr = +$('#rPrice').value, cm = +$('#rComm').value, ctr = +$('#rCtr').value / 10, cvr = +$('#rCvr').value / 10;
  $('#lblVid').textContent = v + ' video/hari'; $('#lblViews').textContent = num(vw);
  $('#lblPrice').textContent = rp(pr); $('#lblComm').textContent = cm + '%';
  $('#lblCtr').textContent = ctr.toFixed(1) + '%'; $('#lblCvr').textContent = cvr.toFixed(1) + '%';
  const clicks = Math.round(v * vw * 30 * ctr / 100), orders = Math.round(clicks * cvr / 100);
  const gross = orders * pr * cm / 100, cost = CFG.OPS_COST_MONTHLY || 650000, net = gross - cost;
  $('#oClicks').textContent = num(clicks); $('#oOrders').textContent = num(orders);
  $('#oGross').textContent = rp(gross); $('#oCost').textContent = '- ' + rp(cost);
  const n = $('#oNet'); n.textContent = (net < 0 ? '- ' : '') + rp(Math.abs(net)); n.className = 'font-h text-xl ' + (net < 0 ? 'c-red' : 'c-grn');
  const perOrder = pr * cm / 100;
  $('#oBE').textContent = perOrder ? num(Math.ceil(cost / perOrder)) + ' pesanan/bln' : '-';
}

/* ---------- Charts ---------- */
const charts = {};
const gridC = 'rgba(37,99,235,.1)', tickC = '#5b6b94';
function mk(id, cfg) { const el = $('#' + id); if (!el || !window.Chart) return; charts[id]?.destroy(); charts[id] = new Chart(el.getContext('2d'), cfg); }
function last7() {
  const base = kpis().revenue || 1200000;
  const w = [.55, .62, .7, .66, .82, .95, 1];
  return { rev: w.map(x => Math.round(base / 7 * x * 1.3 / 1000)), views: w.map(x => Math.round(x * 40 + 8)) };
}
function renderChart() {
  const d = last7();
  const g = $('#revChart').getContext('2d').createLinearGradient(0, 0, 0, 240);
  g.addColorStop(0, 'rgba(37,99,235,.3)'); g.addColorStop(1, 'rgba(37,99,235,0)');
  mk('revChart', {
    type: 'line',
    data: {
      labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'], datasets: [
        { label: 'Komisi (rb Rp)', data: d.rev, borderColor: '#2563eb', backgroundColor: g, fill: true, tension: .4, borderWidth: 2.5, pointBackgroundColor: '#2563eb' },
        { label: 'Views (rb)', data: d.views, borderColor: '#0ea5e9', borderDash: [6, 5], tension: .4, borderWidth: 2, pointRadius: 3 }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 900 }, plugins: { legend: { labels: { color: tickC, font: { size: 11 } } } }, scales: { x: { ticks: { color: tickC }, grid: { color: gridC } }, y: { ticks: { color: tickC }, grid: { color: gridC } } } }
  });
}
function renderAnalytics() {
  const cats = {}; S.products.forEach(p => { cats[p.category] = (cats[p.category] || 0) + commRp(p) * p.sold7d; });
  mk('catChart', {
    type: 'bar', data: { labels: Object.keys(cats), datasets: [{ label: 'Potensi komisi 7 hari', data: Object.values(cats), backgroundColor: ['#2563eb', '#0ea5e9', '#1e40af', '#60a5fa', '#4f46e5'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => rp(c.parsed.y) } } }, scales: { x: { ticks: { color: tickC }, grid: { display: false } }, y: { ticks: { color: tickC, callback: v => (v / 1e6) + 'jt' }, grid: { color: gridC } } } }
  });
  const ang = { 'POV Curhat': 61, 'Shock Review': 54, 'Solusi Cepat': 49, 'Vs Mahal': 52, 'Mini Drama': 58, 'FOMO': 47 };
  mk('angleChart', {
    type: 'radar', data: { labels: Object.keys(ang), datasets: [{ label: 'Retensi 3 detik %', data: Object.values(ang), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.18)', pointBackgroundColor: '#1e40af' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: tickC } } }, scales: { r: { angleLines: { color: gridC }, grid: { color: gridC }, pointLabels: { color: tickC, font: { size: 10 } }, ticks: { display: false }, suggestedMin: 30, suggestedMax: 70 } } }
  });
  const hm = $('#heatmap'); const peak = { 12: .8, 13: .7, 17: .85, 18: .9, 19: .8, 20: 1, 21: .95, 22: .7 };
  hm.innerHTML = Array.from({ length: 24 }, (_, h) => { const v = peak[h] ?? (h < 6 ? .08 : .2 + (h % 5) * .04); return `<div title="${h}:00 — ${num(v * 6000)} views" style="aspect-ratio:1;border-radius:2px;background:rgba(${v > .6 ? '30,64,175' : '37,99,235'},${.1 + v * .85});box-shadow:${v > .8 ? '0 0 8px rgba(30,64,175,.5)' : 'none'}"></div>`; }).join('');
  const best = S.products.slice().sort((a, b) => b.score - a.score)[0];
  const sold = S.products.slice().sort((a, b) => commRp(b) * b.sold7d - commRp(a) * a.sold7d)[0];
  const ins = [
    best && ['c-grn', 'target', `Prioritaskan "${best.name}" (skor ${best.score}). Skor tertinggi di katalog.`],
    sold && ['c-yel', 'trending-up', `Potensi komisi 7 hari terbesar: "${sold.name}" ≈ ${rp(commRp(sold) * sold.sold7d)}.`],
    ['c-mag', 'clock', 'Jam 20:00–21:30 WIB memberi views tertinggi; sebar 40% posting di rentang ini.'],
    ['c-cyan', 'sparkles', 'Archetype POV Curhat unggul di retensi 3 detik; uji A/B dengan Mini Drama.'],
    S.queue.some(q => q.status === 'Failed') && ['c-red', 'alert-triangle', 'Ada video gagal tayang. Buka Publisher lalu klik Retry.']
  ].filter(Boolean);
  $('#insights').innerHTML = ins.map(i => `<div class="flex gap-2 p-3" style="background:rgba(37,99,235,.06);border-left:2px solid currentColor;" ><i data-lucide="${i[1]}" class="w-4 h-4 shrink-0 ${i[0]}"></i><span>${esc(i[2])}</span></div>`).join('');
  icons();
}

/* ---------- Hunter ---------- */
function renderHunter() {
  const q = $('#fSearch').value.trim().toLowerCase(), cat = $('#fCat').value, key = $('#fSort').value;
  let list = S.products.filter(p => (cat === 'ALL' || p.category === cat) && (!q || (p.name + p.hook).toLowerCase().includes(q)));
  list.sort((a, b) => (key === 'commRp' ? commRp(b) - commRp(a) : b[key] - a[key]));
  const tot = S.products.length, avgS = tot ? S.products.reduce((a, p) => a + p.score, 0) / tot : 0;
  const best = S.products.reduce((a, p) => commRp(p) > (a ? commRp(a) : -1) ? p : a, null);
  $('#hunterStats').innerHTML = [
    ['TOTAL PRODUK', tot, 'c-cyan'], ['RATA SKOR VIRAL', avgS.toFixed(1), 'c-grn'],
    ['TOTAL TERJUAL 7H', num(S.products.reduce((a, p) => a + p.sold7d, 0)), 'c-yel'], ['KOMISI/UNIT TERTINGGI', best ? rp(commRp(best)) : '-', 'c-mag']
  ].map(s => `<div class="cy-card p-4"><div class="text-[10px] tracking-widest text-[var(--muted)]">${s[0]}</div><div class="font-h text-lg ${s[2]} mt-1">${esc(s[1])}</div></div>`).join('');
  $('#prodBody').innerHTML = list.length ? list.map((p, i) => `
    <tr style="animation-delay:${i * 40}ms">
      <td class="font-bold">${esc(p.name)}</td>
      <td><span class="chip c-cyan">${esc(p.category)}</span></td>
      <td class="mono">${rp(p.price)}</td>
      <td class="mono c-grn font-bold">${rp(commRp(p))} <span class="text-[var(--muted)]">(${p.commPct}%)</span></td>
      <td class="mono">${num(p.sold7d)}</td>
      <td><span class="score ${p.score >= 90 ? 's-hi' : p.score >= 75 ? 's-mid' : 's-lo'}">${p.score}</span></td>
      <td class="italic text-[var(--muted)]" style="max-width:280px">"${esc(p.hook)}"</td>
      <td class="text-right whitespace-nowrap">
        <button class="btn btn-sm btn-pink" data-act="atm" data-id="${esc(p.id)}">ATM →</button>
        <button class="btn btn-sm" data-act="edit" data-id="${esc(p.id)}"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button class="btn btn-sm btn-danger" data-act="del" data-id="${esc(p.id)}"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </td></tr>`).join('') : `<tr><td colspan="8" class="empty">Tidak ada produk. Tambahkan atau impor CSV.</td></tr>`;
  icons(); observeReveal($('#hunterStats'));
}
function viralScore(p) { return clamp(Math.round(50 + Math.log10(p.sold7d + 1) * 8 + p.commPct * .6 + (p.price < 100000 ? 6 : 0)), 40, 99); }
function openProd(p) {
  $('#prodTitle').textContent = p ? 'Edit Produk' : 'Tambah Produk';
  $('#pId').value = p?.id || ''; $('#pName').value = p?.name || ''; $('#pCat').value = p?.category || 'Home';
  $('#pPrice').value = p?.price ?? 79000; $('#pComm').value = p?.commPct ?? 15; $('#pSold').value = p?.sold7d ?? 1850; $('#pHook').value = p?.hook || '';
  openM('mProduct');
}
async function saveProd(e) {
  e.preventDefault();
  const id = $('#pId').value;
  const p = { id: id || uid(), name: $('#pName').value.trim(), category: $('#pCat').value, price: +$('#pPrice').value, commPct: +$('#pComm').value, sold7d: +$('#pSold').value, hook: $('#pHook').value.trim() };
  p.score = viralScore(p);
  if (id) { const i = S.products.findIndex(x => x.id === id); S.products[i] = { ...S.products[i], ...p }; } else S.products.unshift(p);
  save(); closeM(); renderHunter(); fillScriptProducts(); renderKpis();
  toast(id ? 'Produk diperbarui' : 'Produk ditambahkan', p.name);
  const row = { name: p.name, category: p.category, price: p.price, commission_pct: p.commPct, commission_rp: commRp(p), sold_7d: p.sold7d, viral_score: p.score, competitor_hook: p.hook };
  if (S.sb) {
    const isUuid = /^[0-9a-f-]{36}$/i.test(p.id);
    const r = isUuid ? await S.sb.from('products').update(row).eq('id', p.id).select() : await S.sb.from('products').insert(row).select();
    if (r.error) log('[SUPABASE] ' + r.error.message, 'c-yel');
    else { if (!isUuid && r.data?.[0]) { p.id = r.data[0].id; save(); renderHunter(); } log(`[SUPABASE] products tersimpan: ${p.name}`, 'c-grn'); }
  }
}
async function delProd(id) {
  const p = S.products.find(x => x.id === id); if (!p || !confirm(`Hapus "${p.name}"?`)) return;
  S.products = S.products.filter(x => x.id !== id); save(); renderHunter(); fillScriptProducts(); renderKpis();
  toast('Produk dihapus', p.name);
  if (S.sb && /^[0-9a-f-]{36}$/i.test(id)) { const r = await S.sb.from('products').delete().eq('id', id); if (r.error) log('[SUPABASE] ' + r.error.message, 'c-yel'); }
}
function csvEscape(v) { v = String(v ?? ''); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function exportCsv() {
  const head = 'name,category,price,commission_pct,sold_7d,viral_score,hook';
  const rows = S.products.map(p => [p.name, p.category, p.price, p.commPct, p.sold7d, p.score, p.hook].map(csvEscape).join(','));
  download('nexcreator-products.csv', [head, ...rows].join('\n'), 'text/csv'); toast('CSV diekspor', rows.length + ' produk');
}
function parseCsv(t) {
  const rows = []; let cur = [], f = '', q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true; else if (c === ',') { cur.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; cur.push(f); f = ''; if (cur.some(x => x !== '')) rows.push(cur); cur = []; }
    else f += c;
  }
  if (f || cur.length) { cur.push(f); rows.push(cur); } return rows;
}
function importCsv(text) {
  const rows = parseCsv(text); if (rows.length < 2) return toast('CSV kosong', 'Tidak ada baris data.', true);
  const h = rows[0].map(x => x.trim().toLowerCase()); const ix = k => h.indexOf(k);
  if (ix('name') < 0) return toast('Format salah', 'Kolom "name" wajib ada.', true);
  let n = 0;
  rows.slice(1).forEach(r => {
    const g = k => ix(k) >= 0 ? r[ix(k)] : '';
    const p = { id: uid(), name: (g('name') || '').trim().slice(0, 140), category: ['Home', 'Gadget', 'Beauty', 'Fashion'].includes(g('category')) ? g('category') : 'Home', price: Math.max(1, +g('price') || 50000), commPct: clamp(+g('commission_pct') || 10, 1, 100), sold7d: Math.max(0, +g('sold_7d') || 0), hook: (g('hook') || '').trim().slice(0, 300) };
    if (!p.name) return; p.score = clamp(+g('viral_score') || viralScore(p), 1, 100); S.products.push(p); n++;
  });
  save(); renderHunter(); fillScriptProducts(); renderKpis(); toast('Impor selesai', n + ' produk ditambahkan (lokal). Gunakan Seed untuk push ke cloud.');
}

/* ---------- Script Studio ---------- */
const prodIdx = () => +$('#sProd').value || 0;
const curProd = () => S.products[prodIdx()] || S.products[0];
function fillScriptProducts() {
  const sel = $('#sProd'), old = sel.value;
  sel.innerHTML = S.products.map((p, i) => `<option value="${i}">${esc(p.name)} — ${rp(commRp(p))}</option>`).join('');
  if (old && S.products[old]) sel.value = old;
  const p = curProd(); if (p) { $('#sHookIn').value = p.hook; $('#phProd').textContent = p.name; }
}
const T = {
  pov: p => ({ hook: p.hook, body: `Jujur awalnya aku pikir barang harga ${rp(p.price)} itu palingan ringkih. Tapi pas sampai, aku beneran kaget: bahannya kokoh, rapi, dan nggak ada yang bikin kecewa.`, demo: `Nih lihat detail ${p.name}. Pasangnya gampang banget, langsung kelihatan bedanya sejak hari pertama dipakai.`, cta: `Stoknya mulai tipis dan bisa COD. Cek Keranjang Kuning di pojok kiri bawah sekarang!` }),
  unbox: p => ({ hook: `Stop scroll dulu! Ini alasan ${num(p.sold7d)} orang rebutan ${p.name} minggu ini!`, body: `Banyak yang tanya di komentar: worth it nggak? Pas aku buka paketnya, finishing-nya setara barang yang harganya jauh di atas ini.`, demo: `Langsung kita tes fungsinya: responsif, awet, dan benar-benar ngebantu aktivitas harian jadi lebih hemat waktu.`, cta: `Jangan sampai kehabisan, klik Keranjang Kuning buat cek voucher gratis ongkir hari ini!` }),
  problem: p => ({ hook: `Capek ngalamin masalah yang sama tiap hari? Cukup ${rp(p.price)} buat beresin semuanya!`, body: `Dulu aku buang waktu berjam-jam sampai nemu ${p.name} yang lagi ramai di TikTok Shop.`, demo: `Sekali pasang beres dalam hitungan detik. Hemat tenaga, hemat tempat, dan awet dipakai lama.`, cta: `Amankan harga promonya sekarang di Keranjang Kuning kiri bawah ya!` }),
  compare: p => ({ hook: `Kenapa bayar mahal kalau yang ${rp(p.price)} ini hasilnya nggak kalah?`, body: `Aku udah coba yang ratusan ribu, dan jujur selisihnya tipis banget dengan ${p.name}.`, demo: `Perbandingan langsung: kualitas bahan, kemudahan pakai, dan daya tahan. Hasilnya bikin aku nggak balik lagi.`, cta: `Hemat duitnya, cek Keranjang Kuning sebelum promonya habis.` }),
  story: p => ({ hook: `Temenku ngetawain aku beli ini… sampai dia nyobain sendiri.`, body: `Waktu itu aku cuma iseng checkout ${p.name}. Eh, seminggu kemudian dia yang minta link-nya.`, demo: `Ini buktinya. Dipakai tiap hari, hasilnya konsisten dan nggak ribet sama sekali.`, cta: `Mau nyusul? Link-nya ada di Keranjang Kuning, bisa COD.` }),
  fomo: p => ({ hook: `Promo ${p.name} tinggal hitungan jam, dan stoknya makin menipis!`, body: `Minggu ini sudah ${num(p.sold7d)} unit terjual. Banyak yang nyesel karena baru ngecek pas kehabisan.`, demo: `Kualitasnya terjamin, tampilannya rapi, dan harganya cuma ${rp(p.price)} sekarang.`, cta: `Klik Keranjang Kuning SEKARANG sebelum harga balik normal!` })
};
function setSegs(o) {
  $('#segHook').value = o.hook || ''; $('#segBody').value = o.body || ''; $('#segDemo').value = o.demo || ''; $('#segCta').value = o.cta || '';
  analyzeScript(); setCaption(o.hook || '');
}
const segs = () => ({ hook: $('#segHook').value.trim(), body: $('#segBody').value.trim(), demo: $('#segDemo').value.trim(), cta: $('#segCta').value.trim() });
const fullText = () => { const s = segs(); return [s.hook, s.body, s.demo, s.cta].filter(Boolean).join(' ').replace(/\s+/g, ' '); };
function analyzeScript() {
  const s = segs(), txt = fullText(), words = txt.split(/\s+/).filter(Boolean).length;
  const dur = +$('#sDur').value, est = Math.round(words / 2.6);
  $('#wordCount').textContent = words; $('#durEst').textContent = est;
  const hookW = s.hook.split(/\s+/).filter(Boolean).length;
  const checks = [
    [hookW > 0 && hookW <= 16, 'Hook ringkas (≤16 kata)', `${hookW} kata`],
    [/[!?]|jangan|stop|nyesel|rahasia|kaget|serius|ternyata/i.test(s.hook), 'Hook memicu rasa penasaran/emosi', ''],
    [/keranjang kuning|cek|klik|checkout/i.test(s.cta), 'CTA menyebut Keranjang Kuning', ''],
    [/cod|ongkir|voucher|promo|diskon|stok/i.test(s.cta + s.demo), 'Ada pemicu urgensi/insentif', ''],
    [Math.abs(est - dur) <= dur * .25, 'Durasi sesuai target', `${est}s vs ${dur}s`],
    [!/(terbaik di dunia|100% sembuh|dijamin sembuh|pasti kaya)/i.test(txt), 'Bebas klaim berlebihan (aman kebijakan)', '']
  ];
  let score = 40 + checks.filter(c => c[0]).length * 10; if (est > dur * 1.25) score -= 5;
  score = clamp(score, 0, 99);
  $('#scoreRing').style.setProperty('--v', score); countUp($('#scoreNum'), score, n => Math.round(n), 600);
  $('#checklist').innerHTML = checks.map(c => `<div class="check ${c[0] ? 'ok' : 'warn'}"><span class="dot"></span><span>${esc(c[1])} <span class="text-[var(--muted)] mono">${esc(c[2])}</span></span></div>`).join('');
  renderStoryboard();
}
function renderStoryboard() {
  const p = curProd(); const s = segs(); if (!p) return;
  const q = encodeURIComponent((p.category === 'Beauty' ? 'skincare' : p.category === 'Gadget' ? 'gadget' : p.category === 'Fashion' ? 'fashion' : 'home interior'));
  const frames = [['0–3s', 'Close-up reaksi + hook', s.hook], ['3–15s', 'Kamar/kondisi sebelum', s.body], ['15–25s', 'Demo produk close-up', s.demo], ['25–30s', 'Layar Keranjang Kuning', s.cta]];
  const imgs = ['1534528741775-53994a69daeb', '1556909114-f6e7ad7d3136', '1593305841991-05c297ba4575', '1512496015851-a90fb38ba796'];
  $('#storyboard').innerHTML = frames.map((f, i) => `<div class="frame" style="background-image:linear-gradient(rgba(5,1,15,.35),rgba(5,1,15,.35)),url('https://images.unsplash.com/photo-${imgs[i]}?auto=format&fit=crop&w=300&q=60')"><em>${f[0]}</em><span>${esc(f[1])}</span></div>`).join('');
}
async function callGemini(prompt) {
  const key = LS.get('gem', '');
  if (key) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
    if (!r.ok) throw new Error('Gemini ' + r.status);
    const d = await r.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  const r = await fetch('/api/gemini', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
  if (!r.ok) throw new Error('Proxy ' + r.status);
  return (await r.json()).text || '';
}
function parseJsonLoose(t) { const m = t.match(/\{[\s\S]*\}/); if (!m) throw new Error('no json'); return JSON.parse(m[0]); }
async function generate(notify = true) {
  const p = curProd(); if (!p) return;
  const base = T[S.angle](p);
  if (!notify) { setSegs(base); $('#engineTag').textContent = 'local'; return; }
  const btn = $('#btnGen'); btn.disabled = true; btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>Meracik...'; icons();
  const prompt = `Buat naskah video TikTok affiliate ${$('#sDur').value} detik, bahasa Indonesia gaya ${$('#sTone').value}, untuk produk "${p.name}" (harga Rp ${p.price}). Hook kompetitor sebagai inspirasi (JANGAN disalin): "${$('#sHookIn').value}". Archetype: ${S.angle}. Hindari klaim berlebihan. Balas JSON murni dengan key: hook, body, demo, cta.`;
  try {
    const o = parseJsonLoose(await callGemini(prompt));
    setSegs({ hook: o.hook, body: o.body, demo: o.demo, cta: o.cta }); $('#engineTag').textContent = 'gemini-2.5-flash';
    log(`[GEMINI] Naskah diracik untuk ${p.name}`, 'c-grn'); toast('Naskah AI siap', 'Diracik oleh Gemini.');
  } catch (err) {
    setSegs(base); $('#engineTag').textContent = 'local (fallback)';
    log('[GEMINI] fallback ke formula lokal: ' + err.message, 'c-yel'); toast('Mode lokal', 'Gemini tidak tersedia, memakai formula ATM lokal.');
  }
  btn.disabled = false; btn.innerHTML = '<i data-lucide="wand-2" class="w-4 h-4"></i>Racik Naskah'; icons();
}
function hookLab() {
  const p = curProd(); if (!p) return;
  const v = [
    `Nyesel baru tahu ${p.name} ini ada dari dulu!`, `Jangan checkout dulu sebelum lihat ${p.name} ini…`,
    `${num(p.sold7d)} orang beli ini minggu lalu, ternyata ini alasannya.`, `Harga ${rp(p.price)} tapi hasilnya bikin aku nggak percaya.`,
    `Aku salah banget soal ${p.name}, dan ini buktinya.`
  ];
  $('#hookLab').innerHTML = v.map((h, i) => `<div class="flex items-center gap-2 p-2 text-xs" style="background:rgba(37,99,235,.06);border:1px solid var(--line)"><b class="mono c-mag">V${i + 1}</b><span class="flex-1">${esc(h)}</span><button class="btn btn-sm" data-hook="${esc(h)}">Pakai</button></div>`).join('');
}
async function saveScript() {
  const s = segs(), p = curProd();
  const rec = { id: uid(), product: p?.name || '', angle: S.angle, ...s, score: +$('#scoreNum').textContent || 0, at: new Date().toISOString() };
  S.scripts.unshift(rec); S.scripts = S.scripts.slice(0, 50); save(); renderScriptLib();
  toast('Naskah tersimpan', 'Pustaka lokal diperbarui.');
  if (S.sb) {
    const { error } = await S.sb.from('atm_scripts').insert({ angle_type: S.angle, hook_0_3s: s.hook, body_3_15s: s.body, demo_15_25s: s.demo, cta_25_30s: s.cta, viral_score: rec.score });
    if (error) log('[SUPABASE] atm_scripts: ' + error.message, 'c-yel'); else log('[SUPABASE] Naskah masuk atm_scripts', 'c-grn');
  }
}
function renderScriptLib() {
  $('#scriptLib').innerHTML = S.scripts.length ? S.scripts.map(s => `<div class="p-3 text-xs" style="background:rgba(37,99,235,.06);border:1px solid var(--line)"><div class="flex justify-between"><b class="truncate">${esc(s.product)}</b><span class="chip c-grn">${s.score}</span></div><div class="text-[var(--muted)] mt-1 truncate">${esc(s.hook)}</div><div class="flex gap-2 mt-2"><button class="btn btn-sm" data-load="${esc(s.id)}">Muat</button><button class="btn btn-sm btn-danger" data-rm="${esc(s.id)}">Hapus</button></div></div>`).join('') : '<div class="empty">Belum ada naskah tersimpan.</div>';
}

/* ---------- Studio ---------- */
const curChar = () => S.chars.find(c => c.id === S.charId) || S.chars[0];
function renderStudio() {
  $('#charGrid').innerHTML = S.chars.map(c => `<div class="char ${c.id === S.charId ? 'active' : ''}" data-char="${esc(c.id)}"><img src="${esc(safeUrl(c.img))}" alt="" onerror="this.style.visibility='hidden'"><div class="min-w-0"><div class="text-xs font-bold truncate">${esc(c.name)}</div><div class="text-[11px] text-[var(--muted)] truncate">${esc(c.role)}</div></div></div>`).join('');
  $('#stAccount').innerHTML = ACCOUNTS.map(a => `<option value="${esc(a.handle)}">${esc(a.handle)} (${esc(a.niche)})</option>`).join('');
  const c = curChar(); if (c) { $('#phImg').src = safeUrl(c.img); $('#phBadge').textContent = c.name + ' • AI'; }
  $('#phHandle').textContent = $('#stAccount').value; const p = curProd(); if (p) { $('#phProd').textContent = p.name; $('#phTags').textContent = `#${p.category.toLowerCase()} #racuntiktok #fyp #affiliate`; }
  loadVoices(); updVoiceLbls();
}
function updVoiceLbls() { $('#lblRate').textContent = (+$('#vRate').value).toFixed(2) + 'x'; $('#lblPitch').textContent = (+$('#vPitch').value).toFixed(2); }
function loadVoices() {
  if (!('speechSynthesis' in window)) { $('#vVoice').innerHTML = '<option>Tidak didukung</option>'; return; }
  const vs = speechSynthesis.getVoices(); const id = vs.filter(v => /^id/i.test(v.lang));
  const list = id.length ? id : vs.slice(0, 20); const old = $('#vVoice').value;
  $('#vVoice').innerHTML = list.map(v => `<option value="${esc(v.name)}">${esc(v.name)} (${esc(v.lang)})</option>`).join('') || '<option value="">Default</option>';
  if (old) $('#vVoice').value = old;
}
function setCaption(text, active = -1) {
  const cap = $('#phCap'); cap.className = 'cap ' + ($('#capStyle').value || '');
  cap.innerHTML = text.split(/\s+/).filter(Boolean).map((w, i) => `<span class="w ${i === active ? 'on' : ''}">${esc(w)}</span> `).join('');
}
let karaTimer;
function stopSpeak() {
  S.speaking = false; clearInterval(karaTimer); $('#phone').classList.remove('talking');
  $('#playLbl').textContent = 'Simulasi Suara & Lip-Sync'; if ('speechSynthesis' in window) speechSynthesis.cancel();
}
function playSim(text) {
  if (S.speaking) { stopSpeak(); return; }
  text = text || fullText(); if (!text) return toast('Naskah kosong', 'Racik naskah dulu di tab Script.', true);
  const words = text.split(/\s+/).filter(Boolean); let idx = 0;
  S.speaking = true; $('#phone').classList.add('talking'); $('#playLbl').textContent = 'Stop'; setCaption(text, 0);
  const rate = +$('#vRate').value, pitch = clamp(+$('#vPitch').value * (curChar()?.pitch || 1), .5, 2);
  const msPerWord = 60000 / (150 * rate);
  const tick = () => { idx++; if (idx >= words.length) { stopSpeak(); setCaption(text, -1); return; } setCaption(text, idx); };
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'id-ID'; u.rate = rate; u.pitch = pitch;
    const v = speechSynthesis.getVoices().find(x => x.name === $('#vVoice').value); if (v) u.voice = v;
    let usedBoundary = false;
    u.onboundary = e => { if (e.name && e.name !== 'word') return; usedBoundary = true; clearInterval(karaTimer); const before = text.slice(0, e.charIndex).split(/\s+/).filter(Boolean).length; idx = before; setCaption(text, idx); };
    u.onend = u.onerror = () => { if (S.speaking) { stopSpeak(); setCaption(text, -1); } };
    speechSynthesis.speak(u);
    karaTimer = setInterval(() => { if (!usedBoundary) tick(); }, msPerWord);
  } else karaTimer = setInterval(tick, msPerWord);
  log('[LIVEPORTRAIT+TTS] Simulasi lip-sync ' + (curChar()?.name || ''), 'c-cyan');
}
function packJson() {
  const p = curProd(), c = curChar(), s = segs();
  const ssml = `<speak>${[s.hook, s.body, s.demo, s.cta].filter(Boolean).map(x => `<p>${esc(x)}</p><break time="350ms"/>`).join('')}</speak>`;
  return { generated: new Date().toISOString(), product: p, character: c, angle: S.angle, script: s, ssml, voice: { rate: +$('#vRate').value, pitch: +$('#vPitch').value }, shots: [{ t: '0-3s', shot: 'Close-up + hook text overlay' }, { t: '3-15s', shot: 'Before / masalah' }, { t: '15-25s', shot: 'Demo produk close-up' }, { t: '25-30s', shot: 'Keranjang Kuning + CTA' }], target: { account: $('#stAccount').value, time: $('#stTime').value } };
}
async function sendQueue() {
  const p = curProd(), c = curChar(); if (!p) return toast('Tidak ada produk', 'Tambah produk dulu.', true);
  const item = { id: uid(), title: '#Auto_' + p.name.split(' ').slice(0, 3).join('_'), productName: p.name, charName: c.name, account: $('#stAccount').value, time: $('#stTime').value, status: 'Scheduled', views: 0 };
  S.queue.unshift(item); save(); renderKpis();
  await cloudInsertQueue(item, segs());
  toast('Masuk antrean', `${item.time} · ${item.account}`); switchTab('publisher');
}

/* ---------- Publisher ---------- */
function renderQueue() {
  const f = $('#qFilter').value; const list = S.queue.filter(q => f === 'ALL' || q.status === f);
  $('#queueList').innerHTML = list.length ? list.map((q, i) => `
    <div class="qitem ${q.status.toLowerCase()}" style="animation-delay:${i * 50}ms">
      <div class="flex flex-wrap justify-between gap-2">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap"><b class="mono text-xs">${esc(q.title)}</b><span class="chip ${q.status === 'Published' ? 'c-grn' : q.status === 'Failed' ? 'c-red' : q.status === 'Processing' ? 'c-cyan' : 'c-yel'}">${esc(q.status)}</span></div>
          <div class="text-xs">${esc(q.productName)} · <span class="c-cyan">${esc(q.charName)}</span></div>
          <div class="mono text-[11px] text-[var(--muted)]">${esc(q.account)} | ${esc(q.time)}</div>
        </div>
        <div class="text-right"><div class="mono text-xs font-bold">${Number(q.views) ? num(q.views) + ' views' : 'Menunggu'}</div>
          <div class="flex gap-1 justify-end mt-2">
            ${q.status !== 'Published' ? `<button class="btn btn-sm" data-q="pub" data-id="${esc(q.id)}">Publish</button>` : ''}
            ${q.status === 'Failed' ? `<button class="btn btn-sm" data-q="retry" data-id="${esc(q.id)}">Retry</button>` : ''}
            <button class="btn btn-sm btn-danger" data-q="del" data-id="${esc(q.id)}"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div></div>
      </div></div>`).join('') : '<div class="empty">Antrean kosong.</div>';
  const slots = { '12:15': 12.25, '17:30': 17.5, '20:00': 20, '21:30': 21.5 };
  $('#timeline').innerHTML = [0, 6, 12, 18, 23].map(h => `<span class="tick" style="left:${h / 24 * 100}%">${String(h).padStart(2, '0')}</span>`).join('') +
    S.queue.filter(q => q.status === 'Scheduled').map(q => { const k = (q.time || '').slice(0, 5); const h = slots[k]; return h ? `<div class="peak" title="${esc(q.title)}" style="left:${h / 24 * 100}%;height:${22 + Math.random() * 18}px"></div>` : ''; }).join('');
  icons();
}
async function queueAction(act, id) {
  const q = S.queue.find(x => x.id === id); if (!q) return;
  if (act === 'del') { if (!confirm('Hapus dari antrean?')) return; S.queue = S.queue.filter(x => x.id !== id); if (S.sb && /^[0-9a-f-]{36}$/i.test(id)) await S.sb.from('video_queue').delete().eq('id', id); }
  else if (act === 'pub' || act === 'retry') {
    q.status = 'Processing'; renderQueue(); log(`[POSTIZ] Mengunggah ${q.title}...`);
    await new Promise(r => setTimeout(r, 1400));
    q.status = 'Published'; q.views = Math.round(2000 + Math.random() * 28000);
    log(`[POSTIZ] ${q.title} tayang (${num(q.views)} views simulasi)`, 'c-grn'); toast('Video tayang', q.title);
    if (S.sb && /^[0-9a-f-]{36}$/i.test(id)) await S.sb.from('video_queue').update({ status: q.status, est_views: String(q.views) }).eq('id', id);
  }
  save(); renderQueue(); renderKpis(); renderTg();
}
function tgText() {
  const k = kpis(), d = new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric' });
  const top = S.products.slice().sort((a, b) => b.score - a.score)[0];
  return `📊 LAPORAN NEXCREATOR AI — ${d}
━━━━━━━━━━━━━━━━━━━━━━
[PRODUKSI]
• Produk terdata   : ${S.products.length}
• Video terbit     : ${k.pubN}
• Antrean aktif    : ${k.queued}
• Produk fokus     : ${top?.name || '-'}

[PERFORMA (ESTIMASI)]
• Total views      : ${num(k.views)}
• Klik keranjang   : ${num(k.clicks)}
• Pesanan          : ${num(k.orders)}
• Komisi           : ${rp(k.revenue)}

[CLOUD]
• Supabase         : ${S.sbOk ? 'Connected' : 'Offline (lokal)'}

Siklus berikutnya: 05:00 WIB`;
}
const renderTg = () => { $('#tgPreview').textContent = tgText(); };
async function sendTg() {
  const text = tgText(), token = LS.get('tgt', ''), chat = LS.get('tgc', '');
  try {
    let r;
    if (token && chat) r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }) });
    else r = await fetch('/api/telegram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, chat_id: chat || undefined }) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    toast('Terkirim ke Telegram', 'Cek bot Anda.'); log('[TELEGRAM] Laporan terkirim', 'c-grn');
  } catch (e) { toast('Gagal kirim', 'Isi token+chat ID di Pengaturan atau set env di Vercel. (' + e.message + ')', true); log('[TELEGRAM] ' + e.message, 'c-red'); }
}

/* ---------- Supabase ---------- */
function setSb(txt, color) { $('#sbText').textContent = txt; $('#sbDot').style.background = `var(--${color})`; }
async function initSb() {
  const url = LS.get('sbu', CFG.SUPABASE_URL), key = LS.get('sbk', CFG.SUPABASE_ANON_KEY);
  if (!url || !key || !window.supabase) { setSb('offline', 'yellow'); return; }
  try { S.sb = window.supabase.createClient(url, key); log('[SUPABASE] Menghubungkan ' + url.replace(/^https:\/\//, ''), 'c-cyan'); await pull(); }
  catch (e) { S.sb = null; S.sbOk = false; setSb('error', 'red'); log('[SUPABASE] ' + e.message, 'c-red'); }
}
async function pull() {
  if (!S.sb) return;
  const pr = await S.sb.from('products').select('*').order('created_at', { ascending: false });
  if (pr.error) { S.sbOk = false; setSb('tabel belum ada', 'yellow'); log('[SUPABASE] ' + pr.error.message + ' — jalankan supabase/schema.sql', 'c-yel'); return; }
  S.sbOk = true; setSb('connected', 'green');
  if (pr.data.length) {
    S.products = pr.data.map(p => ({ id: p.id, name: p.name, category: p.category || 'Home', price: +p.price || 0, commPct: +p.commission_pct || 0, sold7d: +p.sold_7d || 0, score: +p.viral_score || 80, hook: p.competitor_hook || '' }));
    log(`[SUPABASE] ${pr.data.length} produk disinkronkan`, 'c-grn');
  }
  const qr = await S.sb.from('video_queue').select('*').order('created_at', { ascending: false });
  if (!qr.error && qr.data.length) S.queue = qr.data.map(q => ({ id: q.id, title: q.title, productName: q.product_name, charName: q.character_name, account: q.target_account, time: q.schedule_time, status: q.status, views: parseInt(String(q.est_views).replace(/\D/g, '')) || 0 }));
  save(); renderHunter(); fillScriptProducts(); renderQueue(); renderKpis(); renderTg();
}
async function cloudInsertQueue(item, sc) {
  if (!S.sb) return;
  const row = { title: item.title, product_name: item.productName, character_name: item.charName, target_account: item.account, schedule_time: item.time, status: item.status, est_views: String(item.views || 0) };
  if (sc) Object.assign(row, { hook_script: sc.hook, body_script: sc.body, demo_script: sc.demo, cta_script: sc.cta });
  const r = await S.sb.from('video_queue').insert(row).select();
  if (r.error) log('[SUPABASE] video_queue: ' + r.error.message, 'c-yel');
  else { if (r.data?.[0]) { item.id = r.data[0].id; save(); renderQueue(); } log(`[SUPABASE] ${item.title} dicatat`, 'c-grn'); }
}
async function seed() {
  if (!S.sb) return toast('Supabase belum terhubung', 'Isi URL & key lalu simpan.', true);
  const rows = S.products.map(p => ({ name: p.name, category: p.category, price: p.price, commission_pct: p.commPct, commission_rp: commRp(p), sold_7d: p.sold7d, viral_score: p.score, competitor_hook: p.hook }));
  const { error } = await S.sb.from('products').insert(rows);
  if (error) return toast('Seed gagal', error.message, true);
  toast('Seed berhasil', rows.length + ' produk dikirim.'); await pull();
}

/* ---------- Modals / palette ---------- */
function openM(id) { $$('.overlay').forEach(o => o.classList.remove('open')); $('#' + id).classList.add('open'); icons(); }
function closeM() { $$('.overlay').forEach(o => o.classList.remove('open')); }
function openSettings() {
  $('#cSbUrl').value = LS.get('sbu', CFG.SUPABASE_URL) || ''; $('#cSbKey').value = LS.get('sbk', CFG.SUPABASE_ANON_KEY) || '';
  $('#cGem').value = LS.get('gem', ''); $('#cTgT').value = LS.get('tgt', ''); $('#cTgC').value = LS.get('tgc', '');
  ['fx', 'snd', 'auto'].forEach(k => $('#sw' + k[0].toUpperCase() + k.slice(1)).classList.toggle('on', !!S.prefs[k]));
  openM('mSettings');
}
function saveSettings() {
  LS.set('sbu', $('#cSbUrl').value.trim()); LS.set('sbk', $('#cSbKey').value.trim()); LS.set('gem', $('#cGem').value.trim());
  LS.set('tgt', $('#cTgT').value.trim()); LS.set('tgc', $('#cTgC').value.trim());
  LS.set('prefs', S.prefs); applyFxPref(); setupAuto(); closeM(); toast('Konfigurasi disimpan', 'Menghubungkan ulang...'); initSb();
}
let autoT; function setupAuto() { clearInterval(autoT); if (S.prefs.auto) autoT = setInterval(() => pull(), 60000); }

const COMMANDS = [
  ...TABS.map((t, i) => ({ n: 'Buka tab: ' + t, k: String(i + 1), f: () => switchTab(t) })),
  { n: 'Jalankan siklus 24/7', k: 'R', f: runCycle },
  { n: 'Tambah produk baru', k: 'N', f: () => { switchTab('hunter'); openProd(); } },
  { n: 'Racik naskah ATM', k: 'G', f: () => { switchTab('script'); generate(true); } },
  { n: 'Ekspor produk CSV', k: '', f: exportCsv },
  { n: 'Ekspor log terminal', k: '', f: () => download('nexcreator-log.txt', S.log.join('\n')) },
  { n: 'Toggle efek visual', k: '', f: () => { S.prefs.fx = !S.prefs.fx; LS.set('prefs', S.prefs); applyFxPref(); } },
  { n: 'Sinkronisasi cloud', k: '', f: () => { toast('Sinkronisasi', 'Menarik data dari Supabase...'); pull(); } },
  { n: 'Buka pengaturan', k: ',', f: openSettings }
];
let palSel = 0, palList = COMMANDS;
function renderPal() {
  const q = $('#palInput').value.toLowerCase(); palList = COMMANDS.filter(c => c.n.toLowerCase().includes(q)); palSel = clamp(palSel, 0, Math.max(0, palList.length - 1));
  $('#palList').innerHTML = palList.map((c, i) => `<div class="pal-item ${i === palSel ? 'sel' : ''}" data-i="${i}"><span>${esc(c.n)}</span>${c.k ? `<span class="kbd">${esc(c.k)}</span>` : ''}</div>`).join('') || '<div class="empty">Tidak ada perintah.</div>';
}
function openPal() { openM('palette'); $('#palInput').value = ''; palSel = 0; renderPal(); setTimeout(() => $('#palInput').focus(), 30); }

/* ---------- Wire up ---------- */
function bind() {
  $('#nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) switchTab(b.dataset.tab); });
  document.addEventListener('click', e => {
    const g = e.target.closest('[data-goto]'); if (g) switchTab(g.dataset.goto);
    if (e.target.closest('[data-close]') || e.target.classList.contains('overlay')) closeM();
    const a = e.target.closest('[data-act]');
    if (a) {
      const p = S.products.find(x => x.id === a.dataset.id); if (!p) return;
      if (a.dataset.act === 'edit') openProd(p); else if (a.dataset.act === 'del') delProd(p.id);
      else { $('#sProd').value = S.products.indexOf(p); $('#sHookIn').value = p.hook; $('#phProd').textContent = p.name; generate(false); switchTab('script'); }
    }
    const ch = e.target.closest('[data-char]'); if (ch) { S.charId = ch.dataset.char; save(); renderStudio(); }
    const hk = e.target.closest('[data-hook]'); if (hk) { $('#segHook').value = hk.dataset.hook; analyzeScript(); setCaption(hk.dataset.hook); toast('Hook dipakai', 'Hook diganti dengan variasi pilihan.'); }
    const ld = e.target.closest('[data-load]'); if (ld) { const s = S.scripts.find(x => x.id === ld.dataset.load); if (s) { setSegs(s); toast('Naskah dimuat', s.product); } }
    const rm = e.target.closest('[data-rm]'); if (rm) { S.scripts = S.scripts.filter(x => x.id !== rm.dataset.rm); save(); renderScriptLib(); }
    const qa = e.target.closest('[data-q]'); if (qa) queueAction(qa.dataset.q, qa.dataset.id);
    const pi = e.target.closest('.pal-item'); if (pi) { closeM(); palList[+pi.dataset.i]?.f(); }
  });
  $('#angles').addEventListener('click', e => { const b = e.target.closest('.angle'); if (!b) return; S.angle = b.dataset.a; $$('.angle').forEach(x => x.classList.toggle('active', x === b)); generate(false); });
  $('#btnPalette').onclick = openPal; $('#btnSettings').onclick = openSettings; $('#btnCycle').onclick = runCycle;
  $('#sbBadge').onclick = () => { toast('Sinkronisasi', 'Menarik data...'); S.sb ? pull() : initSb(); };
  $('#btnClearLog').onclick = () => { $('#terminalLog').innerHTML = ''; S.log = []; log('[SYSTEM] Log dibersihkan', 'c-cyan'); };
  $('#btnExportLog').onclick = () => download('nexcreator-log.txt', S.log.join('\n'));
  ['rVid', 'rViews', 'rPrice', 'rComm', 'rCtr', 'rCvr'].forEach(id => $('#' + id).addEventListener('input', calcRoi));
  ['fSearch', 'fCat', 'fSort'].forEach(id => $('#' + id).addEventListener('input', renderHunter));
  $('#btnAddProd').onclick = () => openProd(); $('#formProd').onsubmit = saveProd;
  $('#btnCsvExport').onclick = exportCsv; $('#btnCsvImport').onclick = () => $('#csvFile').click();
  $('#csvFile').onchange = e => { const f = e.target.files[0]; if (!f) return; if (f.size > 1e6) return toast('File terlalu besar', 'Maks 1 MB', true); const r = new FileReader(); r.onload = () => importCsv(String(r.result)); r.readAsText(f); e.target.value = ''; };
  $('#sProd').onchange = () => { const p = curProd(); $('#sHookIn').value = p.hook; $('#phProd').textContent = p.name; generate(false); };
  $('#btnGen').onclick = () => generate(true); $('#btnSaveScript').onclick = saveScript; $('#btnHookLab').onclick = hookLab;
  $('#sDur').onchange = analyzeScript;
  $$('[data-seg]').forEach(t => t.addEventListener('input', analyzeScript));
  $('#btnCopyScript').onclick = () => { navigator.clipboard?.writeText(fullText()); toast('Tersalin', 'Naskah ada di clipboard.'); };
  $('#btnSpeakScript').onclick = () => { switchTab('studio'); setTimeout(() => playSim(), 200); };
  $('#btnAddChar').onclick = () => openM('mChar');
  $('#formChar').onsubmit = e => { e.preventDefault(); const c = { id: uid(), name: $('#chName').value.trim(), role: $('#chRole').value.trim(), img: safeUrl($('#chImg').value.trim()) || SEED_CHARS[0].img, pitch: 1 }; S.chars.push(c); S.charId = c.id; save(); closeM(); renderStudio(); toast('Persona ditambahkan', c.name); e.target.reset(); };
  ['vRate', 'vPitch'].forEach(id => $('#' + id).addEventListener('input', updVoiceLbls));
  $('#capStyle').onchange = () => setCaption(segs().hook);
  $('#stAccount').onchange = () => { $('#phHandle').textContent = $('#stAccount').value; };
  $('#btnPlay').onclick = () => playSim(); $('#btnQueue').onclick = sendQueue;
  $('#btnExportPack').onclick = () => { download('nexcreator-production-pack.json', JSON.stringify(packJson(), null, 2), 'application/json'); toast('Paket diunduh', 'JSON siap untuk pipeline render.'); };
  $('#qFilter').onchange = renderQueue; $('#btnRefresh').onclick = () => { S.sb ? pull() : renderQueue(); toast('Refresh', 'Antrean diperbarui.'); };
  $('#btnCopyTg').onclick = () => { navigator.clipboard?.writeText(tgText()); toast('Tersalin', 'Laporan di clipboard.'); }; $('#btnSendTg').onclick = sendTg;
  $('#btnSaveCfg').onclick = saveSettings; $('#btnSeed').onclick = seed;
  $('#btnReset').onclick = () => { if (confirm('Hapus semua data lokal NexCreator?')) { Object.keys(localStorage).filter(k => k.startsWith('nex4_')).forEach(k => localStorage.removeItem(k)); location.reload(); } };
  [['swFx', 'fx'], ['swSnd', 'snd'], ['swAuto', 'auto']].forEach(([id, k]) => $('#' + id).onclick = e => { S.prefs[k] = !S.prefs[k]; e.currentTarget.classList.toggle('on', S.prefs[k]); if (k === 'fx') applyFxPref(); });
  $('#palInput').addEventListener('input', () => { palSel = 0; renderPal(); });
  $('#palInput').addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { palSel = Math.min(palSel + 1, palList.length - 1); renderPal(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { palSel = Math.max(palSel - 1, 0); renderPal(); e.preventDefault(); }
    else if (e.key === 'Enter') { closeM(); palList[palSel]?.f(); }
  });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPal(); return; }
    if (e.key === 'Escape') { closeM(); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
    const i = '123456'.indexOf(e.key); if (i >= 0) switchTab(TABS[i]);
  });
  addEventListener('hashchange', () => switchTab(location.hash.slice(1), false));
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;
  addEventListener('beforeunload', () => 'speechSynthesis' in window && speechSynthesis.cancel());
}

/* ---------- Boot ---------- */
function clock() { $('#clock').textContent = new Date().toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' }); }
window.addEventListener('DOMContentLoaded', async () => {
  const lines = ['loading neural core...', 'linking supabase grid...', 'calibrating voice synth...', 'system online.'];
  let li = 0; const bt = setInterval(() => { $('#bootText').textContent = lines[Math.min(++li, lines.length - 1)]; }, 420);
  applyFxPref(); initFx(); icons(); bind(); clock(); setInterval(clock, 1000);
  renderPipe(); renderKpis(); calcRoi(); renderHunter(); fillScriptProducts(); renderScriptLib(); generate(false); renderStudio(); renderQueue(); renderTg(); setupAuto();
  setTimeout(() => { clearInterval(bt); $('#boot').classList.add('done'); renderChart(); }, 1700);
  const start = location.hash.slice(1); switchTab(TABS.includes(start) ? start : 'command', false);
  log('[BOOT] NexCreator AI v4.0 online', 'c-grn');
  await initSb();
});
})();
