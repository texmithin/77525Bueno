import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  stock: Number,
  category: String
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

export const Product = mongoose.model('Product', productSchema);