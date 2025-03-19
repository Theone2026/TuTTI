import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Inicializamos la aplicación express
const app = express();

// Clave secreta para los tokens JWT (en producción, almacénala en una variable de entorno)
const JWT_SECRET = "mi_super_secreto";

// Lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",  // Frontend en localhost
  "https://tutti-tienda-l9p1v97i6-shadow27s-projects.vercel.app",  // Frontend en producción (Vercel)
];

// Configuración de CORS
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Accept",
  preflightContinue: false, // Esto asegura que no se maneje preflight manualmente
};

// Middleware de CORS
app.use(cors(corsOptions));
app.use(express.json()); // Middleware para manejar JSON

// Manejar solicitudes OPTIONS manualmente (preflight)
app.options("*", cors(corsOptions)); // Responde a preflight requests

// Base de datos ficticia para demostración (usa una base de datos real en producción)
const users = [
  {
    email: "user@example.com",
    password: bcrypt.hashSync("123456", 10),
    fullName: "Juan Pérez",
    phoneNumber: "+1 234 567 890",
    address: "Calle Falsa 123",
    city: "Ciudad de México",
  },
];

// Ruta para manejar el login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son requeridos" });
  }

  const user = users.find((u) => u.email === email);

  if (user) {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Crear un token JWT
      const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
      return res.status(200).json({ message: "Login exitoso", token });
    } else {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }
  } else {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// Ruta para manejar el registro de nuevos usuarios
app.post("/api/register", async (req, res) => {
  const { email, password, fullName, phoneNumber, address, city } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  const existingUser = users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(400).json({ message: "El correo electrónico ya está registrado" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  users.push({ email, password: hashedPassword, fullName, phoneNumber, address, city });

  res.status(201).json({ message: "Cuenta creada con éxito" });
});

// Middleware para verificar tokens JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token no válido" });
    }
    req.user = user;
    next();
  });
};

// Ruta protegida: obtener perfil del usuario
app.get("/api/profile", authenticateToken, (req, res) => {
  const user = users.find((u) => u.email === req.user.email);

  if (user) {
    res.status(200).json({ user });
  } else {
    res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// Ruta protegida: actualizar perfil del usuario
app.post("/api/updateProfile", authenticateToken, (req, res) => {
  const { fullName, phoneNumber, address, city } = req.body;
  const user = users.find((u) => u.email === req.user.email);

  if (user) {
    user.fullName = fullName || user.fullName;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.city = city || user.city;

    res.status(200).json({ message: "Perfil actualizado con éxito" });
  } else {
    res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// Ruta para publicar un producto
app.post("/api/products", authenticate, upload.array("imagenes", 4), async (req, res) => {
  const { nombre, categoria, precio, descripcion, stock, estado, currency } = req.body;
  const imagenes = req.files;

  if (!nombre || !categoria || !precio || !descripcion || !stock || !estado || !currency || !imagenes) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  try {
    const imagePaths = imagenes.map((file) => `/uploads/${file.filename}`);
    const newProduct = new Product({
      name: nombre,
      category: categoria,
      price: parseFloat(precio),
      description: descripcion,
      stock: parseInt(stock),
      condition: estado,
      currency: currency,
      images: imagePaths,
      userId: req.userId,
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto publicado exitosamente.", product: newProduct });
  } catch (error) {
    console.error("❌ Error al publicar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta pública para verificar el servidor
app.get("/", (req, res) => {
  res.send("Servidor backend funcionando correctamente.");
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
