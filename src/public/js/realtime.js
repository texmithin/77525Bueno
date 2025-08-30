const socket = io();
const form = document.getElementById('productForm');
const productList = document.getElementById('productList');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const productData = Object.fromEntries(formData.entries());
  productData.price = parseFloat(productData.price);
  productData.stock = parseInt(productData.stock);
  productData.status = true;
  productData.thumbnails = productData.thumbnails ? [productData.thumbnails] : [];

  socket.emit('new-product', productData);
  form.reset();
});

socket.on('products-updated', (products) => {
  productList.innerHTML = '';
  products.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${p.title}</strong> - ${p.description} | $${p.price}
      <button onclick="eliminarProducto('${p.id}')">Eliminar</button>
    `;
    productList.appendChild(li);
  });
});

function eliminarProducto(id) {
  socket.emit('delete-product', id);
}