// ===========================
// DATOS DE PRODUCTOS
// ===========================
const PRODUCTS = [
  {
    id: 'JM001',
    cat: 'Juegos de Mesa',
    title: 'Catan',
    price: 29990,
    img: 'https://steamcommunity.com/sharedfiles/filedetails/?l=latam&id=3494302063&searchtext=',
    desc: 'Juego de estrategia para 3-4 jugadores.'
  },
  {
    id: 'JM002',
    cat: 'Juegos de Mesa',
    title: 'Carcassonne',
    price: 24990,
    img: 'https://images.unsplash.com/photo-1601758123927-7a7cf9d3c8b6?auto=format&fit=crop&w=800&q=60',
    desc: 'Construcción de paisajes y estrategia.'
  },
  {
    id: 'AC001',
    cat: 'Accesorios',
    title: 'Controlador Inalámbrico Xbox',
    price: 59990,
    img: 'https://images.unsplash.com/photo-1585079544961-0fec2b0a9e74?auto=format&fit=crop&w=800&q=60',
    desc: 'Compatible con Xbox y PC.'
  },
  {
    id: 'AC002',
    cat: 'Accesorios',
    title: 'Auriculares HyperX Cloud II',
    price: 79990,
    img: 'https://images.unsplash.com/photo-1599058917217-95fefddf64d7?auto=format&fit=crop&w=800&q=60',
    desc: 'Sonido envolvente y micrófono desmontable.'
  },
  {
    id: 'CO001',
    cat: 'Consolas',
    title: 'PlayStation 5',
    price: 549990,
    img: 'https://images.unsplash.com/photo-1606813902835-5c6d8d3a4c2f?auto=format&fit=crop&w=800&q=60',
    desc: 'Consola de última generación.'
  },
  {
    id: 'CG001',
    cat: 'Computadores Gamers',
    title: 'PC Gamer ASUS ROG Strix',
    price: 1299990,
    img: 'https://images.unsplash.com/photo-1611078480013-3b8e0f2f7d2a?auto=format&fit=crop&w=800&q=60',
    desc: 'Rendimiento para gamers exigentes.'
  },
  {
    id: 'SG001',
    cat: 'Sillas Gamers',
    title: 'Secretlab Titan',
    price: 349990,
    img: 'https://images.unsplash.com/photo-1605902711622-cfb43c44367b?auto=format&fit=crop&w=800&q=60',
    desc: 'Soporte lumbar y ergonomía.'
  },
  {
    id: 'MS001',
    cat: 'Mouse',
    title: 'Logitech G502 HERO',
    price: 49990,
    img: 'https://images.unsplash.com/photo-1580657011775-bf1e7a4c6c6f?auto=format&fit=crop&w=800&q=60',
    desc: 'Sensor de alta precisión.'
  },
  {
    id: 'MP001',
    cat: 'Mousepad',
    title: 'Razer Goliathus Extended',
    price: 29990,
    img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=60',
    desc: 'Mousepad amplio con RGB.'
  },
  {
    id: 'PP001',
    cat: 'Poleras Personalizadas',
    title: "Polera 'Level-Up'",
    price: 14990,
    img: 'https://images.unsplash.com/photo-1520975698511-1d1ecb6b8f6f?auto=format&fit=crop&w=800&q=60',
    desc: 'Polera personalizable con gamer tag.'
  }
];

// ===========================
// ESTADO DE LA APP
// ===========================
let state = {
  cart: JSON.parse(localStorage.getItem('cart') || '[]'),
  users: JSON.parse(localStorage.getItem('users') || '[]'),
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  reviews: JSON.parse(localStorage.getItem('reviews') || '[]')
};

// ===========================
// FUNCIONES UTILITARIAS
// ===========================
const money = n => '$' + n.toLocaleString('es-CL') + ' CLP';
const el = id => document.getElementById(id);

function generateCode() {
  return 'LU' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function saveUsers() {
  localStorage.setItem('users', JSON.stringify(state.users));
  localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
}

function calcLevel(points) {
  if (points >= 200) return 'Maestro';
  if (points >= 100) return 'Experto';
  if (points >= 40) return 'Avanzado';
  if (points >= 10) return 'Intermedio';
  return 'Novato';
}

// ===========================
// INICIALIZACIÓN
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  populateCategories();
  renderProducts(PRODUCTS);
  updateCartUI();
  renderReviews();
  updateProfileUI();

  el('points').textContent = state.currentUser ? (state.currentUser.points || 0) : 0;
  el('level').textContent = calcLevel(state.currentUser ? (state.currentUser.points || 0) : 0);
});

