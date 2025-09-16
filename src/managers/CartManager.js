import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartsPath = path.join(__dirname, '../data/carts.json');

export default class CartManager {
  async getCarts() {
    try {
      const data = await fs.readFile(cartsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error leyendo carts.json:', error);
      return [];
    }
  }

  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find(c => c.id === id);
  }

  async createCart() {
    const carts = await this.getCarts();
    const newCart = {
      id: Date.now().toString(),
      products: []
    };
    carts.push(newCart);
    await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2));
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    const existing = cart.products.find(p => p.product === pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }

    await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2));
    return cart;
  }


  async removeProductFromCart(cid, pid) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    cart.products = cart.products.filter(p => p.product !== pid);

    await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2));
    return cart;
  }

  async clearCart(cid) {
    const carts = await this.getCarts();
    const cart = carts.find(c => c.id === cid);
    if (!cart) return null;

    cart.products = [];

    await fs.writeFile(cartsPath, JSON.stringify(carts, null, 2));
    return cart;
  }
}
