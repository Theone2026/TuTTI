import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { users } from './userController.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";

// Ruta para login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos" });
  }

  const user = users.find((u) => u.email === email);

  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({ message: "Login exitoso", token });
    } else {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
  } else {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// Ruta para registro
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos" });
  }

  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    return res.status(409).json({ message: "El correo ya está registrado" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  users.push({ email, password: hashedPassword });

  return res.status(201).json({ message: "Usuario registrado exitosamente" });
});

export default router;
