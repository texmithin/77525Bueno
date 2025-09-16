import { Router } from 'express';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

const router = Router();

router.post('/', async (_req, res) => {
  const cart = await Cart.create({ products: [] });
  res.status(201).json({ status: 'success', payload: cart });
});

router.get('/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
  res.json({ status: 'success', payload: cart });
});

router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity = 1 } = req.body;

  const prod = await Product.findById(pid);
  if (!prod) return res.status(404).json({ status: 'error', error: 'Product not found' });

  const cart = await Cart.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

  const idx = cart.products.findIndex(p => String(p.product) === String(pid));
  if (idx >= 0) cart.products[idx].quantity += Number(quantity);
  else cart.products.push({ product: pid, quantity: Number(quantity) });

  await cart.save();
  res.json({ status: 'success', payload: cart });
});

router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await Cart.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
  cart.products = cart.products.filter(p => String(p.product) !== String(pid));
  await cart.save();
  res.json({ status: 'success', payload: cart });
});

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products = [] } = req.body;

  const ids = products.map(p => p.product);
  const found = await Product.find({ _id: { $in: ids } }, { _id: 1 }).lean();
  const setIds = new Set(found.map(f => String(f._id)));
  const allExist = ids.every(id => setIds.has(String(id)));
  if (!allExist) return res.status(400).json({ status: 'error', error: 'One or more product ids are invalid' });

  const cart = await Cart.findByIdAndUpdate(
    cid,
    { $set: { products: products.map(p => ({ product: p.product, quantity: Number(p.quantity) || 1 })) } },
    { new: true }
  );
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
  res.json({ status: 'success', payload: cart });
});

router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  if (quantity == null || Number(quantity) < 1) {
    return res.status(400).json({ status: 'error', error: 'quantity must be >= 1' });
  }

  const cart = await Cart.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });

  const idx = cart.products.findIndex(p => String(p.product) === String(pid));
  if (idx === -1) return res.status(404).json({ status: 'error', error: 'Product not in cart' });

  cart.products[idx].quantity = Number(quantity);
  await cart.save();
  res.json({ status: 'success', payload: cart });
});

router.delete('/:cid', async (req, res) => {
  const cart = await Cart.findByIdAndUpdate(req.params.cid, { $set: { products: [] } }, { new: true });
  if (!cart) return res.status(404).json({ status: 'error', error: 'Cart not found' });
  res.json({ status: 'success', payload: cart });
});

export default router;

