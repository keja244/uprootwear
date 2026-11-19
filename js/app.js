/* Uprootwear - prototipe web thrift (statis). Semua data tersimpan di browser (localStorage). */
(function () {
'use strict';

const DATA = window.UW_DATA;
const stores = DATA.stores, products = DATA.products;
const byId = {}, storeById = {};
products.forEach(p => byId[p.id] = p);
stores.forEach(s => storeById[s.id] = s);

/* ---------- util ---------- */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rp = n => 'Rp' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const mem = {};
const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); if (v != null) return JSON.parse(v); } catch (e) {} return k in mem ? mem[k] : d; },
  set(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const ago = h => h < 24 ? h + ' jam lalu' : Math.floor(h / 24) + ' hari lalu';
const fmtDate = t => new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ', ' + new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- ikon ---------- */
const P = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const I = {
  shirt: P('<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z"/>'),
  pants: P('<path d="M7 3h10l1.5 18h-4.6L12 9.5 10.1 21H5.5z"/><path d="M7 7h10"/>'),
  dress: P('<path d="M9 2h6l.7 6.5-2.2 2.8L19 22H5l5.5-10.7-2.2-2.8z"/>'),
  jacket: P('<path d="m8 3-5 3 2 5 3-1v11h8V10l3 1 2-5-5-3-2 2.5h-4z"/><path d="M12 5.5V21"/>'),
  shoe: P('<path d="M3 17c0-3.5 1.8-5 3.8-6L9 6l3 3.2c2.3 1.2 5.8 1.1 8 3.3V17z"/><path d="M3 20h18"/>'),
  bag: P('<path d="M5 8h14l1 13H4z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>'),
  glasses: P('<circle cx="6.5" cy="14" r="3.5"/><circle cx="17.5" cy="14" r="3.5"/><path d="M10 14h4M3 14l1-5M21 14l-1-5"/>'),
  star: P('<path d="m12 3 2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7z"/>'),
  home: P('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
  search: P('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  cart: P('<path d="M3 4h2l2.4 11h10.2l2-8H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>'),
  user: P('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>'),
  back: P('<path d="m15 5-7 7 7 7"/>'),
  x: P('<path d="M6 6l12 12M18 6 6 18"/>'),
  sliders: P('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
  trash: P('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  plus: P('<path d="M12 5v14M5 12h14"/>'),
  minus: P('<path d="M5 12h14"/>'),
  check: P('<path d="m5 12 5 5 9-10"/>'),
  store: P('<path d="M4 9l1-5h14l1 5M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M10 20v-6h4v6"/>'),
  box: P('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>'),
  pin: P('<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  out: P('<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>'),
  edit: P('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
  reset: P('<path d="M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4"/>')
};
const CAT = {
  Atasan:   { bg: '#dfe8ff', fg: '#2457d6', ic: 'shirt' },
  Bawahan:  { bg: '#fde3ec', fg: '#d9568a', ic: 'pants' },
  Dress:    { bg: '#f1e6fb', fg: '#8a5cc2', ic: 'dress' },
  Outerwear:{ bg: '#dcecef', fg: '#3a7480', ic: 'jacket' },
  Sepatu:   { bg: '#fde9d8', fg: '#c0653a', ic: 'shoe' },
  Tas:      { bg: '#e2f2de', fg: '#3f8a4f', ic: 'bag' },
  Aksesori: { bg: '#fcf0cf', fg: '#a97a0c', ic: 'glasses' },
  Anak:     { bg: '#ffe4e0', fg: '#d1503f', ic: 'star' }
};
const CATS = Object.keys(CAT);
const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'Free Size', 'Anak 2-4 Th', 'Anak 5-7 Th', 'Anak 8-10 Th', 'EU 38', 'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'];
const CONDS = ['Seperti baru', 'Bagus', 'Layak pakai'];
const SHIP = { reg: { label: 'Reguler', fee: 10000, eta: 'Tiba 3-5 hari kerja' }, exp: { label: 'Express', fee: 22000, eta: 'Tiba 1-2 hari kerja' } };
const PAY = [
  { g: 'Transfer Bank', id: 'bca', label: 'BCA Virtual Account', va: '8277' },
  { g: 'Transfer Bank', id: 'mandiri', label: 'Mandiri Virtual Account', va: '8890' },
  { g: 'Transfer Bank', id: 'bni', label: 'BNI Virtual Account', va: '8810' },
  { g: 'E-Wallet', id: 'gopay', label: 'GoPay', wallet: true },
  { g: 'E-Wallet', id: 'ovo', label: 'OVO', wallet: true },
  { g: 'E-Wallet', id: 'dana', label: 'DANA', wallet: true },
  { g: 'Bayar di Tempat', id: 'cod', label: 'COD (bayar ke kurir)', cod: true }
];
const STATUS = ['Menunggu Pembayaran', 'Dikemas', 'Dikirim', 'Selesai'];
const NEXT_LABEL = ['Simulasikan pembayaran berhasil', 'Simulasikan pesanan dikirim', 'Simulasikan pesanan diterima'];

/* ---------- state (localStorage) ---------- */
const K = { users: 'uw.users', session: 'uw.session', carts: 'uw.carts', orders: 'uw.orders', stock: 'uw.stock' };
const users = () => ls.get(K.users, []);
function seedDemo() {
  const u = users();
  if (!u.find(x => x.email === 'demo@uprootwear.id')) {
    u.push({ id: 'u_demo', name: 'Dina Pratiwi', email: 'demo@uprootwear.id', password: 'demo123', phone: '081234567890',
      addresses: [{ id: 'a_demo', label: 'Rumah', name: 'Dina Pratiwi', phone: '081234567890', street: 'Jl. Gatot Subroto No. 45', city: 'Medan', postal: '20112' }] });
    ls.set(K.users, u);
  }
}
const me = () => { const id = ls.get(K.session, null); return id ? users().find(u => u.id === id) || null : null; };
function saveMe(patch) { const all = users(); const i = all.findIndex(u => u.id === (me() || {}).id); if (i >= 0) { Object.assign(all[i], patch); ls.set(K.users, all); } }
const stockMap = () => ls.get(K.stock, {});
const stockOf = id => { const m = stockMap(); return id in m ? m[id] : byId[id].stock; };
const cartAll = () => ls.get(K.carts, {});
const cart = () => { const u = me(); return u ? (cartAll()[u.id] || []).filter(i => byId[i.pid]) : []; };
function saveCart(items) { const u = me(); if (!u) return; const a = cartAll(); a[u.id] = items; ls.set(K.carts, a); }
const cartCount = () => cart().reduce((a, i) => a + i.qty, 0);
const orders = () => ls.get(K.orders, []);
const firstName = u => (u.name || '').trim().split(/\s+/)[0] || 'Kamu';

/* ---------- komponen kecil ---------- */
const initials = n => n.split(/\s+/).filter(w => /[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const avatar = (st, size) => `<span class="avatar" style="--s:${size}px;background:${st.color}">${esc(initials(st.name))}<img src="images/stores/${st.id}.jpg" alt="" loading="lazy" onerror="this.remove()"></span>`;
function thumb(p, cls) {
  const c = CAT[p.cat], left = stockOf(p.id);
  const badge = left <= 0 ? '<b class="badge sold">Habis</b>' : left <= 2 ? `<b class="badge low">Sisa ${left}</b>` : '';
  return `<div class="thumb ${cls || ''}" style="--ph:${c.bg};--phf:${c.fg}"><span class="ph">${I[c.ic]}<small>${esc(p.cat)}</small></span><img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy" onerror="this.remove()">${badge}</div>`;
}
function card(p) {
  const st = storeById[p.store];
  return `<article class="card">
    <a class="card-store" href="#/toko/${st.id}">${avatar(st, 30)}<span><b>${esc(st.name)}</b><small>${ago(p.added)}</small></span></a>
    <a class="card-link" href="#/produk/${p.id}">${thumb(p)}
      <div class="card-body"><h3>${esc(p.name)}</h3><p class="price">${rp(p.price)}</p>
      <div class="mini"><span>${esc(p.size)}</span><span>${esc(p.cond)}</span></div></div></a></article>`;
}
const empty = (icon, title, text, btn) => `<div class="empty"><i>${I[icon]}</i><h2>${esc(title)}</h2><p>${esc(text)}</p>${btn || ''}</div>`;
const backbar = title => `<div class="backbar"><button type="button" data-act="back" aria-label="Kembali">${I.back}</button><h1>${esc(title)}</h1></div>`;
const gate = (icon, title, text) => ({ key: 'profil', html: empty(icon, title, text, '<button class="btn primary" data-act="open-auth">Masuk atau daftar</button>') });
const notFound = () => ({ key: '', html: empty('search', 'Halaman tidak ditemukan', 'Produk atau halaman yang kamu cari tidak ada.', '<a class="btn primary" href="#/">Ke beranda</a>') });

/* ---------- filter ---------- */
const LIST_KEYS = ['cat', 'size', 'brand', 'cond'];
function parseFilters(p) {
  const f = { q: (p.get('q') || '').trim(), sort: p.get('sort') || 'new', toko: p.get('toko') || '', min: p.get('min') ? +p.get('min') : null, max: p.get('max') ? +p.get('max') : null };
  LIST_KEYS.forEach(k => f[k] = (p.get(k) || '').split(',').filter(Boolean));
  return f;
}
function buildQS(f) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  LIST_KEYS.forEach(k => f[k] && f[k].length && p.set(k, f[k].join(',')));
  if (f.min != null && !isNaN(f.min)) p.set('min', f.min);
  if (f.max != null && !isNaN(f.max)) p.set('max', f.max);
  if (f.sort && f.sort !== 'new') p.set('sort', f.sort);
  if (f.toko) p.set('toko', f.toko);
  return p.toString();
}
function applyFilters(list, f) {
  const toks = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  let out = list.filter(p => {
    if (toks.length) {
      const hay = (p.name + ' ' + p.brand + ' ' + p.cat + ' ' + p.size + ' ' + storeById[p.store].name).toLowerCase();
      if (!toks.every(t => hay.includes(t))) return false;
    }
    if (f.cat.length && !f.cat.includes(p.cat)) return false;
    if (f.size.length && !f.size.includes(p.size)) return false;
    if (f.brand.length && !f.brand.includes(p.brand)) return false;
    if (f.cond.length && !f.cond.includes(p.cond)) return false;
    if (f.min != null && !isNaN(f.min) && p.price < f.min) return false;
    if (f.max != null && !isNaN(f.max) && p.price > f.max) return false;
    if (f.toko && p.store !== f.toko) return false;
    return true;
  });
  const s = f.sort;
  out.sort((a, b) => s === 'low' ? a.price - b.price : s === 'high' ? b.price - a.price : a.added - b.added);
  return out;
}
const activeCount = f => f.cat.length + f.size.length + f.brand.length + f.cond.length + ((f.min != null && !isNaN(f.min)) || (f.max != null && !isNaN(f.max)) ? 1 : 0);
function facets() {
  const sizes = [...new Set(products.map(p => p.size))].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
  let brands = [...new Set(products.map(p => p.brand))].sort((a, b) => a.localeCompare(b));
  brands = brands.filter(b => b !== 'Tanpa Merek').concat(brands.includes('Tanpa Merek') ? ['Tanpa Merek'] : []);
  return { sizes, brands };
}
function filterForm(f, ctx) {
  const fc = facets();
  const chips = (name, vals) => vals.map(v => `<label class="chip"><input type="checkbox" name="${name}" value="${esc(v)}" ${f[name].includes(v) ? 'checked' : ''}><span>${esc(v)}</span></label>`).join('');
  return `<form class="filters" data-form="filter" data-ctx="${ctx}">
    <input type="hidden" name="q" value="${esc(f.q)}"><input type="hidden" name="sort" value="${esc(f.sort)}"><input type="hidden" name="toko" value="${esc(f.toko)}">
    <div class="fgroup"><h4>Kategori</h4><div class="chips">${chips('cat', CATS)}</div></div>
    <div class="fgroup"><h4>Ukuran</h4><div class="chips">${chips('size', fc.sizes)}</div></div>
    <div class="fgroup"><h4>Harga</h4><div class="pricerow"><input type="number" inputmode="numeric" min="0" step="1000" name="min" placeholder="Rp min" value="${f.min != null && !isNaN(f.min) ? f.min : ''}" aria-label="Harga minimum"><input type="number" inputmode="numeric" min="0" step="1000" name="max" placeholder="Rp maks" value="${f.max != null && !isNaN(f.max) ? f.max : ''}" aria-label="Harga maksimum"></div></div>
    <div class="fgroup"><h4>Merek</h4><div class="chips scroll">${chips('brand', fc.brands)}</div></div>
    <div class="fgroup"><h4>Kondisi</h4><div class="chips">${chips('cond', CONDS)}</div></div>
    <div class="factions"><button type="button" class="btn outline" data-act="filter-reset">Reset</button><button class="btn primary" type="submit">Terapkan</button></div>
  </form>`;
}

/* ---------- views ---------- */
function viewHome() {
  const newest = products.slice().sort((a, b) => a.added - b.added);
  const cheap = products.filter(p => p.price <= 50000 && stockOf(p.id) > 0).sort((a, b) => a.added - b.added).slice(0, 10);
  return { key: 'home', html: `
    <section class="hero"><h1>Thrift pilihan, harga bersahabat.</h1>
      <p>Fashion preloved dari ${stores.length} toko. Setiap barang dipilih satu per satu dan stoknya terbatas.</p>
      <a class="tagbtn" href="#/cari">Mulai belanja</a></section>
    <section class="sec"><div class="sec-h"><h2>Kategori</h2></div><div class="cats">
      ${CATS.map(c => `<a class="cat" href="#/cari?cat=${encodeURIComponent(c)}" style="--bg:${CAT[c].bg};--fg:${CAT[c].fg}"><i>${I[CAT[c].ic]}</i>${c}</a>`).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h2>Toko pilihan</h2></div><div class="hscroll">
      ${stores.map(s => `<a class="storecard" href="#/toko/${s.id}">${avatar(s, 52)}<b>${esc(s.name)}</b><small>${esc(s.city)}</small><small><span class="star">&#9733;</span> ${s.rating.toFixed(1)}</small></a>`).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h2>Di bawah Rp50.000</h2><a href="#/cari?max=50000">Lihat semua</a></div>
      <div class="hscroll">${cheap.map(p => `<div class="hitem">${card(p)}</div>`).join('')}</div></section>
    <section class="sec"><div class="sec-h"><h2>Baru ditambahkan</h2><a href="#/cari">Lihat semua</a></div>
      <div class="grid">${newest.slice(0, 12).map(card).join('')}</div></section>
    ${footer()}` };
}
function footer() {
  return `<footer class="foot"><img src="assets/logo.png" alt="Uprootwear"><p>Uprootwear adalah prototipe untuk demo. Produk, toko, dan transaksi di sini hanya simulasi.</p></footer>`;
}

function viewSearch(params) {
  const f = parseFilters(params);
  const list = applyFilters(products, f);
  const n = activeCount(f);
  const tags = [];
  LIST_KEYS.forEach(k => f[k].forEach(v => tags.push(`<button class="tag" data-act="rm-filter" data-k="${k}" data-v="${esc(v)}">${esc(v)}${I.x}</button>`)));
  if ((f.min != null && !isNaN(f.min)) || (f.max != null && !isNaN(f.max))) {
    const t = f.min != null && f.max != null ? `${rp(f.min)} - ${rp(f.max)}` : f.min != null ? `Min ${rp(f.min)}` : `Maks ${rp(f.max)}`;
    tags.push(`<button class="tag" data-act="rm-filter" data-k="price">${t}${I.x}</button>`);
  }
  if (f.toko && storeById[f.toko]) tags.push(`<button class="tag" data-act="rm-filter" data-k="toko">Toko: ${esc(storeById[f.toko].name)}${I.x}</button>`);
  const catLink = c => `#/cari?${buildQS(Object.assign({}, f, { cat: c ? [c] : [] }))}`;
  const only = f.cat.length === 1 ? f.cat[0] : '';
  return { key: 'cari', html: `
    <div class="searchpage">
      <aside class="side" aria-label="Filter">${filterForm(f, 'side')}</aside>
      <div class="results">
        <div class="hscroll catbar"><a class="chipl ${only ? '' : 'on'}" href="${catLink('')}">Semua</a>${CATS.map(c => `<a class="chipl ${only === c ? 'on' : ''}" href="${catLink(c)}">${c}</a>`).join('')}</div>
        <div class="toolbar"><p><b>${list.length}</b> produk${f.q ? ` untuk "${esc(f.q)}"` : ''}</p>
          <div class="tb-r"><select class="select" data-change="sort" aria-label="Urutkan"><option value="new" ${f.sort === 'new' ? 'selected' : ''}>Terbaru</option><option value="low" ${f.sort === 'low' ? 'selected' : ''}>Harga terendah</option><option value="high" ${f.sort === 'high' ? 'selected' : ''}>Harga tertinggi</option></select>
          <button class="btn outline sm only-mobile" data-act="filter-open">${I.sliders}Filter${n ? ' (' + n + ')' : ''}</button></div></div>
        ${tags.length ? `<div class="tags">${tags.join('')}</div>` : ''}
        ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : empty('search', 'Produk tidak ditemukan', 'Coba kata kunci lain atau kurangi filter yang aktif.', '<a class="btn primary" href="#/cari">Hapus semua filter</a>')}
      </div></div>${footer()}`, q: f.q };
}

function viewProduct(id) {
  const p = byId[id]; if (!p) return notFound();
  const st = storeById[p.store], left = stockOf(id), c = CAT[p.cat];
  const same = products.filter(x => x.store === p.store && x.id !== id).slice(0, 8);
  const alike = products.filter(x => x.cat === p.cat && x.store !== p.store && x.id !== id && stockOf(x.id) > 0).slice(0, 8);
  const sc = left <= 0 ? 'out' : left <= 2 ? 'low' : '';
  const dis = left <= 0 ? 'disabled' : '';
  return { key: 'produk', nav: false, html: `
    ${backbar('Detail produk')}
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Beranda</a><span>/</span><a href="#/cari?cat=${encodeURIComponent(p.cat)}">${esc(p.cat)}</a><span>/</span><span>${esc(p.name)}</span></nav>
    <div class="pd">
      <div>${thumb(p, 'big')}</div>
      <div class="pd-info">
        <h1>${esc(p.name)}</h1>
        <p class="pd-price">${rp(p.price)}</p>
        <span class="stockline ${sc}">${left <= 0 ? 'Stok habis' : left <= 2 ? 'Tinggal ' + left + ' lagi' : 'Stok tersedia: ' + left}</span>
        <div class="facts"><div><small>Ukuran</small><b>${esc(p.size)}</b></div><div><small>Kondisi</small><b>${esc(p.cond)}</b></div><div><small>Merek</small><b>${esc(p.brand)}</b></div><div><small>Kategori</small><b>${esc(p.cat)}</b></div></div>
        <h2 style="font-size:16px">Deskripsi</h2><p class="pd-desc">${esc(p.desc)}</p>
        <a class="storebox" href="#/toko/${st.id}">${avatar(st, 48)}<span class="grow"><b>${esc(st.name)}</b><small>${esc(st.city)} &nbsp;|&nbsp; <span class="star">&#9733;</span> ${st.rating.toFixed(1)} (${st.reviews} ulasan)</small></span><span class="btn outline sm">Kunjungi</span></a>
        <div class="pd-actions"><button class="btn outline" data-act="add" data-pid="${id}" ${dis}>${I.cart}Keranjang</button><button class="btn primary" data-act="buy" data-pid="${id}" ${dis}>Beli sekarang</button></div>
      </div></div>
    ${same.length ? `<section class="sec"><div class="sec-h"><h2>Lainnya dari ${esc(st.name)}</h2><a href="#/toko/${st.id}">Lihat toko</a></div><div class="hscroll">${same.map(x => `<div class="hitem">${card(x)}</div>`).join('')}</div></section>` : ''}
    ${alike.length ? `<section class="sec"><div class="sec-h"><h2>Produk serupa</h2><a href="#/cari?cat=${encodeURIComponent(p.cat)}">Lihat semua</a></div><div class="hscroll">${alike.map(x => `<div class="hitem">${card(x)}</div>`).join('')}</div></section>` : ''}` };
}

function viewStore(id, params) {
  const st = storeById[id]; if (!st) return notFound();
  const all = products.filter(p => p.store === id);
  const q = (params.get('q') || '').trim(), cat = params.get('cat') || '';
  const list = applyFilters(all, { q, cat: cat ? [cat] : [], size: [], brand: [], cond: [], min: null, max: null, sort: 'new', toko: '' });
  const cats = CATS.filter(c => all.some(p => p.cat === c));
  const link = c => `#/toko/${id}?${new URLSearchParams(Object.assign({}, q ? { q } : {}, c ? { cat: c } : {})).toString()}`;
  return { key: 'toko', nav: true, html: `
    ${backbar(st.name)}
    <nav class="crumbs"><a href="#/">Beranda</a><span>/</span><span>${esc(st.name)}</span></nav>
    <section class="storehead"><div class="cover" style="--c:${st.color}"></div>
      <div class="inner">${avatar(st, 76)}<div class="meta"><h1>${esc(st.name)}</h1><p class="hint">@${esc(st.handle)}</p>
        <div class="stats"><span><span class="star">&#9733;</span> <b>${st.rating.toFixed(1)}</b> (${st.reviews} ulasan)</span><span>${I.pin.replace('<svg', '<svg style="width:14px;height:14px;vertical-align:-2px"')} ${esc(st.city)}</span><span><b>${all.length}</b> produk</span><span>Bergabung 2026</span></div>
        <p class="tagline">${esc(st.tagline)}</p></div></div></section>
    <form class="listbar" data-form="storesearch" data-id="${id}"><label class="searchbar" style="max-width:none">${I.search}<input name="q" type="search" value="${esc(q)}" placeholder="Cari di ${esc(st.name)}" aria-label="Cari di toko"></label></form>
    <div class="hscroll catbar"><a class="chipl ${cat ? '' : 'on'}" href="${link('')}">Semua</a>${cats.map(c => `<a class="chipl ${cat === c ? 'on' : ''}" href="${link(c)}">${c}</a>`).join('')}</div>
    <div class="toolbar"><p><b>${list.length}</b> produk</p></div>
    ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : empty('search', 'Tidak ada produk yang cocok', 'Coba kata kunci atau kategori lain di toko ini.')}
    ${footer()}` };
}

function groupByStore(items) {
  const g = {};
  items.forEach(i => { const p = byId[i.pid]; (g[p.store] = g[p.store] || []).push(i); });
  return Object.keys(g).map(sid => ({ st: storeById[sid], items: g[sid] }));
}
const subtotal = items => items.reduce((a, i) => a + byId[i.pid].price * i.qty, 0);

function viewCart() {
  if (!me()) return gate('cart', 'Masuk untuk melihat keranjang', 'Kamu bisa lihat-lihat tanpa akun. Masuk atau daftar dulu supaya barang bisa disimpan di keranjang.');
  const items = cart();
  if (!items.length) return { key: 'keranjang', html: `${backbar('Keranjang')}` + empty('cart', 'Keranjangmu masih kosong', 'Cari barang thrift yang kamu suka lalu tambahkan ke sini.', '<a class="btn primary" href="#/cari">Mulai belanja</a>') };
  const groups = groupByStore(items), sub = subtotal(items), cnt = items.reduce((a, i) => a + i.qty, 0);
  return { key: 'keranjang', html: `
    ${backbar('Keranjang')}<h1 class="page-title only-desktop">Keranjang</h1>
    <div class="cart-layout pad-bar"><div>${groups.map(g => `
      <section class="group" style="margin-bottom:14px"><a class="group-h" href="#/toko/${g.st.id}">${avatar(g.st, 28)}<span>${esc(g.st.name)}<br><small>${esc(g.st.city)}</small></span></a>
      ${g.items.map(i => { const p = byId[i.pid], left = stockOf(i.pid); return `
        <div class="ci"><a href="#/produk/${p.id}">${thumb(p, 'sm')}</a>
          <div class="info"><a href="#/produk/${p.id}"><h3>${esc(p.name)}</h3></a><span class="sub">Ukuran ${esc(p.size)}, ${esc(p.cond)}</span><b>${rp(p.price)}</b>
            <div class="bottom"><div class="stepper"><button data-act="qty" data-pid="${p.id}" data-d="-1" ${i.qty <= 1 ? 'disabled' : ''} aria-label="Kurangi">${I.minus}</button><span>${i.qty}</span><button data-act="qty" data-pid="${p.id}" data-d="1" ${i.qty >= left ? 'disabled' : ''} aria-label="Tambah">${I.plus}</button></div>
            ${i.qty >= left ? `<span class="hint">Stok maksimal ${left}</span>` : ''}<button class="iconbtn" data-act="remove" data-pid="${p.id}" aria-label="Hapus">${I.trash}</button></div></div></div>`; }).join('')}</section>`).join('')}</div>
      <aside class="sumcard"><h2>Ringkasan belanja</h2><div class="sumrow"><span>Total barang</span><span>${cnt}</span></div><div class="sumrow"><span>Subtotal</span><span>${rp(sub)}</span></div><div class="sumrow total"><span>Total</span><span>${rp(sub)}</span></div><p class="hint" style="margin:6px 0 14px">Ongkos kirim dihitung di halaman checkout.</p><a class="btn primary block" href="#/checkout">Checkout</a></aside>
    </div>
    <div class="sumbar"><div class="tot"><small>Total (${cnt} barang)</small><b>${rp(sub)}</b></div><a class="btn primary" href="#/checkout">Checkout</a></div>` };
}

function viewCheckout() {
  const u = me();
  if (!u) return gate('cart', 'Masuk untuk checkout', 'Masuk atau daftar dulu supaya pesananmu tercatat.');
  const items = cart();
  if (!items.length) return { key: 'keranjang', nav: false, html: backbar('Checkout') + empty('cart', 'Tidak ada barang untuk di-checkout', 'Tambahkan barang ke keranjang dulu.', '<a class="btn primary" href="#/cari">Mulai belanja</a>') };
  const groups = groupByStore(items), sub = subtotal(items), a0 = u.addresses[0];
  const val = k => esc(a0 ? a0[k] : (k === 'name' ? u.name : k === 'phone' ? u.phone || '' : ''));
  const fee = SHIP.reg.fee * groups.length;
  const payGroups = [...new Set(PAY.map(p => p.g))];
  return { key: 'keranjang', nav: false, html: `
    ${backbar('Checkout')}<h1 class="page-title only-desktop">Checkout</h1>
    <form id="checkoutForm" data-form="checkout" class="checkout-layout"><div>
      <section class="box"><h2>Alamat pengiriman</h2>
        <div class="field"><label for="addrSel">Pilih alamat</label><select id="addrSel" name="addrSel">${u.addresses.map(a => `<option value="${a.id}">${esc(a.label)}: ${esc(a.street)}</option>`).join('')}<option value="new" ${a0 ? '' : 'selected'}>Alamat baru</option></select></div>
        <div class="row2"><div class="field"><label for="f-name">Nama penerima</label><input id="f-name" name="name" required value="${val('name')}" autocomplete="name"></div>
        <div class="field"><label for="f-phone">No. telepon</label><input id="f-phone" name="phone" required inputmode="tel" pattern="[0-9+ ]{8,16}" title="Isi nomor telepon, contoh 081234567890" value="${val('phone')}" autocomplete="tel"></div></div>
        <div class="field"><label for="f-street">Alamat lengkap</label><input id="f-street" name="street" required value="${val('street')}" placeholder="Nama jalan, nomor, RT/RW" autocomplete="street-address"></div>
        <div class="row2"><div class="field"><label for="f-city">Kota</label><input id="f-city" name="city" required value="${val('city')}" autocomplete="address-level2"></div>
        <div class="field"><label for="f-postal">Kode pos</label><input id="f-postal" name="postal" required inputmode="numeric" pattern="[0-9]{5}" title="5 digit kode pos" value="${val('postal')}" autocomplete="postal-code"></div></div>
        <label class="checkrow"><input type="checkbox" name="saveAddr" ${a0 ? '' : 'checked'}>Simpan ke daftar alamatku</label></section>
      <section class="box"><h2>Pengiriman</h2>${Object.keys(SHIP).map((k, i) => `<label class="opt"><input type="radio" name="ship" value="${k}" ${i === 0 ? 'checked' : ''}><span class="opt-body"><span><b>${SHIP[k].label}</b><small>${SHIP[k].eta}</small></span><b>${rp(SHIP[k].fee)}</b></span></label>`).join('')}
        <p class="hint">Ongkos kirim dihitung per toko (${groups.length} toko).</p></section>
      <section class="box"><h2>Metode pembayaran</h2>${payGroups.map(g => `<p class="optgroup-t">${g}</p>${PAY.filter(p => p.g === g).map((p, i) => `<label class="opt"><input type="radio" name="pay" value="${p.id}" ${p.id === 'bca' ? 'checked' : ''}><span class="opt-body"><b>${p.label}</b></span></label>`).join('')}`).join('')}</section>
    </div>
    <aside class="sumcard" style="display:block"><h2>Ringkasan pesanan</h2>
      ${groups.map(g => `<p class="hint" style="margin-top:8px"><b style="color:var(--ink)">${esc(g.st.name)}</b></p>${g.items.map(i => { const p = byId[i.pid]; return `<div class="miniitem">${thumb(p, 'sm')}<div class="grow"><b>${esc(p.name)}</b><small>${i.qty} x ${rp(p.price)}</small></div><b>${rp(p.price * i.qty)}</b></div>`; }).join('')}`).join('')}
      <div style="margin-top:10px"><div class="sumrow"><span>Subtotal</span><span>${rp(sub)}</span></div><div class="sumrow"><span>Ongkos kirim</span><span data-ship>${rp(fee)}</span></div><div class="sumrow total"><span>Total bayar</span><span data-total>${rp(sub + fee)}</span></div></div>
      <button class="btn primary block only-desktop" type="submit" style="margin-top:14px">Buat pesanan</button></aside>
    </form>
    <div class="sumbar"><div class="tot"><small>Total bayar</small><b data-total>${rp(sub + fee)}</b></div><button class="btn primary" type="submit" form="checkoutForm">Buat pesanan</button></div>` };
}

function viewOrders() {
  const u = me(); if (!u) return gate('box', 'Masuk untuk melihat pesanan', 'Riwayat dan status pesananmu muncul di sini setelah kamu masuk.');
  const list = orders().filter(o => o.uid === u.id).sort((a, b) => b.at - a.at);
  return { key: 'pesanan', html: `<div class="orders-wrap">${backbar('Pesanan saya')}<h1 class="page-title only-desktop">Pesanan saya</h1>` +
    (list.length ? list.map(o => { const p = byId[o.items[0].pid]; const more = o.items.length - 1; return `
      <a class="ordercard" href="#/pesanan/${o.id}"><div class="top"><b>${o.id}</b><span class="pill s${o.status}">${STATUS[o.status]}</span></div>
        <div class="mid">${thumb(p, 'sm')}<div class="grow"><b>${esc(o.items[0].name)}</b>${more > 0 ? `<br><small class="hint">dan ${more} barang lainnya</small>` : ''}</div></div>
        <div class="foot"><span class="hint">${fmtDate(o.at)}</span><b>${rp(o.total)}</b></div></a>`; }).join('')
      : empty('box', 'Belum ada pesanan', 'Pesanan yang kamu buat akan tampil di sini beserta statusnya.', '<a class="btn primary" href="#/cari">Mulai belanja</a>')) + '</div>' };
}

function viewOrder(id, params) {
  const u = me(); if (!u) return gate('box', 'Masuk untuk melihat pesanan', 'Masuk dulu untuk membuka detail pesanan.');
  const o = orders().find(x => x.id === id && x.uid === u.id); if (!o) return notFound();
  const pay = PAY.find(p => p.id === o.pay) || PAY[0];
  const steps = ['Menunggu bayar', 'Dikemas', 'Dikirim', 'Selesai'];
  const va = pay.va ? pay.va + o.id.replace(/\D/g, '').padEnd(12, '0').slice(0, 12) : '';
  const groups = groupByStore(o.items.map(i => ({ pid: i.pid, qty: i.qty })));
  return { key: 'pesanan', html: `<div class="orders-wrap">${backbar('Detail pesanan')}<h1 class="page-title only-desktop">Detail pesanan</h1>
    ${params.get('baru') ? `<div class="notice">${I.check}<span>Pesanan berhasil dibuat. Terima kasih sudah belanja thrift!</span></div>` : ''}
    <section class="box"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:14px"><div><b>${o.id}</b><br><small class="hint">${fmtDate(o.at)}</small></div><span class="pill s${o.status}">${STATUS[o.status]}</span></div>
      <div class="timeline">${steps.map((s, i) => `<div class="tl ${i <= o.status ? 'done' : ''} ${i === o.status ? 'now' : ''}"><i>${i <= o.status ? I.check : ''}</i>${s}</div>`).join('')}</div>
      ${o.status === 0 ? `<div class="paybox"><small class="hint">${pay.va ? 'Bayar ke ' + esc(pay.label) : 'Selesaikan di aplikasi ' + esc(pay.label)}</small>${pay.va ? `<div class="va">${va.replace(/(\d{4})(?=\d)/g, '$1 ')}</div>` : ''}<p style="margin-top:4px">Total: <b>${rp(o.total)}</b></p></div>` : ''}
      ${o.resi ? `<div class="paybox"><small class="hint">Nomor resi (${esc(SHIP[o.ship].label)})</small><div class="va">${o.resi}</div></div>` : ''}
      ${o.status < 3 ? `<div class="demo"><small>Mode demo: status pesanan bisa dimajukan manual untuk keperluan tampilan.</small><button class="btn primary sm" data-act="order-next" data-id="${o.id}">${NEXT_LABEL[o.status]}</button></div>` : ''}</section>
    <section class="box"><h2>Barang pesanan</h2>${groups.map(g => `<p class="hint" style="margin-top:6px"><b style="color:var(--ink)">${esc(g.st.name)}</b></p>${g.items.map(i => { const p = byId[i.pid], it = o.items.find(x => x.pid === i.pid); return `<a class="miniitem" href="#/produk/${p.id}">${thumb(p, 'sm')}<div class="grow"><b>${esc(it.name)}</b><small>${it.qty} x ${rp(it.price)}</small></div><b>${rp(it.price * it.qty)}</b></a>`; }).join('')}`).join('')}</section>
    <section class="box"><h2>Pengiriman dan pembayaran</h2><p><b>${esc(o.addr.name)}</b> (${esc(o.addr.phone)})</p><p class="hint">${esc(o.addr.street)}, ${esc(o.addr.city)} ${esc(o.addr.postal)}</p><p style="margin-top:8px">${SHIP[o.ship].label}, ${SHIP[o.ship].eta.toLowerCase()}</p><p>Pembayaran: ${esc(pay.label)}</p></section>
    <section class="box"><div class="sumrow"><span>Subtotal</span><span>${rp(o.subtotal)}</span></div><div class="sumrow"><span>Ongkos kirim</span><span>${rp(o.fee)}</span></div><div class="sumrow total"><span>Total</span><span>${rp(o.total)}</span></div></section></div>` };
}

function viewProfile() {
  const u = me();
  const reset = `<div class="menu"><button data-act="reset-demo">${I.reset}Reset data demo (keranjang, pesanan, stok)</button></div>`;
  if (!u) return { key: 'profil', html: `<div class="profile-wrap">${backbar('Profil')}${empty('user', 'Kamu belum masuk', 'Masuk atau daftar untuk menyimpan keranjang, alamat, dan riwayat pesanan.', '<button class="btn primary" data-act="open-auth">Masuk atau daftar</button>')}${reset}</div>` };
  return { key: 'profil', html: `<div class="profile-wrap">${backbar('Profil')}
    <div class="profile-head"><span class="avatar" style="--s:60px;background:var(--blue)">${esc(initials(u.name) || 'U')}</span><div><h1>${esc(u.name)}</h1><p>${esc(u.email)}</p></div></div>
    <div class="menu"><a href="#/pesanan">${I.box}Pesanan saya</a><a href="#/keranjang">${I.cart}Keranjang</a></div>
    <section class="box"><h2>Data diri</h2><form data-form="profile"><div class="field"><label for="p-name">Nama</label><input id="p-name" name="name" required value="${esc(u.name)}"></div><div class="field"><label for="p-phone">No. telepon</label><input id="p-phone" name="phone" inputmode="tel" value="${esc(u.phone || '')}"></div><button class="btn primary">Simpan</button></form></section>
    <section class="box"><div class="sec-h" style="margin-bottom:4px"><h2 style="margin:0">Alamat pengiriman</h2><button class="btn soft sm" data-act="addr-new">${I.plus}Tambah</button></div>
      ${u.addresses.length ? u.addresses.map(a => `<div class="addr"><div><b>${esc(a.label)}</b>${esc(a.name)} (${esc(a.phone)})<small>${esc(a.street)}, ${esc(a.city)} ${esc(a.postal)}</small></div><div class="acts"><button class="iconbtn" data-act="addr-edit" data-id="${a.id}" aria-label="Ubah alamat">${I.edit}</button><button class="iconbtn" data-act="addr-del" data-id="${a.id}" aria-label="Hapus alamat">${I.trash}</button></div></div>`).join('') : '<p class="hint" style="padding:8px 0">Belum ada alamat tersimpan.</p>'}</section>
    <div class="menu"><button data-act="logout">${I.out}Keluar</button></div>${reset}</div>` };
}

/* ---------- sheet, toast ---------- */
let pending = null;
function openSheet(html, cls) {
  $('#overlay').innerHTML = `<div class="backdrop" data-act="sheet-close"></div><div class="sheet ${cls || ''}" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  document.body.classList.add('lock');
  const f = $('#overlay input:not([type=hidden]):not([type=checkbox])'); if (f && matchMedia('(min-width:900px)').matches) f.focus();
}
function closeSheet(keepPending) { $('#overlay').innerHTML = ''; document.body.classList.remove('lock'); if (!keepPending) pending = null; }
let toastT;
function toast(msg, link) {
  const t = $('#toast'); t.innerHTML = esc(msg) + (link ? ` <a href="${link.href}">${esc(link.label)}</a>` : '');
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2800);
}
function authHTML(tab, msg) {
  const login = tab === 'login';
  return `<div class="authlogo"><img src="assets/logo.png" alt=""><div><h3>${login ? 'Masuk ke Uprootwear' : 'Buat akun baru'}</h3><p>Perlu akun untuk memakai keranjang.</p></div></div>
  <div class="tabs"><button type="button" class="${login ? 'on' : ''}" data-act="auth-tab" data-tab="login">Masuk</button><button type="button" class="${login ? '' : 'on'}" data-act="auth-tab" data-tab="register">Daftar</button></div>
  <form data-form="${login ? 'login' : 'register'}" novalidate>
    ${login ? '' : '<div class="field"><label for="a-name">Nama lengkap</label><input id="a-name" name="name" autocomplete="name"></div>'}
    <div class="field"><label for="a-email">Email</label><input id="a-email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="nama@email.com"></div>
    <div class="field"><label for="a-pass">Password</label><input id="a-pass" name="password" type="password" autocomplete="${login ? 'current-password' : 'new-password'}" placeholder="${login ? '' : 'Minimal 6 karakter'}"></div>
    ${msg ? `<p class="err" role="alert">${esc(msg)}</p>` : ''}
    <button class="btn primary block" type="submit">${login ? 'Masuk' : 'Daftar dan masuk'}</button>
    ${login ? '<button type="button" class="btn soft block" style="margin-top:10px" data-act="demo-login">Pakai akun demo</button>' : ''}
  </form>`;
}
function openAuth(tab, msg) { openSheet(authHTML(tab || 'login', msg)); }
function requireLogin(fn) { if (me()) { fn(); return true; } pending = fn; openAuth('login'); return false; }
function afterLogin(u) {
  ls.set(K.session, u.id);
  const fn = pending; closeSheet(); updateChrome();
  toast('Halo, ' + firstName(u) + '!');
  if (fn) fn(); else render(true);
}
function addrSheet(a) {
  a = a || {};
  openSheet(`<div class="sheet-h"><h3>${a.id ? 'Ubah alamat' : 'Tambah alamat'}</h3><button class="sheet-x" data-act="sheet-close" aria-label="Tutup">${I.x}</button></div>
  <form data-form="address" data-id="${a.id || ''}">
    <div class="field"><label>Label alamat</label><input name="label" required value="${esc(a.label || 'Rumah')}"></div>
    <div class="row2"><div class="field"><label>Nama penerima</label><input name="name" required value="${esc(a.name || (me() || {}).name || '')}"></div><div class="field"><label>No. telepon</label><input name="phone" required inputmode="tel" pattern="[0-9+ ]{8,16}" value="${esc(a.phone || (me() || {}).phone || '')}"></div></div>
    <div class="field"><label>Alamat lengkap</label><input name="street" required value="${esc(a.street || '')}"></div>
    <div class="row2"><div class="field"><label>Kota</label><input name="city" required value="${esc(a.city || '')}"></div><div class="field"><label>Kode pos</label><input name="postal" required inputmode="numeric" pattern="[0-9]{5}" value="${esc(a.postal || '')}"></div></div>
    <button class="btn primary block">Simpan alamat</button></form>`);
}

/* ---------- cart ops ---------- */
function addToCart(pid, silent) {
  const left = stockOf(pid); if (left <= 0) { toast('Maaf, stok produk ini habis.'); return false; }
  const items = cart(), it = items.find(i => i.pid === pid);
  if (it) { if (it.qty >= left) { toast('Stok hanya tersisa ' + left + ', sudah ada di keranjangmu.'); return false; } it.qty++; }
  else items.push({ pid, qty: 1 });
  saveCart(items); updateChrome();
  if (!silent) toast('Ditambahkan ke keranjang', { href: '#/keranjang', label: 'Lihat' });
  return true;
}

/* ---------- router ---------- */
function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), params: new URLSearchParams(qs || '') };
}
function go(h) { if (location.hash === '#' + h) render(); else location.hash = h; }
function render(keepScroll) {
  const { parts, params } = parseHash();
  closeSheet();
  let v;
  try {
    switch (parts[0] || 'home') {
      case 'home': v = viewHome(); break;
      case 'cari': v = viewSearch(params); break;
      case 'produk': v = viewProduct(parts[1]); break;
      case 'toko': v = viewStore(parts[1], params); break;
      case 'keranjang': v = viewCart(); break;
      case 'checkout': v = viewCheckout(); break;
      case 'pesanan': v = parts[1] ? viewOrder(parts[1], params) : viewOrders(); break;
      case 'profil': v = viewProfile(); break;
      default: v = notFound();
    }
  } catch (e) { console.error(e); v = notFound(); }
  const y = window.scrollY;
  $('#view').innerHTML = v.html;
  document.body.classList.toggle('no-nav', v.nav === false);
  document.body.classList.toggle('has-nav', v.nav !== false);
  $('#q').value = v.q || '';
  updateChrome(v.key);
  if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  document.title = (v.key === 'home' ? '' : '') + 'Uprootwear | Marketplace Thrift Store';
}
let curKey = '';
function updateChrome(key) {
  if (key !== undefined) curKey = key;
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === curKey));
  const n = cartCount();
  $$('[data-cartcount]').forEach(b => { b.textContent = n; b.hidden = n < 1; });
  const u = me(); $('#acctLink').textContent = u ? firstName(u) : 'Masuk';
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act, d = el.dataset;
  switch (act) {
    case 'back': history.length > 1 ? history.back() : go('/'); break;
    case 'sheet-close': closeSheet(); break;
    case 'open-auth': openAuth('login'); break;
    case 'auth-tab': openAuth(d.tab); break;
    case 'demo-login': { const u = users().find(x => x.email === 'demo@uprootwear.id'); if (u) afterLogin(u); break; }
    case 'logout': ls.set(K.session, null); updateChrome(); toast('Kamu sudah keluar.'); go('/'); break;
    case 'add': requireLogin(() => { if (addToCart(d.pid)) render(true); }); break;
    case 'buy': requireLogin(() => { if (addToCart(d.pid, true)) go('/checkout'); }); break;
    case 'qty': { const items = cart(), it = items.find(i => i.pid === d.pid); if (!it) break; const nq = it.qty + (+d.d); if (nq < 1 || nq > stockOf(d.pid)) break; it.qty = nq; saveCart(items); updateChrome(); render(true); break; }
    case 'remove': saveCart(cart().filter(i => i.pid !== d.pid)); updateChrome(); render(true); toast('Barang dihapus dari keranjang.'); break;
    case 'filter-open': openSheet(`<div class="sheet-h"><h3>Filter produk</h3><button class="sheet-x" data-act="sheet-close" aria-label="Tutup">${I.x}</button></div>` + filterForm(parseFilters(parseHash().params), 'sheet')); break;
    case 'filter-reset': { const f = parseFilters(parseHash().params); go('/cari?' + buildQS({ q: f.q, sort: f.sort, toko: f.toko, cat: [], size: [], brand: [], cond: [], min: null, max: null })); break; }
    case 'rm-filter': {
      const f = parseFilters(parseHash().params);
      if (d.k === 'price') { f.min = null; f.max = null; } else if (d.k === 'toko') f.toko = ''; else f[d.k] = f[d.k].filter(v => v !== d.v);
      go('/cari?' + buildQS(f)); break;
    }
    case 'order-next': {
      const all = orders(), o = all.find(x => x.id === d.id); if (!o || o.status >= 3) break;
      o.status++; if (o.status === 2) o.resi = 'UW' + Date.now().toString().slice(-9) + 'ID';
      ls.set(K.orders, all); render(true); toast('Status: ' + STATUS[o.status]); break;
    }
    case 'addr-new': addrSheet(); break;
    case 'addr-edit': addrSheet((me().addresses || []).find(a => a.id === d.id)); break;
    case 'addr-del': saveMe({ addresses: me().addresses.filter(a => a.id !== d.id) }); render(true); break;
    case 'reset-demo':
      if (confirm('Reset data demo? Keranjang, pesanan, dan stok kembali seperti awal. Akun tetap tersimpan.')) {
        ls.set(K.carts, {}); ls.set(K.orders, []); ls.set(K.stock, {}); updateChrome(); render(true); toast('Data demo sudah direset.');
      } break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay .sheet')) closeSheet(); });

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.change === 'sort') { const f = parseFilters(parseHash().params); f.sort = t.value; go('/cari?' + buildQS(f)); return; }
  const form = t.closest('form');
  if (form && form.dataset.form === 'filter' && form.dataset.ctx === 'side') form.requestSubmit();
  if (form && form.dataset.form === 'checkout') {
    if (t.name === 'addrSel') {
      const a = me().addresses.find(x => x.id === t.value) || {};
      ['name', 'phone', 'street', 'city', 'postal'].forEach(k => { form.elements[k].value = a[k] || (k === 'name' ? me().name : k === 'phone' ? me().phone || '' : ''); });
      form.elements.saveAddr.checked = !a.id;
    }
    if (t.name === 'ship') {
      const groups = groupByStore(cart()), fee = SHIP[t.value].fee * groups.length, sub = subtotal(cart());
      $$('[data-ship]').forEach(x => x.textContent = rp(fee)); $$('[data-total]').forEach(x => x.textContent = rp(sub + fee));
    }
  }
});

document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-form]'); if (!form) return;
  e.preventDefault();
  const fd = new FormData(form), g = k => (fd.get(k) || '').toString().trim();
  switch (form.dataset.form) {
    case 'search': { const q = g('q'); document.activeElement && document.activeElement.blur(); go('/cari' + (q ? '?q=' + encodeURIComponent(q) : '')); break; }
    case 'storesearch': { const q = g('q'), cat = parseHash().params.get('cat'); const p = new URLSearchParams(); if (q) p.set('q', q); if (cat) p.set('cat', cat); go('/toko/' + form.dataset.id + (p.toString() ? '?' + p : '')); break; }
    case 'filter': {
      const num = k => g(k) === '' ? null : Math.max(0, +g(k));
      const f = { q: g('q'), sort: g('sort') || 'new', toko: g('toko'), min: num('min'), max: num('max') };
      LIST_KEYS.forEach(k => f[k] = fd.getAll(k));
      const wasSheet = form.dataset.ctx === 'sheet'; closeSheet(); go('/cari?' + buildQS(f)); if (wasSheet) window.scrollTo(0, 0); break;
    }
    case 'login': {
      const email = g('email').toLowerCase(), pw = g('password');
      if (!email || !pw) return openAuth('login', 'Isi email dan password.');
      const u = users().find(x => x.email === email && x.password === pw);
      if (!u) return openAuthKeep('login', 'Email atau password salah. Coba akun demo kalau belum punya akun.');
      afterLogin(u); break;
    }
    case 'register': {
      const name = g('name'), email = g('email').toLowerCase(), pw = g('password');
      if (!name || !email || !pw) return openAuthKeep('register', 'Lengkapi nama, email, dan password.');
      if (!/^\S+@\S+\.\S+$/.test(email)) return openAuthKeep('register', 'Format email belum benar.');
      if (pw.length < 6) return openAuthKeep('register', 'Password minimal 6 karakter.');
      const all = users(); if (all.find(x => x.email === email)) return openAuthKeep('login', 'Email sudah terdaftar. Silakan masuk.');
      const u = { id: 'u_' + uid(), name, email, password: pw, phone: '', addresses: [] }; all.push(u); ls.set(K.users, all); afterLogin(u); break;
    }
    case 'profile': saveMe({ name: g('name'), phone: g('phone') }); updateChrome(); render(true); toast('Profil disimpan.'); break;
    case 'address': {
      const u = me(), a = { id: form.dataset.id || 'a_' + uid(), label: g('label'), name: g('name'), phone: g('phone'), street: g('street'), city: g('city'), postal: g('postal') };
      const list = u.addresses.slice(), i = list.findIndex(x => x.id === a.id); if (i >= 0) list[i] = a; else list.push(a);
      saveMe({ addresses: list }); closeSheet(); render(true); toast('Alamat disimpan.'); break;
    }
    case 'checkout': placeOrder(fd); break;
  }
});
function openAuthKeep(tab, msg) { // tampilkan ulang sheet tanpa menghapus aksi yang tertunda
  const fn = pending; openAuth(tab, msg); pending = fn;
}

function placeOrder(fd) {
  const u = me(), items = cart(), g = k => (fd.get(k) || '').toString().trim();
  if (!items.length) return go('/keranjang');
  const bad = items.find(i => i.qty > stockOf(i.pid));
  if (bad) { toast('Stok "' + byId[bad.pid].name + '" tidak cukup. Cek keranjangmu.'); return go('/keranjang'); }
  const groups = groupByStore(items), ship = g('ship') || 'reg', pay = g('pay') || 'bca', sub = subtotal(items), fee = SHIP[ship].fee * groups.length;
  const addr = { name: g('name'), phone: g('phone'), street: g('street'), city: g('city'), postal: g('postal') };
  const d = new Date(), pad = n => String(n).padStart(2, '0');
  const id = 'UW' + String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + String(Math.floor(1000 + Math.random() * 9000));
  const method = PAY.find(p => p.id === pay);
  const order = { id, uid: u.id, at: Date.now(), status: method && method.cod ? 1 : 0, ship, pay, addr, subtotal: sub, fee, total: sub + fee,
    items: items.map(i => ({ pid: i.pid, qty: i.qty, name: byId[i.pid].name, price: byId[i.pid].price })) };
  const sm = stockMap(); items.forEach(i => { sm[i.pid] = stockOf(i.pid) - i.qty; }); ls.set(K.stock, sm);
  ls.set(K.orders, orders().concat(order));
  if (fd.get('saveAddr') && !u.addresses.some(a => a.street === addr.street && a.postal === addr.postal)) {
    saveMe({ addresses: u.addresses.concat(Object.assign({ id: 'a_' + uid(), label: u.addresses.length ? 'Alamat ' + (u.addresses.length + 1) : 'Rumah' }, addr)) });
  }
  saveCart([]); updateChrome(); go('/pesanan/' + id + '?baru=1');
}

window.addEventListener('hashchange', () => { $('#toast').classList.remove('on'); render(); });
seedDemo();
render();
})();