// ===========================
// CATEGORÍAS
// ===========================
function populateCategories() {
  const cats = Array.from(new Set(PRODUCTS.map(p => p.cat)));
  const sel = el('filter-category');

  cats.forEach(c => {
    const o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });
}

// ===========================
// RENDER PRODUCTOS
// ===========================
function renderProducts(list) {
  const grid = el('product-grid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<div class="muted">No se encontraron productos</div>';
    return;
  }

  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="meta">
        <div>
          <strong>${p.title}</strong>
          <div class="muted small">${p.cat}</div>
        </div>
        <div class="price">${money(p.price)}</div>
      </div>
      <p class="muted small">${p.desc}</p>
      <div style="margin-top:auto; display:flex; gap:8px">
        <button class="btn" onclick="openModal('${p.id}')">Ver</button>
        <button class="btn primary" onclick="addToCart('${p.id}')">Agregar</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ===========================
// BÚSQUEDA Y FILTRO
// ===========================
el('searchBtn').addEventListener('click', () => {
  const query = el('search').value.trim().toLowerCase();
  const cat = el('filter-category').value;

  let filtered = PRODUCTS.filter(p => (p.title + ' ' + p.desc).toLowerCase().includes(query));
  if (cat) filtered = filtered.filter(p => p.cat === cat);

  renderProducts(filtered);
});

el('filter-category').addEventListener('change', () => el('searchBtn').click());

el('sort').addEventListener('change', e => {
  const value = e.target.value;
  let arr = [...PRODUCTS];

  if (value === 'price-asc') arr.sort((a, b) => a.price - b.price);
  if (value === 'price-desc') arr.sort((a, b) => b.price - a.price);
  if (value === 'name-asc') arr.sort((a, b) => a.title.localeCompare(b.title));

  renderProducts(arr);
});

// ===========================
// CARRITO
// ===========================
function updateCartUI() {
  el('cart-count').textContent = state.cart.reduce((s, i) => s + i.qty, 0);

  const cartItems = el('cart-items');
  cartItems.innerHTML = '';

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div class="muted">Tu carrito está vacío</div>';
    el('cart-total').textContent = money(0);
    return;
  }

  state.cart.forEach(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    const div = document.createElement('div');
    div.className = 'cart-row';
    div.innerHTML = `
      <div style="display:flex;gap:8px;align-items:center">
        <img src="${p.img}" style="width:56px;height:40px;object-fit:cover;border-radius:6px">
        <div>
          <strong>${p.title}</strong>
          <div class="muted small">${money(p.price)}</div>
        </div>
      </div>
      <div style="text-align:right">
        <input type="number" min="1" value="${it.qty}" style="width:60px" onchange="changeQty('${it.id}', this.value)">
        <div style="margin-top:6px">
          <button class="btn" onclick="removeFromCart('${it.id}')">Eliminar</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  const total = state.cart.reduce((s, i) => s + (PRODUCTS.find(x => x.id === i.id).price * i.qty), 0);
  el('cart-total').textContent = money(total);

  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function addToCart(id) {
  const found = state.cart.find(i => i.id === id);
  if (found) found.qty++;
  else state.cart.push({ id, qty: 1 });

  if (state.currentUser) {
    state.currentUser.points = (state.currentUser.points || 0) + 5;
    saveUsers();
    updateProfileUI();
  }

  updateCartUI();
  alert('Producto añadido al carrito');
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  updateCartUI();
}

function changeQty(id, qty) {
  const it = state.cart.find(i => i.id === id);
  if (!it) return;
  it.qty = Math.max(1, parseInt(qty));
  updateCartUI();
}
// ===========================
// SLIDE LATERAL CARRITO
// ===========================
const cartSlide = el('cart-slide');
const cartList = el('cart-list');
const cartTotalSlide = el('cart-total-slide');
const btnCartHeader = el('btn-cart');
const btnCloseSlide = el('cart-close-slide');

// Abrir slide al hacer click en carrito
btnCartHeader.addEventListener('click', () => {
  renderCartSlide();
  cartSlide.classList.add('show');
  cartSlide.setAttribute('aria-hidden', 'false');
});

// Cerrar slide
btnCloseSlide.addEventListener('click', () => {
  cartSlide.classList.remove('show');
  cartSlide.setAttribute('aria-hidden', 'true');
});

// Renderizar productos del carrito
function renderCartSlide() {
  cartList.innerHTML = '';
  if(state.cart.length === 0) {
    cartList.innerHTML = `<div class="muted">Tu carrito está vacío</div>`;
    cartTotalSlide.textContent = money(0);
    return;
  }

  state.cart.forEach(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="cart-item-info">
        <strong>${p.title}</strong>
        <div>Cantidad: 
          <input type="number" min="1" value="${it.qty}" style="width:50px" onchange="changeQtySlide('${it.id}', this.value)">
        </div>
        <div>Subtotal: ${money(p.price * it.qty)}</div>
      </div>
      <button class="btn" onclick="removeFromCartSlide('${it.id}')">Eliminar</button>
    `;
    cartList.appendChild(div);
  });

  const total = state.cart.reduce((s, i) => s + (PRODUCTS.find(x => x.id === i.id).price * i.qty), 0);
  cartTotalSlide.textContent = money(total);
}

