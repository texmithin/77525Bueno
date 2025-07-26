import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const manager = new CartManager();

// POST / - Crear carrito
router.post('/', async (req, res) => {
  const newCart = await manager.createCart();
  res.status(201).json(newCart);
});

// GET /:cid - Obtener carrito por ID
router.get('/:cid', async (req, res) => {
  const cart = await manager.getCartById(req.params.cid);
  cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

// POST /:cid/product/:pid - Agregar producto a carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const cart = await manager.addProductToCart(req.params.cid, req.params.pid);
  cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

// DELETE /:cid/product/:pid - Eliminar producto específico del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
  const cart = await manager.removeProductFromCart(req.params.cid, req.params.pid);
  cart ? res.json(cart) : res.status(404).json({ error: 'Carrito o producto no encontrado' });
});

// DELETE /:cid - Vaciar carrito completo
router.delete('/:cid', async (req, res) => {
  const cart = await manager.clearCart(req.params.cid);
  cart ? res.json({ message: 'Carrito vaciado' }) : res.status(404).json({ error: 'Carrito no encontrado' });
});

export default router;