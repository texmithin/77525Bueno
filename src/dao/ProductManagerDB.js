import { Product } from '../models/Product.model.js';

export class ProductManagerDB {
  async getProducts({ limit = 10, page = 1, sort, query }) {
    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: 'i' } },
            { status: query === 'available' ? true : false }
          ]
        }
      : {};

    const options = {
      page,
      limit,
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined,
      lean: true
    };

    return await Product.paginate(filter, options);
  }

  async getProductById(pid) {
    return await Product.findById(pid);
  }

  async addProduct(productData) {
    return await Product.create(productData);
  }

  async updateProduct(pid, updatedData) {
    return await Product.findByIdAndUpdate(pid, updatedData, { new: true });
  }

  async deleteProduct(pid) {
    return await Product.findByIdAndDelete(pid);
  }
}
