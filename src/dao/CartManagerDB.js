import { Cart } from '../models/Cart.model.js';

export class CartManagerDB {
  async getCartById(id) {
    return await Cart.findById(id).populate('products.product');
  }

  async createCart() {
    return await Cart.create({});
  }

  async addProductToCart(cartId, productId) {
  const cart = await Cart.findById(cartId);
  if (!cart) throw new Error('Carrito no encontrado');

  const existingProduct = cart.products.find(p => p.product.toString() === productId);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: productId });
  }

  await cart.save();
  return cart;
}

  async deleteProductFromCart(cid, pid) {
    const cart = await Cart.findById(cid);
    cart.products = cart.products.filter(p => !p.product.equals(pid));
    await cart.save();
    return cart;
  }

  async updateCart(cid, newProducts) {
    const cart = await Cart.findById(cid);
    if (!cart) throw new Error('Carrito no encontrado');
    cart.products = newProducts;
    await cart.save();
    return cart;
  }

  async updateProductQuantity(cid, pid, quantity) {
    const cart = await Cart.findById(cid);
    const product = cart.products.find(p => p.product.equals(pid));
    if (product) {
      product.quantity = quantity;
      await cart.save();
    }
    return cart;
  }

  async deleteAllProducts(cid) {
    const cart = await Cart.findById(cid);
    cart.products = [];
    await cart.save();
    return cart;
  }
}

