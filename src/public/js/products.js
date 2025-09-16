(async () => {
  async function ensureCart() {
    let cid = localStorage.getItem('cid');
    if (!cid) {
      const res = await fetch('/api/carts', { method: 'POST' });
      const data = await res.json();
      cid = data?.payload?._id;
      localStorage.setItem('cid', cid);
    }
    return cid;
  }

  document.addEventListener('click', async (e) => {
    if (e.target.matches('.add-to-cart')) {
      const pid = e.target.dataset.id;
      const cid = await ensureCart();
      const res = await fetch(`/api/carts/${cid}/products/${pid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      if (res.ok) alert('Producto agregado al carrito');
      else alert('No se pudo agregar');
    }
  });
})();
