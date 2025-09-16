// managers/ProductManager.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'products.json');

export default class ProductManager {
  async _read() {
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      if (e.code === 'ENOENT') return [];
      throw e;
    }
  }

  async _write(data) {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
  }

  async getProducts() {
    return this._read();
  }

  async getProductById(id) {
    const list = await this._read();
    return list.find(p => String(p.id) === String(id)) || null;
  }

  async addProduct(productData) {
    const list = await this._read();
    const id = list.length ? (Math.max(...list.map(p => Number(p.id) || 0)) + 1) : 1;
    const newProd = { id, status: true, ...productData };
    list.push(newProd);
    await this._write(list);
    return newProd;
  }

  async updateProduct(id, update) {
    const list = await this._read();
    const idx = list.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...update, id: list[idx].id };
    await this._write(list);
    return list[idx];
  }

  async deleteProduct(id) {
    const list = await this._read();
    const newList = list.filter(p => String(p.id) !== String(id));
    await this._write(newList);
    return list.length !== newList.length;
  }
}
