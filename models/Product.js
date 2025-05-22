<<<<<<< HEAD
// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Se ref a 'User'
  category: { type: String, required: true }, // Puedes hacer esto un ref a un modelo Category si lo tienes
  image: { type: String }, // URL de la imagen (de Cloudinary)
  status: { type: String, enum: ['available', 'out_of_stock', 'archived'], default: 'available' }, // Estado del producto
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 }, // Porcentaje de descuento para ofertas
  comments: [{ // Si quieres incluir comentarios en el producto
=======
const productSchema = new mongoose.Schema({
  // ... otros campos ...
  comments: [{
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  }],
<<<<<<< HEAD
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Si quieres likes en el producto
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Actualizar 'updatedAt' en cada guardado
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product; // Exportar con ES Modules
=======
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // ... otros campos ...
});
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
