const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Crear un nuevo producto
router.post('/products', async (req, res) => {
  const { name, description, price, quantity, sellerId, category } = req.body;

  try {
    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      sellerId,
      category
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
