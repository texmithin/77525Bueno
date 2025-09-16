import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  thumbnail: String,
  code: { type: String, unique: true },
  stock: Number,
  status: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

export const Product = mongoose.model('Product', productSchema);