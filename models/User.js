// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Añadido para login con username
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
<<<<<<< HEAD
  role: { type: String, enum: ['customer', 'admin', 'seller'], default: 'customer' }, // Añadido rol
  profilePicture: {
    data: Buffer,
    contentType: String // Aunque Cloudinary devuelve URLs, podrías guardar la URL aquí
  },
  // Carrito de compras para usuarios autenticados
  cart: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1, min: 1 }
  }]
=======
  profilePicture: {
    data: Buffer,
    contentType: String
  }
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
});

const User = mongoose.model("User", userSchema);

export default User; // Exportar con ES Modules