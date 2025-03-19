const mongoose = require('mongoose');

// Definir el esquema de la compra
const purchaseSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' }
});

// Crear el modelo
const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
