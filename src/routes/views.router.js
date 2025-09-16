import { Router } from 'express';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';

const router = Router();

// raíz -> redirige a /products
router.get('/', (req, res) => res.redirect('/products'));

// Listado paginado con filtros/sort
router.get('/products', async (req, res) => {
  const { page = 1, limit = 10, sort, query } = req.query;

  const filter = {};
  if (query) {
    const q = String(query).trim();
    if (/^status:(true|false)$/i.test(q)) filter.status = q.split(':')[1].toLowerCase() === 'true';
    else if (/^category:/i.test(q)) filter.category = q.split(':')[1];
    else filter.category = q;
  }

  let sortOption = {};
  if (sort && ['asc', 'desc'].includes(String(sort))) {
    sortOption = { price: sort === 'asc' ? 1 : -1 };
  }

  const result = await Product.paginate(filter, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort: sortOption,
    lean: true
  });

  const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
  const mkLink = (targetPage) => {
    if (!targetPage) return null;
    const params = new URLSearchParams();
    params.set('page', targetPage);
    params.set('limit', result.limit);
    if (sort) params.set('sort', sort);
    if (query) params.set('query', query);
    return `${baseUrl}?${params.toString()}`;
  };

  res.render('products', {
    title: 'Productos',
    products: result.docs,
    pagination: {
      totalPages: result.totalPages,
      page: result.page,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: mkLink(result.hasPrevPage ? result.prevPage : null),
      nextLink: mkLink(result.hasNextPage ? result.nextPage : null)
    },
    query,
    sort
  });
});

// Detalle del producto
router.get('/products/:pid', async (req, res) => {
  const product = await Product.findById(req.params.pid).lean();
  if (!product) return res.status(404).send('Producto no encontrado');
  res.render('productDetail', { title: product.title, product });
});

// Si el usuario entra a /carts sin ID, crea (o reutiliza) y redirige
router.get('/carts', async (req, res) => {
  const cart = await Cart.create({ products: [] });
  return res.redirect(`/carts/${cart._id}`);
});

// Vista del carrito 
router.get('/carts/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');

  const items = cart.products.map(p => ({
    _id: p.product._id,
    title: p.product.title,
    price: p.product.price,
    quantity: p.quantity,
    subtotal: p.product.price * p.quantity
  }));
  const total = items.reduce((acc, it) => acc + it.subtotal, 0);

  res.render('cartDetail', { title: `Carrito ${cart._id}`, cartId: String(cart._id), items, total });
});

export default router;




