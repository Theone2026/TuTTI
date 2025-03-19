const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Crear un nuevo usuario
router.post('/users', async (req, res) => {
  const { username, email, passwordHash } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      passwordHash
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
