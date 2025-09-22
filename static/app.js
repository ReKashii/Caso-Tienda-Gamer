// ===========================
// DATA
// ===========================
const PRODUCTS = [
  { id:'JM001', cat:'Juegos de Mesa', title:'Catan', price:29990, origin:'Devir (Chile)',
    img:'https://images.unsplash.com/photo-1580234745536-2ee2b5a3c17a?q=80&w=800&auto=format&fit=crop',
    desc:'Juego de estrategia para 3-4 jugadores.' },
  { id:'JM002', cat:'Juegos de Mesa', title:'Carcassonne', price:19990, origin:'Z-Man / Asmodee',
    img:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
    desc:'Construye ciudades y caminos con tus losetas.' },
  { id:'JM003', cat:'Juegos de Mesa', title:'Dixit', price:24990, origin:'Libellud',
    img:'https://images.unsplash.com/photo-1601493701043-00a3d8f7a4e2?q=80&w=800&auto=format&fit=crop',
    desc:'Creatividad y deducción con cartas ilustradas.' },
  { id:'CO002', cat:'Consolas', title:'Xbox Series X', price:529990, origin:'Microsoft',
    img:'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=800&auto=format&fit=crop',
    desc:'Compatible con Xbox y PC.' },
  { id:'AC002', cat:'Accesorios', title:'Auriculares HyperX Cloud II', price:79990, origin:'HP / HyperX',
    img:'https://images.unsplash.com/photo-1518449007433-8f1b0bcd8b59?q=80&w=800&auto=format&fit=crop',
    desc:'Sonido envolvente y micrófono desmontable.' },
  { id:'CO001', cat:'Consolas', title:'PlayStation 5', price:549990, origin:'Sony',
    img:'https://images.unsplash.com/photo-1606813902835-5c6d8d3a4c2f?q=80&w=800&auto=format&fit=crop',
    desc:'Consola de última generación.' },
  { id:'CG001', cat:'Computadores Gamers', title:'PC Gamer ASUS ROG Strix', price:1299990, origin:'ASUS',
    img:'https://images.unsplash.com/photo-1611078480013-3b8e0f2f7d2a?q=80&w=800&auto=format&fit=crop',
    desc:'Rendimiento para gamers exigentes.' },
  { id:'SG001', cat:'Sillas Gamers', title:'Secretlab Titan', price:299990, origin:'Secretlab',
    img:'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?q=80&w=800&auto=format&fit=crop',
    desc:'Ergonómica para largas sesiones.' },
  { id:'PO001', cat:'Poleras', title:'Polera Gamer (Personalizable)', price:14990, origin:'Textil local',
    img:'https://images.unsplash.com/photo-1520975698511-1d1ecb6b8f6f?q=80&w=800&auto=format&fit=crop',
    desc:'Polera personalizable con gamer tag.' }
];

const productMap = new Map(PRODUCTS.map(p => [p.id, p]));

// ===========================
// STATE
// ===========================
let state = {
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  reviews: JSON.parse(localStorage.getItem('reviews') || '[]'),
  currentList: null
};
const CLP_PER_POINT = 50;
const REFERRAL_BONUS = 100;

function appliedKey(){ return 'appliedPoints:'+(state.currentUser?.email || 'guest'); }
if (state.appliedPoints == null) {
  state.appliedPoints = parseInt(localStorage.getItem(appliedKey()) || '0', 10) || 0;
}

