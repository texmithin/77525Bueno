import { Router } from 'express';
import { CartManagerDB } from '../dao/CartManagerDB.js';

const router = Router();
const cartManager = new CartManagerDB();

// Obtener un carrito por ID con populate
router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    res.json({ status: 'success', cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Agregar producto a carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;

  try {
    await cartManager.addProductToCart(cid, pid);
    res.redirect('/products'); // redirecciona a la vista de productos
  } catch (error) {
    res.status(500).send('Error al agregar producto al carrito: ' + error.message);
  }
});

// Eliminar producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar TODO el carrito con nuevo array de productos
router.put('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.updateCart(req.params.cid, req.body.products);
    res.json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Actualizar cantidad de un producto específico en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
   res.json({ status: 'success', cart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const clearedCart = await cartManager.clearCart(cid);
    res.json({ status: 'success', cart: clearedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  try {
    const updatedCart = await cartManager.updateCart(cid, products);
    res.json({ status: 'success', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});



export default router;