// Funciones para slide lateral
function removeFromCartSlide(id) {
  removeFromCart(id); // reutiliza tu función existente
  renderCartSlide();
}

function changeQtySlide(id, qty) {
  changeQty(id, qty); // reutiliza tu función existente
  renderCartSlide();
}

// ===========================
// PERFIL
// ===========================
function updateProfileUI() {
  if (state.currentUser) {
    el('user-name').textContent = state.currentUser.name;
    el('user-email').textContent = state.currentUser.email;
    el('user-code').textContent = state.currentUser.code;
    el('points').textContent = state.currentUser.points || 0;
    el('level').textContent = calcLevel(state.currentUser.points || 0);
  } else {
    el('user-name').textContent = 'Invitado';
    el('user-email').textContent = '-';
    el('user-code').textContent = '-';
    el('points').textContent = 0;
    el('level').textContent = 'Novato';
  }

  localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
}

// ===========================
// MODAL
// ===========================
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  el('modal-left').innerHTML = `<img src="${p.img}" style="width:100%;border-radius:10px">`;
  el('modal-right').innerHTML = `
    <h3>${p.title}</h3>
    <p class="muted">${p.cat}</p>
    <p>${p.desc}</p>
    <p class="price">${money(p.price)}</p>
    <button class="btn primary" onclick="addToCart('${p.id}')">Agregar al carrito</button>
  `;

  el('modal').classList.add('show');
  el('modal').setAttribute('aria-hidden', 'false');
}

el('modal-close').addEventListener('click', () => {
  el('modal').classList.remove('show');
  el('modal').setAttribute('aria-hidden', 'true');
});

// ===========================
// RESEÑAS
// ===========================
function renderReviews() {
  const list = el('reviews-list');
  list.innerHTML = '';

  state.reviews.forEach(r => {
    const div = document.createElement('div');
    div.className = 'review-card';
    div.innerHTML = `
      <strong>${r.name}</strong> - <span class="muted small">${r.score}/5</span>
      <p>${r.text}</p>
    `;
    list.appendChild(div);
  });
}

el('review-form').addEventListener('submit', e => {
  e.preventDefault();

  if (!state.currentUser) {
    alert('Debes iniciar sesión para dejar una reseña');
    return;
  }

  const score = parseInt(el('review-score').value);
  const text = el('review-text').value.trim();

  if (!text) return;

  state.reviews.push({
    name: state.currentUser.name,
    score,
    text
  });

  localStorage.setItem('reviews', JSON.stringify(state.reviews));
  renderReviews();
  el('review-text').value = '';
  alert('Gracias por tu reseña');
});

// --- CARRUSEL ---
const track = document.querySelector('.carousel-track');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
let currentIndex = 0;

// Lista de imágenes del carrusel (pueden ser GIFs también)
const carouselImages = [
  'https://tenor.com/sRz2Hjr6Aoj.gif',
  'https://images.unsplash.com/photo-1618354691373-d49e3b8d3e58?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1605902711622-cfb43c4437f3?auto=format&fit=crop&w=1200&q=80'
];

// Renderizamos las imágenes en el carrusel
function renderCarouselImages() {
  track.innerHTML = '';
  carouselImages.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Slide ${i+1}`;
    if(i === 0) img.classList.add('active');
    track.appendChild(img);
  });
}

renderCarouselImages();
const images = Array.from(track.children);

// Actualiza la posición del carrusel
function updateCarousel() {
  const width = images[0].clientWidth;
  track.style.transform = `translateX(-${currentIndex * width}px)`;
}

// Botones de navegación
nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel();
  resetAutoplay();
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateCarousel();
  resetAutoplay();
});

// Ajusta el carrusel al cambiar tamaño de pantalla
window.addEventListener('resize', updateCarousel);

// Autoplay automático
let autoplay = setInterval(() => {
  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel();
}, 5000);

// Reinicia autoplay al usar botones
function resetAutoplay() {
  clearInterval(autoplay);
  autoplay = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
  }, 5000);
}

// Inicializamos posición
updateCarousel();