// ===========================
// HELPERS
// ===========================
const money = n => '$' + Math.round(n).toLocaleString('es-CL') + ' CLP';
const el = id => document.getElementById(id);
function isDuocEmail(email){ return /@duoc\.cl\s*$/i.test(email || ''); }
function esc(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function userHasPurchasedProduct(user, pid){
  const orders = user?.orders || [];
  return orders.some(o => (o.items||[]).some(it => it.id===pid));
}
function calcLevel(points){
  if (points >= 200) return 'Maestro';
  if (points >= 100) return 'Experto';
  if (points >= 40) return 'Avanzado';
  if (points >= 10) return 'Intermedio';
  return 'Novato';
}
function computeTotals(){
  const subtotal = state.cart.reduce((s,i)=>{
    const p = productMap.get(i.id); return s + (p ? p.price * i.qty : 0);
  },0);
  const isDuoc = state.currentUser && isDuocEmail(state.currentUser.email);
  const duocDiscount = isDuoc ? Math.round(subtotal * 0.20) : 0;
  const availablePoints = state.currentUser ? (state.currentUser.points || 0) : 0;
  const applied = Math.max(0, Math.min(state.appliedPoints || 0, availablePoints));
  const maxRedeemableCLP = Math.max(0, subtotal - duocDiscount);
  const pointsDiscount = Math.min(applied * CLP_PER_POINT, maxRedeemableCLP);
  const total = Math.max(0, subtotal - duocDiscount - pointsDiscount);
  return { subtotal, duocDiscount, pointsDiscount, total, applied, availablePoints, isDuoc };
}
function paintTotals(prefix=''){
  const t = computeTotals();
  const get = s=>document.getElementById(s+prefix);
  const sub=get('cart-subtotal'), duocL=get('line-duoc'), duoc=get('cart-duoc'), ptsL=get('line-points'), pts=get('cart-points-discount'), tot=get('cart-total'), disp=get('points-available'), inp=get('apply-points');
  if (sub) sub.textContent = money(t.subtotal);
  if (duocL) duocL.hidden = !(t.duocDiscount>0);
  if (duoc) duoc.textContent = money(t.duocDiscount);
  if (ptsL) ptsL.hidden = !(t.pointsDiscount>0);
  if (pts)  pts.textContent = money(t.pointsDiscount);
  if (tot)  tot.textContent = money(t.total);
  if (disp) disp.textContent = t.availablePoints;
  if (inp)  inp.value = t.applied || 0;
}

// ===========================
// INIT
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  if (el('filter-category')) populateCategories();
  if (el('product-grid')) {
    state.currentList = PRODUCTS;
    renderProducts(state.currentList);
  }
  updateCartUI();
  if (el('reviews-list')) renderLatestReviews();
  if (el('points')) el('points').textContent = state.currentUser ? (state.currentUser.points || 0) : 0;
  if (el('level')) el('level').textContent = calcLevel(state.currentUser ? (state.currentUser.points || 0) : 0);
  if (el('blog-teasers')) renderBlogTeasers();
  if (location.hash.startsWith('#p=')) {
    const pid = location.hash.split('=')[1]; if (pid) openModal(pid);
  }
  if (location.pathname.endsWith('/profile.html')) initProfilePage();
  if (location.pathname.endsWith('/blog.html')) initBlogPage();
});

// ===========================
// CATEGORIES
// ===========================
function populateCategories(){
  const cats = Array.from(new Set(PRODUCTS.map(p => p.cat)));
  const sel = el('filter-category');
  cats.forEach(c=>{
    const o=document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o);
  });
}

// ===========================
// RENDER PRODUCTS
// ===========================
function getAvgRating(pid){
  const rs = state.reviews.filter(r=>r.productId===pid);
  if (rs.length===0) return 0;
  return rs.reduce((s,r)=>s+r.stars,0)/rs.length;
}

