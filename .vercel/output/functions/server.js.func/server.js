import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";

const app = express();
const JWT_SECRET = "mi_super_secreto";

// Lista de orígenes permitidos
const allowedOrigins = [
  "https://tutti-tienda.vercel.app", // Dominio de producción
  "http://localhost:3000",          // Origen local
];

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permite herramientas sin origen como Postman
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Accept",
  preflightContinue: false,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Array de usuarios simulados
const users = [
  {
    email: "test@example.com",
    password: "$2b$12$O01FDiMJVm5f8yX19eVKJWI3pz7vAPpmiXh04pKlQivb7Bs6kpr1S", // Contraseña: "Maikel12345"
  },
];

// Ruta para login
app.post("/api/login", async (req, res) => {
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
app.post("/api/register", async (req, res) => {
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

// Ruta para el perfil
app.get("/profile", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ message: "Email es requerido" });
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  return res.status(200).json({ user });
});

// Servir el archivo index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public", "index.html"));
});

// Middleware para servir archivos estáticos
app.use(express.static(path.resolve("public")));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
