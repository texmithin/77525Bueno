import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: '' },
  code: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true, index: true },
  status: { type: Boolean, default: true, index: true },
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);
export const Product = mongoose.model('Product', productSchema, 'products');