function renderProducts(list){
  const grid = el('product-grid'); if (!grid) return;
  grid.innerHTML = '';
  if (list.length===0){ grid.innerHTML = '<div class="muted">No se encontraron productos</div>'; return; }

  list.forEach(p=>{
    const avg = getAvgRating(p.id);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${esc(p.title)}" loading="lazy" decoding="async" width="320" height="200">
      <div class="meta">
        <div>
          <strong>${esc(p.title)}</strong>
          <div class="muted small">${esc(p.cat)}</div>
          <div class="muted small">Origen: ${esc(p.origin || '—')}</div>
          <div class="stars small">${'★'.repeat(Math.round(avg))}${'☆'.repeat(5-Math.round(avg))} <span class="muted">(${avg.toFixed(1)})</span></div>
        </div>
        <div class="price">${money(p.price)}</div>
      </div>
      <div class="actions">
        <button class="btn" onclick="openModal('${p.id}')">Ver</button>
        <button class="btn primary" onclick="addToCart('${p.id}')">Agregar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===========================
// SEARCH/FILTERS
// ===========================
if (el('searchBtn')) el('searchBtn').addEventListener('click', applySearch);
if (el('filter-category')) el('filter-category').addEventListener('change', applySearch);
if (el('sort')) el('sort').addEventListener('change', doSort);
if (el('btn-apply-price')) el('btn-apply-price').addEventListener('click', applySearch);
if (el('btn-clear-price')) el('btn-clear-price').addEventListener('click', ()=>{
  if (el('min-price')) el('min-price').value='';
  if (el('max-price')) el('max-price').value='';
  if (el('filter-min-rating')) el('filter-min-rating').value='0';
  applySearch();
});

function applySearch(){
  const q = (el('search')?.value||'').trim().toLowerCase();
  const cat = el('filter-category')?.value || '';
  const minP = parseInt(el('min-price')?.value||'0',10) || 0;
  const maxP = parseInt(el('max-price')?.value||'0',10) || 0;
  const minR = parseInt(el('filter-min-rating')?.value||'0',10) || 0;

  state.currentList = PRODUCTS.filter(p=>{
    const hit = (p.title+' '+p.desc).toLowerCase().includes(q);
    const okCat = !cat || p.cat===cat;
    const okMin = !minP || p.price>=minP;
    const okMax = !maxP || p.price<=maxP;
    const avg = getAvgRating(p.id);
    const okRat = avg >= minR;
    return hit && okCat && okMin && okMax && okRat;
  });
  renderProducts(state.currentList);
}

function doSort(e){
  const v = e.target.value;
  const arr = [...(state.currentList||PRODUCTS)];
  if (v==='price-asc') arr.sort((a,b)=>a.price-b.price);
  if (v==='price-desc') arr.sort((a,b)=>b.price-a.price);
  if (v==='name-asc') arr.sort((a,b)=>a.title.localeCompare(b.title));
  renderProducts(arr);
}

// ===========================
// CART
// ===========================
function updateCartUI(){
  if (el('cart-count')) el('cart-count').textContent = state.cart.reduce((s,i)=>s+i.qty,0);
  const list = el('cart-items'); if (list){
    list.innerHTML='';
    if (state.cart.length===0){ list.innerHTML='<div class="muted">Tu carrito está vacío</div>'; paintTotals(''); }
    state.cart.forEach(it=>{
      const p = productMap.get(it.id);
      const div = document.createElement('div'); div.className='cart-row';
      div.innerHTML = `
        <div style="display:flex;gap:8px;align-items:center">
          <img src="${p.img}" style="width:56px;height:40px;object-fit:cover;border-radius:6px" loading="lazy">
          <div><strong>${esc(p.title)}</strong><div class="muted small">${money(p.price)}</div></div>
        </div>
        <div style="text-align:right">
          <input type="number" min="1" value="${it.qty}" style="width:60px" onchange="changeQty('${it.id}', this.value)">
          <div style="margin-top:6px"><button class="btn" onclick="removeFromCart('${it.id}')">Eliminar</button></div>
        </div>`;
      list.appendChild(div);
    });
  }
  paintTotals('');
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function addToCart(id){
  const found = state.cart.find(i=>i.id===id);
  if (found) found.qty += 1; else state.cart.push({id, qty:1});
  if (state.currentUser){
    state.currentUser.points = (state.currentUser.points||0) + 5;
    saveUsers();
    updateProfileBadge();
  }
  updateCartUI();
  alert('Producto añadido al carrito');
}
function removeFromCart(id){ state.cart = state.cart.filter(i=>i.id!==id); updateCartUI(); }
function changeQty(id, qty){ const it=state.cart.find(i=>i.id===id); if(!it) return; it.qty=Math.max(1,parseInt(qty)); updateCartUI(); }

// Slide cart
const cartSlide = el('cart-slide'), cartList = el('cart-list'), cartTotalSlide = el('cart-total-slide');
if (el('btn-cart')) el('btn-cart').addEventListener('click', ()=>{ cartSlide.classList.add('show'); cartSlide.setAttribute('aria-hidden','false'); renderCartSlide(); });
if (el('cart-close-slide')) el('cart-close-slide').addEventListener('click', ()=>{ cartSlide.classList.remove('show'); cartSlide.setAttribute('aria-hidden','true'); });
function renderCartSlide(){
  if (!cartList) return;
  cartList.innerHTML='';
  if(state.cart.length===0){ cartList.innerHTML='<div class="muted">Tu carrito está vacío</div>'; paintTotals('-slide'); return; }
  state.cart.forEach(it=>{
    const p=productMap.get(it.id);
    const div=document.createElement('div'); div.className='cart-item';
    div.innerHTML=`
      <img src="${p.img}" alt="${esc(p.title)}" loading="lazy">
      <div class="cart-item-info">
        <strong>${esc(p.title)}</strong>
        <div>Cantidad: <input type="number" min="1" value="${it.qty}" style="width:50px" onchange="changeQtySlide('${it.id}', this.value)"></div>
        <div>Subtotal: ${money(p.price*it.qty)}</div>
      </div>
      <button class="btn" onclick="removeFromCartSlide('${it.id}')">Eliminar</button>`;
    cartList.appendChild(div);
  });
  if (cartTotalSlide){ const t=computeTotals(); cartTotalSlide.textContent=money(t.total); }
  paintTotals('-slide');
}
function removeFromCartSlide(id){ removeFromCart(id); renderCartSlide(); }
function changeQtySlide(id, qty){ changeQty(id, qty); renderCartSlide(); }

// Points apply/clear
if (el('btn-apply-points')) el('btn-apply-points').addEventListener('click', ()=>{
  const n = parseInt(el('apply-points')?.value||'0',10)||0;
  state.appliedPoints = Math.max(0,n);
  localStorage.setItem(appliedKey(), state.appliedPoints);
  updateCartUI(); renderCartSlide();
});
if (el('btn-clear-points')) el('btn-clear-points').addEventListener('click', ()=>{
  state.appliedPoints = 0; localStorage.setItem(appliedKey(),0);
  if (el('apply-points')) el('apply-points').value=0; updateCartUI(); renderCartSlide();
});
if (el('btn-apply-points-slide')) el('btn-apply-points-slide').addEventListener('click', ()=>{
  const n = parseInt(el('apply-points-slide')?.value||'0',10)||0;
  state.appliedPoints = Math.max(0,n);
  localStorage.setItem(appliedKey(), state.appliedPoints);
  renderCartSlide(); updateCartUI();
});
if (el('btn-clear-points-slide')) el('btn-clear-points-slide').addEventListener('click', ()=>{
  state.appliedPoints = 0; localStorage.setItem(appliedKey(),0);
  if (el('apply-points-slide')) el('apply-points-slide').value=0; renderCartSlide(); updateCartUI();
});

// Checkout
function handleCheckout(){
  if (state.cart.length===0){ alert('Tu carrito está vacío'); return; }
  const { subtotal, duocDiscount, pointsDiscount, total, applied, availablePoints } = computeTotals();
  if (state.currentUser && applied>0){
    const used = Math.min(applied, Math.floor(pointsDiscount/CLP_PER_POINT), availablePoints);
    state.currentUser.points = Math.max(0, (state.currentUser.points||0) - used);
  }
  if (state.currentUser){
    state.currentUser.points = (state.currentUser.points||0) + Math.floor(total / 1000);
    const order = { id: 'O'+Date.now(), date: new Date().toISOString(), items: state.cart.map(c=>({id:c.id, qty:c.qty, price: productMap.get(c.id)?.price||0})), total };
    state.currentUser.orders = state.currentUser.orders || [];
    state.currentUser.orders.unshift(order);
    saveUsers();
    updateProfileBadge();
  }
  state.cart = []; state.appliedPoints=0; localStorage.setItem(appliedKey(),0);
  updateCartUI(); renderCartSlide();
  alert(
    `¡Compra realizada!\n\n`+
    `Subtotal: ${money(subtotal)}\n`+
    (duocDiscount?`DUOC -20%: -${money(duocDiscount)}\n`:'')+
    (pointsDiscount?`Canje puntos: -${money(pointsDiscount)}\n`:'')+
    `Total pagado: ${money(total)}`
  );
}
if (el('checkout')) el('checkout').addEventListener('click', handleCheckout);
if (el('checkout-slide')) el('checkout-slide').addEventListener('click', handleCheckout);

// ===========================
// MODAL PRODUCTO (+ reviews + compartir)
// ===========================
function openModal(id){
  const p = productMap.get(id); if (!p) return;
  const avg = getAvgRating(id);
  if (el('modal-left')) el('modal-left').innerHTML = `<img src="${p.img}" style="width:100%;border-radius:10px" alt="${esc(p.title)}" loading="lazy">`;
  if (el('modal-right')) el('modal-right').innerHTML = `
    <h3>${esc(p.title)}</h3>
    <p class="muted">${esc(p.cat)}</p>
    <p>${esc(p.desc)}</p>
    <p class="muted small">Origen: ${esc(p.origin||'—')}</p>
    <p class="price">${money(p.price)}</p>
    <div class="stars">Rating: ${'★'.repeat(Math.round(avg))}${'☆'.repeat(5-Math.round(avg))} <span class="muted small">(${avg.toFixed(1)})</span></div>
    <div class="actions" style="margin-top:8px">
      <button class="btn primary" onclick="addToCart('${p.id}')">Agregar al carrito</button>
      <button class="btn" onclick="shareProduct('${p.id}')">Compartir</button>
    </div>
    <hr style="border-color:rgba(255,255,255,.08)">
    <h4>Reseñas</h4>
    <div id="product-reviews"></div>
    <form id="product-review-form" class="review-form" data-pid="${p.id}" style="margin-top:10px">
      <label>Calificación
        <select id="pr-stars">
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="3">★★★☆☆ (3)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="1">★☆☆☆☆ (1)</option>
        </select>
      </label>
      <label>Comentario
        <textarea id="pr-text" rows="3" placeholder="Escribe tu opinión..."></textarea>
      </label>
      <button class="btn primary" type="submit">Publicar</button>
    </form>`;

  renderProductReviews(id);
  el('modal').classList.add('show'); el('modal').setAttribute('aria-hidden','false');
  location.hash = '#p='+id;
}
if (el('modal-close')) el('modal-close').addEventListener('click', closeModal);
function closeModal(){ el('modal').classList.remove('show'); el('modal').setAttribute('aria-hidden','true'); history.replaceState(null,'',location.pathname+location.search); }

function shareProduct(id){
  const p = productMap.get(id);
  const url = location.origin + location.pathname + '#p=' + id;
  if (navigator.share){
    navigator.share({ title: p.title, text: 'Revisa este producto en Level-Up Gamer', url });
  } else {
    navigator.clipboard?.writeText(url);
    alert('Link copiado: '+url);
  }
}

function renderProductReviews(pid){
  const wrap = el('product-reviews'); if (!wrap) return;
  const list = state.reviews.filter(r=>r.productId===pid);
  wrap.innerHTML = list.length? '' : '<div class="muted small">Aún no hay reseñas</div>';
  list.forEach(r=>{
    const div=document.createElement('div'); div.className='review';
    div.innerHTML = `
      <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      <div>${esc(r.text)}</div>
      <div class="muted small">por ${esc(r.userName)} ${r.verified?'<span class="chip">Comprador verificado</span>':''}</div>`;
    wrap.appendChild(div);
  });
}

document.addEventListener('submit', (e)=>{
  if (e.target && e.target.id === 'product-review-form'){
    e.preventDefault();
    if (!state.currentUser){ alert('Debes iniciar sesión para reseñar.'); return; }
    const pid = e.target.dataset.pid;
    const stars = parseInt(el('pr-stars').value,10);
    const text = el('pr-text').value.trim();
    if (!text){ alert('Escribe un comentario.'); return; }
    const verified = userHasPurchasedProduct(state.currentUser, pid);
    state.reviews.push({ productId: pid, stars, text, userEmail: state.currentUser.email, userName: state.currentUser.name, verified, ts: Date.now() });
    localStorage.setItem('reviews', JSON.stringify(state.reviews));
    el('pr-text').value='';
    renderProductReviews(pid);
    renderProducts(state.currentList||PRODUCTS);
  }
});

function renderLatestReviews(){
  const cont = el('reviews-list'); if (!cont) return;
  const list = [...state.reviews].sort((a,b)=>b.ts-a.ts).slice(0,6);
  cont.innerHTML = list.length? '' : '<div class="muted">Aún no hay reseñas</div>';
  list.forEach(r=>{
    const p = productMap.get(r.productId);
    const div=document.createElement('div'); div.className='review';
    div.innerHTML = `
      <div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      <div>${esc(r.text)}</div>
      <div class="muted small">en ${esc(p?.title||'Producto')} • por ${esc(r.userName)} ${r.verified?'<span class="chip">Comprador verificado</span>':''}</div>`;
    cont.appendChild(div);
  });
}

// ===========================
// AUTH
// ===========================
if (el('btn-login')) el('btn-login').addEventListener('click', ()=>{
  document.getElementById('login-modal').classList.add('show');
});
['login-cancel','login-x'].forEach(id=>{
  if (el(id)) el(id).addEventListener('click', ()=> document.getElementById('login-modal').classList.remove('show'));
});
if (el('go-register')) el('go-register').addEventListener('click', (e)=>{
  e.preventDefault(); document.getElementById('login-modal').classList.remove('show'); document.getElementById('register-modal').classList.add('show');
});
['register-cancel','register-x','back-login'].forEach(id=>{
  if (el(id)) el(id).addEventListener('click', (e)=>{
    if (id==='back-login') e.preventDefault();
    document.getElementById('register-modal').classList.toggle('show');
    document.getElementById('login-modal').classList.toggle('show');
  });
});

if (el('login-form')) el('login-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const found = state.users.find(u=>u.email===email && u.pass===pass);
  if (!found){ alert('Correo o contraseña incorrectos.'); return; }
  state.currentUser = found; state.currentUser.isDuoc = isDuocEmail(state.currentUser.email);
  saveUsers(); updateProfileBadge(); updateCartUI(); renderCartSlide(); document.getElementById('login-modal').classList.remove('show'); alert('Sesión iniciada correctamente.');
});

if (el('register-form-modal')) el('register-form-modal').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('regm-name').value.trim();
  const email= document.getElementById('regm-email').value.trim();
  const age  = parseInt(document.getElementById('regm-age').value,10);
  const pass = document.getElementById('regm-pass').value;
  const ref  = document.getElementById('regm-ref').value.trim();
  if (!name || !email || !age || !pass){ alert('Completa todos los campos.'); return; }
  if (age < 18){ alert('Debes ser mayor de 18 años.'); return; }
  if (state.users.some(u=>u.email===email)){ alert('Ese correo ya está registrado.'); return; }
  const user = { name, email, pass, age, code: generateCode(), points: 0, ref, orders: [] };
  const referidor = state.users.find(u=>u.code===ref);
  if (referidor && referidor.email!==email){ referidor.points = (referidor.points||0) + REFERRAL_BONUS; }
  state.users.push(user); state.currentUser = user; state.currentUser.isDuoc = isDuocEmail(state.currentUser.email);
  saveUsers(); updateProfileBadge(); updateCartUI(); renderCartSlide(); document.getElementById('register-modal').classList.remove('show'); alert('Cuenta creada. Sesión iniciada.');
});

if (el('btn-logout')) el('btn-logout').addEventListener('click', ()=>{
  state.currentUser = null; saveUsers(); updateProfileBadge(); alert('Sesión cerrada.');
});
function updateProfileBadge(){
  if (el('points')) el('points').textContent = state.currentUser ? (state.currentUser.points || 0) : 0;
  if (el('level')) el('level').textContent = calcLevel(state.currentUser ? (state.currentUser.points || 0) : 0);
}
function generateCode(){ return 'LU'+Math.random().toString(36).substring(2,8).toUpperCase(); }
function saveUsers(){ localStorage.setItem('users', JSON.stringify(state.users)); localStorage.setItem('currentUser', JSON.stringify(state.currentUser)); }

// ===========================
// PROFILE PAGE LOGIC
// ===========================
function initProfilePage(){
  if (!state.currentUser){ alert('Debes iniciar sesión.'); location.href = './index.html#home'; return; }
  el('pf-name').value = state.currentUser.name || '';
  el('pf-email').value = state.currentUser.email || '';
  el('pf-age').value = state.currentUser.age || 18;
  const cats = Array.from(new Set(PRODUCTS.map(p=>p.cat)));
  const pf = el('pf-prefs'); cats.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; pf.appendChild(o); });
  (state.currentUser.prefs||[]).forEach(v=>{ [...pf.options].forEach(opt=>{ if (opt.value===v) opt.selected=true; }); });
  renderOrders();
  const rc = el('rec-category'); [''].concat(cats).forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c||'Todas'; rc.appendChild(o); });
  renderRecommendations();
  el('profile-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    state.currentUser.name = el('pf-name').value.trim();
    const newEmail = el('pf-email').value.trim();
    state.currentUser.email = newEmail;
    state.currentUser.isDuoc = isDuocEmail(newEmail);
    state.currentUser.age = parseInt(el('pf-age').value,10)||state.currentUser.age;
    const sel = [...el('pf-prefs').selectedOptions].map(o=>o.value);
    state.currentUser.prefs = sel;
    saveUsers();
    alert('Perfil actualizado');
  });
  el('rec-apply').addEventListener('click', renderRecommendations);
  el('rec-clear').addEventListener('click', ()=>{
    el('rec-category').value=''; el('rec-min').value=''; el('rec-max').value=''; renderRecommendations();
  });
}

