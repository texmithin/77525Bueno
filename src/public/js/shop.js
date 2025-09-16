// src/public/js/shop.js
(function () {
  const toastEl = document.getElementById('__toast');

  function showToast(msg) {
    if (!toastEl) return alert(msg);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  async function ensureCart() {
    let cid = localStorage.getItem('cid');
    if (!cid) {
      const res = await fetch('/api/carts', { method: 'POST' });
      if (!res.ok) { showToast('No se pudo crear carrito'); return null; }
      const data = await res.json();
      cid = data?.payload?._id;
      if (cid) localStorage.setItem('cid', cid);
    }
    return cid;
  }

  async function addToCart(productId, quantity = 1) {
    const cid = await ensureCart();
    if (!cid) return;

    const res = await fetch(`/api/carts/${cid}/products/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: Number(quantity) || 1 })
    });
    if (res.ok) showToast('Producto agregado al carrito ✨');
    else showToast('No se pudo agregar');
  }

  // Click en botones "Agregar al carrito"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    const pid = btn.dataset.id;
    const qtyInput = document.getElementById('qty');
    const qty = qtyInput ? Number(qtyInput.value || 1) : 1;

    addToCart(pid, qty);
  });
})();

document.addEventListener('click', async (e) => {
  const a = e.target.closest('#nav-cart');
  if (!a) return;
  e.preventDefault();
  let cid = localStorage.getItem('cid');
  if (!cid) {
    const res = await fetch('/api/carts', { method: 'POST' });
    if (!res.ok) return showToast('No se pudo crear carrito');
    const data = await res.json();
    cid = data?.payload?._id;
    if (cid) localStorage.setItem('cid', cid);
  }
  window.location.href = `/carts/${cid}`;
});