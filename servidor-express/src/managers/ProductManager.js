import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configura __dirname para módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta absoluta al archivo products.json
const dataPath = path.join(__dirname, '../data/products.json');

export default class ProductManager {
  async getProducts() {
    try {
      const data = await fs.readFile(dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer products.json:', error);
      return [];
    }
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products.find(p => p.id === id);
  }

  async addProduct(product) {
    const products = await this.getProducts();
    const newProduct = {
      id: Date.now().toString(),
      ...product
    };
    products.push(newProduct);

    try {
      await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
      console.log('Producto guardado correctamente');
    } catch (error) {
      console.error('Error al guardar producto:', error);
    }

    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;
    products[index] = { ...products[index], ...updates, id };
    await fs.writeFile(dataPath, JSON.stringify(products, null, 2));
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    await fs.writeFile(dataPath, JSON.stringify(filtered, null, 2));
  }
}
