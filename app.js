// Data
const products = [
  { id: 1, name: "Haze Collective Hoodie Navy Blue", price: 1290, oldPrice: 1590, category: "hoodie", tag: "BEST", image: "assets/hoodie/navy.png", desc: "Essential everyday hoodie. Heavyweight cotton fleece, relaxed fit, kangaroo pocket." },
  { id: 2, name: "Haze Collective Hoodie Light Gray", price: 590, oldPrice: null, category: "hoodie", tag: "NEW", image: "assets/hoodie/light_gray.png", desc: "Boxy fit hoodie with dropped shoulders. Premium 240gsm cotton." },
];

let cart = [];
let wishlist = [];
let currentModalProduct = null;
let selectedSize = 'M';

// Render products
function renderProducts(containerId, filter = 'all') {
  const container = document.getElementById(containerId);
  let filtered = products;
  if (filter === 'hoodie') filtered = products.filter(p => p.category === 'hoodie');
  else if (filter === 'tshirt') filtered = products.filter(p => p.category === 'tshirt');
  else if (filter === 'new') filtered = products.filter(p => p.tag === 'NEW');
  else if (filter === 'sale') filtered = products.filter(p => p.oldPrice);

  container.innerHTML = filtered.map(p => `
    <div class="product-card" onclick="openModal(${p.id})">
      <div class="product-img">
        ${p.tag ? `<div class="product-tag">${p.tag}</div>` : ''}
        <img src="${p.image}" alt="${p.name}" class="product-thumb" onerror="this.style.display='none'">
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-price">
          <div class="price-left">
            ฿${p.price.toLocaleString()}
            ${p.oldPrice ? `<span class="old">฿${p.oldPrice.toLocaleString()}</span>` : ''}
          </div>

          <button class="like-btn" onclick="event.stopPropagation(); toggleWishlist(${p.id}, this)">
            <img
              src="${wishlist.includes(p.id)
                ? 'assets/icons/unfav.png'
                : 'assets/icons/fav.png'}"
              alt="Wishlist"
            >
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Navigation
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

  if (page === 'shop') renderProducts('shop-products');
  if (page === 'cart') renderCart();
}

function setCategory(el) {
  document.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
}

function filter(category, chip) {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  renderProducts('shop-products', category);
}

// Cart
function addToCart(productId, size) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1, size: size });
  }
  updateCartBadge();
  showToast('Added to cart!');
}

function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  renderCart();
}

function updateQty(productId, size, delta) {
  const item = cart.find(item => item.id === productId && item.size === size);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(productId, size);
    else renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="empty-icon"><img src="assets/icons/cart.png" alt="Cart"></div>
        <h3>Your cart is empty</h3>
        <p>Start shopping to add items!</p>
      </div>
    `;
    footer.style.display = 'none';
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-img">
          <img src="${item.image}" alt="${item.name}" class="cart-thumb" onerror="this.style.display='none'">
        </div>
        <div class="cart-info">
          <div class="cart-name">${item.name}</div>
          <div class="cart-variant">Size: ${item.size} • Qty: ${item.qty}</div>
          <div class="cart-price">฿${(item.price * item.qty).toLocaleString()}</div>
        </div>
        <div class="qty-control">
          <button onclick="updateQty(${item.id}, '${item.size}', -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="updateQty(${item.id}, '${item.size}', 1)">+</button>
        </div>
      </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    document.getElementById('cart-total').textContent = '฿' + total.toLocaleString();
    footer.style.display = 'flex';
  }

  document.getElementById('stat-orders').textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function updateCartBadge() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('nav-badge');
  if (totalQty > 0) {
    badge.style.display = 'flex';
    badge.textContent = totalQty;
  } else {
    badge.style.display = 'none';
  }
}

function checkout() {
  if (cart.length === 0) return;
  showToast('Processing checkout...');
  setTimeout(() => {
    cart = [];
    updateCartBadge();
    renderCart();
    showToast('Order placed successfully! 🎉');
  }, 1500);
}

// Wishlist
function toggleWishlist(productId, btn) {
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    btn.innerHTML = '<img src="assets/icons/fav.png" alt="Add to wishlist">';
  } else {
    wishlist.push(productId);
    btn.innerHTML = '<img src="assets/icons/unfav.png" alt="Remove from wishlist">';
    showToast('Added to wishlist!');
  }
  document.getElementById('stat-wishlist').textContent = wishlist.length;
}

// Modal
function openModal(productId) {
  const p = products.find(x => x.id === productId);
  currentModalProduct = p;
  document.getElementById('modal-img').innerHTML = `<img src="${p.image}" alt="${p.name}" class="modal-thumb" onerror="this.style.display='none'">`;
  document.getElementById('modal-title').textContent = p.name;
 document.getElementById('modal-price').innerHTML = '฿' + p.price.toLocaleString() + (p.oldPrice? ` <span style="font-size:14px;color:#999;text-decoration:line-through;">฿${p.oldPrice.toLocaleString()}</span>`: '');
  document.getElementById('modal-desc').textContent = p.desc;
  document.getElementById('modal-wishlist').innerHTML =
  wishlist.includes(productId)
    ? '<img src="assets/icons/unfav.png" alt="Not Favorite">'
    : '<img src="assets/icons/fav.png" alt="Favorite">';
  document.getElementById('product-modal').classList.add('active');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('product-modal')) {
    document.getElementById('product-modal').classList.remove('active');
  }
}

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = btn.textContent;
}

function toggleModalWishlist() {
  if (!currentModalProduct) return;
  const btn = document.getElementById('modal-wishlist');
  const idx = wishlist.indexOf(currentModalProduct.id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    btn.innerHTML = '<img src="assets/icons/fav.png" alt="Add to wishlist">';
  } else {
    wishlist.push(currentModalProduct.id);
    btn.innerHTML = '<img src="assets/icons/unfav.png" alt="Remove from wishlist">';
    showToast('Added to wishlist!');
  }
  document.getElementById('stat-wishlist').textContent = wishlist.length;
  renderProducts('home-products');
  renderProducts('shop-products');
}

function addFromModal() {
  if (currentModalProduct) {
    addToCart(currentModalProduct.id, selectedSize);
    closeModal();
  }
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Init
renderProducts('home-products');
renderProducts('shop-products');