function renderOrders(){
  const wrap = el('orders'); wrap.innerHTML='';
  const orders = state.currentUser?.orders||[];
  if (!orders.length){ wrap.innerHTML='<div class="muted">Aún no tienes pedidos</div>'; return; }
  orders.forEach(o=>{
    const div=document.createElement('div'); div.className='order';
    const items = (o.items||[]).map(it=>{
      const p=productMap.get(it.id); return `${esc(p?.title||it.id)} × ${it.qty}`;
    }).join(', ');
    div.innerHTML = `<div><strong>#${o.id}</strong> — ${new Date(o.date).toLocaleString('es-CL')}</div>
                     <div class="muted small">${items}</div>
                     <div><strong>${money(o.total)}</strong></div>`;
    wrap.appendChild(div);
  });
}

function renderRecommendations(){
  const bought = new Set((state.currentUser?.orders||[]).flatMap(o=>(o.items||[]).map(it=>it.id)));
  const cat = el('rec-category').value;
  const min = parseInt(el('rec-min').value||'0',10)||0;
  const max = parseInt(el('rec-max').value||'0',10)||0;
  const prefs = state.currentUser?.prefs || [];
  let list = PRODUCTS.filter(p=>!bought.has(p.id));
  if (cat) list = list.filter(p=>p.cat===cat);
  if (min) list = list.filter(p=>p.price>=min);
  if (max) list = list.filter(p=>p.price<=max);
  if (prefs.length) list = list.filter(p=>prefs.includes(p.cat));
  const grid = el('rec-grid'); grid.innerHTML='';
  if (!list.length){ grid.innerHTML='<div class="muted">No hay recomendaciones con los filtros actuales</div>'; return; }
  list.forEach(p=>{
    const card=document.createElement('div'); card.className='card';
    card.innerHTML=`
      <img src="${p.img}" alt="${esc(p.title)}" loading="lazy">
      <div class="meta">
        <div><strong>${esc(p.title)}</strong><div class="muted small">${esc(p.cat)}</div></div>
        <div class="price">${money(p.price)}</div>
      </div>
      <div class="muted small">Origen: ${esc(p.origin||'—')}</div>
      <div class="actions"><button class="btn" onclick="location.href='./index.html#p=${p.id}'">Ver</button><button class="btn primary" onclick="addToCart('${p.id}')">Agregar</button></div>`;
    grid.appendChild(card);
  });
}

// ===========================
// BLOG
// ===========================
const BLOG = [
  { id:'b1', title:'Cómo elegir tu primer juego de mesa', excerpt:'Mecánicas básicas y recomendaciones para empezar.' },
  { id:'b2', title:'Armar un PC Gamer balanceado 2025', excerpt:'CPU, GPU y cuellos de botella: guía práctica.' },
  { id:'b3', title:'Sillas gamers: salud y ergonomía', excerpt:'Consejos para jugar cómodo por horas.' }
];
function renderBlogTeasers(){
  const wrap = el('blog-teasers'); if (!wrap) return;
  wrap.innerHTML = '';
  BLOG.slice(0,3).forEach(p=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML = `<div class="meta"><div><strong>${esc(p.title)}</strong><div class="muted">${esc(p.excerpt)}</div></div></div>`;
    wrap.appendChild(d);
  });
}
function initBlogPage(){
  const list = el('blog-list'); if (!list) return;
  BLOG.forEach(p=>{
    const d=document.createElement('div'); d.className='card';
    d.innerHTML = `<div class="meta"><div><strong>${esc(p.title)}</strong><div class="muted">${esc(p.excerpt)}</div></div></div>`;
    list.appendChild(d);
  });
}
