import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

// Configuración de ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Cadena de conexión a MongoDB Atlas
const mongoURI =
  "mongodb+srv://Tutti:Maikelfox@cluster0.uw1mo.mongodb.net/TuTTI?retryWrites=true&w=majority&appName=Cluster0";

// Conexión a MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Conectado a MongoDB"))
  .catch((err) => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

// Configuración de CORS
const allowedOrigins = [
  "http://localhost:5500", // Frontend
  "http://localhost:3000", // Backend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("No permitido por CORS"));
    }
  },
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Accept",
};

app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// Configuración de Multer para subir archivos
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Nombre único para cada archivo
  },
});

const upload = multer({ storage: storage });

// Esquemas de Mongoose
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  profilePicture: { type: String, default: "/img/default-avatar.png" }, // Añadir campo para la foto de perfil
});

const User = mongoose.model("User", userSchema);

const validTokensSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" }, // Expira en 1 hora
});

const ValidToken = mongoose.model("ValidToken", validTokensSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String }], // Array de URLs de imágenes
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  datePosted: { type: Date, default: Date.now },
  isOnSale: { type: Boolean, default: false }, // Nuevo campo para ofertas
  originalPrice: { type: Number }, // Precio original (opcional)
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Agregamos este campo
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  }],
  currency: { type: String, required: true }, // Añadir campo para la moneda
  stock: { type: Number, required: true }, // Añadir campo para el stock
  status: { type: String, default: "active" }, // Añadir campo para el estado del producto
});

const Product = mongoose.model("Product", productSchema);

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, default: 1 },
  dateAdded: { type: Date, default: Date.now },
});

const Cart = mongoose.model("Cart", cartSchema);

const purchaseSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  datePurchased: { type: Date, default: Date.now },
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

// Middleware de autenticación
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    next();
  });
}

// Esquema de notificaciones
const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const Notification = mongoose.model("Notification", notificationSchema);

// Modelo de mensajes
const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Remitente
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Destinatario
  text: { type: String, required: true }, // Contenido del mensaje
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, // Producto asociado al mensaje
  date: { type: Date, default: Date.now }, // Fecha del mensaje
  isRead: { type: Boolean, default: false }, // Estado de lectura
});

const Message = mongoose.model("Message", messageSchema);

// Ruta para obtener mensajes por buyerId y productId
app.get("/api/messages", authenticate, async (req, res) => {
  const { buyerId, productId } = req.query;

  // Validar que buyerId y productId estén presentes
  if (!buyerId || !productId) {
    return res.status(400).json({ message: "buyerId y productId son requeridos." });
  }

  // Validar que buyerId y productId tengan el formato correcto
  if (!mongoose.Types.ObjectId.isValid(buyerId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "buyerId o productId no tienen un formato válido." });
  }

  try {
    const messages = await Message.find({ userId: buyerId, productId })
      .populate("senderId", "fullName profilePicture")
      .sort({ date: 1 }); // Ordenar por fecha ascendente

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error al obtener los mensajes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Emitir notificaciones en tiempo real
const emitNotification = async (userId, notification) => {
  io.to(userId.toString()).emit("notification", notification);
};

// Modificar rutas existentes para emitir notificaciones

// Notificación de compra
app.post("/api/checkout", authenticate, async (req, res) => {
  const { productId, deliveryMethod, paymentMethod } = req.body;
  const buyerId = req.userId;

  try {
    // Verificar si el producto existe
    const product = await Product.findById(productId).populate("userId");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear la compra
    const purchase = new Purchase({
      buyerId,
      productId,
      price: product.price,
      datePurchased: new Date(),
    });
    await purchase.save();

    // Pausar el producto
    product.status = "paused"; // Cambiar el estado del producto a "paused"
    await product.save();

    // Crear una notificación para el vendedor
    const notification = new Notification({
      userId: product.userId._id,
      productId: product._id,
      message: `Has recibido una nueva compra para el producto: ${product.name}`, // Usar el nombre del producto
    });
    await notification.save();
    emitNotification(product.userId._id, notification); // Emitir notificación

    res.status(200).json({ success: true, message: "Compra procesada exitosamente." });
  } catch (error) {
    console.error("❌ Error al procesar la compra:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Notificación de mensaje en el chat
app.post("/api/messages", authenticate, async (req, res) => {
  const { buyerId, text, productId } = req.body;
  const senderId = req.userId;

  try {
    const newMessage = new Message({
      senderId,
      userId: buyerId,
      text,
      productId,
      date: new Date(),
    });

    await newMessage.save();

    const notification = new Notification({
      userId: buyerId,
      productId,
      message: `Nuevo mensaje en el chat del producto: ${productId}`,
      buyerId: senderId, // Include the senderId as buyerId in the notification
    });
    await notification.save();
    emitNotification(buyerId, notification);

    // Emit the new message to the product room
    io.to(productId).emit("newMessage", {
      _id: newMessage._id,
      senderId: {
        _id: senderId,
        fullName: req.user.fullName || "Usuario Anonimo",
        profilePicture: req.user.profilePicture || "/img/default-avatar.png",
      },
      text: newMessage.text,
      productId: newMessage.productId,
      date: newMessage.date,
    });

    res.status(201).json({ message: "Mensaje enviado", newMessage });
  } catch (error) {
    console.error("❌ Error al enviar el mensaje:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener los mensajes del usuario
app.get("/api/messages", authenticate, async (req, res) => {
  const userId = req.userId;
  const { buyerId, productId } = req.query;

  try {
    const query = {
      $or: [{ senderId: userId }, { userId: userId }],
      ...(buyerId && { userId: new mongoose.Types.ObjectId(buyerId) }),
      ...(productId && { productId: new mongoose.Types.ObjectId(productId) }),
    };

    const messages = await Message.find(query)
      .populate("senderId", "fullName profilePicture")
      .sort({ date: 1 }); // Ordenar por fecha ascendente

    const formattedMessages = messages.map((message) => ({
      _id: message._id,
      senderId: {
        _id: message.senderId._id,
        fullName: message.senderId.fullName,
        profilePicture: message.senderId.profilePicture || "/img/default-avatar.png",
      },
      text: message.text,
      date: message.date,
      isRead: message.isRead,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error("❌ Error al obtener los mensajes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para limpiar el chat de un producto específico
app.delete('/api/messages/clear', authenticate, async (req, res) => {
  const { buyerId, productId } = req.query;

  // Validar que buyerId y productId estén presentes
  if (!buyerId || !productId) {
    return res.status(400).json({ message: "buyerId y productId son requeridos." });
  }

  // Validar que buyerId y productId tengan el formato correcto
  if (!mongoose.Types.ObjectId.isValid(buyerId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "buyerId o productId no tienen un formato válido." });
  }

  try {
    // Eliminar los mensajes del chat correspondiente
    await Message.deleteMany({ userId: buyerId, productId });
    res.status(200).json({ message: "Chat limpiado exitosamente." });
  } catch (error) {
    console.error("Error al limpiar el chat:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta para obtener notificaciones del usuario
app.get("/api/notifications", authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    const notifications = await Notification.find({ userId, isRead: false }).populate("productId", "name");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error al obtener las notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para marcar una notificación como leída
app.put("/api/notifications/:id/mark-as-read", authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    res.status(200).json({ message: "Notificación marcada como leída" });
  } catch (error) {
    console.error("❌ Error al marcar la notificación como leída:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para marcar todas las notificaciones como leídas
app.put("/api/notifications/mark-all-as-read", authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (error) {
    console.error("❌ Error al marcar todas las notificaciones como leídas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Modificar rutas existentes para emitir notificaciones
app.post("/api/product/:productId/comments", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { text } = req.body;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

// En el backend, al crear un comentario o respuesta
const newComment = new Comment({
  text: req.body.text,
  userId: req.user._id,
  isOwner: req.user._id.toString() === product.userId.toString()
});
  try {
    // Verificar si el ID del producto es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Buscar el producto en la base de datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear el nuevo comentario
    const newComment = {
      userId: userId, // Asocia el comentario con el usuario logueado
      text: text, // Texto del comentario
      date: new Date(), // Fecha actual
    };

    // Agregar el comentario al producto
    product.comments.push(newComment);
    await product.save();

    // Crear una notificación para el vendedor
    const notification = new Notification({
      userId: product.userId,
      productId: product._id,
      message: `Nuevo comentario en tu producto: ${product.name}`, // Usar el nombre del producto
    });
    await notification.save();
    emitNotification(product.userId, notification); // Emitir notificación

    // Respuesta exitosa
    res.status(201).json({ message: "Comentario agregado", comment: newComment });
  } catch (error) {
    console.error("❌ Error al agregar el comentario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post('/api/checkout', authenticate, async (req, res) => {
  const { productId, deliveryMethod, paymentMethod } = req.body;
  const buyerId = req.userId;

  try {
    // Verificar si el producto existe
    const product = await Product.findById(productId).populate("userId");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Generar ID de chat único
    const chatId = uuidv4();
    console.log('Generated chatId:', chatId);
    // Crear la compra
    const purchase = new Purchase({
      productId,
      buyerId,
      sellerId: product.userId,
      deliveryMethod,
      paymentMethod,
      chatId, // Asegúrate de incluir el chatId en la compra
      price: product.price,
      datePurchased: new Date(),
    });

    await purchase.save();

    // Crear el chat
    const chat = new Chat({
      chatId,
      productId,
      buyerId,
      sellerId: product.userId
    });

    await chat.save();
    console.log('Saved chat:', chat);
    // Pausar el producto
    product.status = "paused";
    await product.save();

    // Crear una notificación para el vendedor
    const notification = new Notification({
      userId: product.userId._id,
      productId: product._id,
      message: `Has recibido una nueva compra para el producto: ${product.name}`, // Usar el nombre del producto
    });
    await notification.save();
    emitNotification(product.userId._id, notification); // Emitir notificación

    res.status(200).json({ success: true, message: "Compra procesada exitosamente", chatId });
  } catch (error) {
    console.error("❌ Error al procesar la compra:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener los detalles de un producto
app.get('/api/product/:id', async (req, res) => {
  try {
      const productId = req.params.id;

      // Verificar si el ID es válido
      if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "ID de producto no válido" });
      }

      // Buscar el producto en la base de datos
      const product = await Product.findById(productId).populate('userId', 'fullName _id');

      if (!product) {
          return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Devolver el producto
      res.status(200).json(product);
  } catch (error) {
      console.error("Error al obtener el producto:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener los comentarios de un producto
app.get("/api/product/:id/comments", async (req, res) => {
  const productId = req.params.id;

  try {
    // Verificar si el ID es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Buscar el producto en la base de datos
    const product = await Product.findById(productId).populate("comments.userId", "fullName");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Obtener el nombre del vendedor
    const sellerName = product.userId.fullName;

    // Formatear los comentarios para mostrar "Usuario Anonimo" para los compradores y el nombre del vendedor para el vendedor
    const formattedComments = product.comments.map(comment => ({
      ...comment.toObject(),
      userName: comment.userId._id.equals(product.userId._id) ? sellerName : "Usuario Anonimo",
      replies: comment.replies.map(reply => ({
        ...reply.toObject(),
        userName: reply.userId._id.equals(product.userId._id) ? sellerName : "Usuario Anonimo"
      }))
    }));

    // Devolver los comentarios formateados del producto
    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("❌ Error al obtener los comentarios del producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para agregar un comentario a un producto
app.post("/api/product/:productId/comments", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { text } = req.body;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    // Verificar si el ID del producto es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Buscar el producto en la base de datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear el nuevo comentario
    const newComment = {
      userId: userId, // Asocia el comentario con el usuario logueado
      text: text, // Texto del comentario
      date: new Date(), // Fecha actual
    };

    // Agregar el comentario al producto
    product.comments.push(newComment);
    await product.save();

    // Crear una notificación para el vendedor
    const notification = new Notification({
      userId: product.userId,
      productId: product._id,
      message: `Nuevo comentario en tu producto: ${product.name}`, // Usar el nombre del producto
    });
    await notification.save();
    emitNotification(product.userId, notification); // Emitir notificación

    // Respuesta exitosa
    res.status(201).json({ message: "Comentario agregado", comment: newComment });
  } catch (error) {
    console.error("❌ Error al agregar el comentario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para responder a un comentario
app.post("/api/product/:productId/comments/:commentId/reply", authenticate, async (req, res) => {
  const { productId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    // Verificar si el ID del producto es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Buscar el producto en la base de datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Buscar el comentario específico
    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    // Crear la nueva respuesta
    const reply = {
      userId: userId, // Asocia la respuesta con el usuario logueado
      text: text, // Texto de la respuesta
      date: new Date(), // Fecha actual
    };

    // Agregar la respuesta al comentario
    comment.replies.push(reply);
    await product.save();

    // Respuesta exitosa
    res.status(201).json({ message: "Respuesta agregada", reply });
  } catch (error) {
    console.error("❌ Error al agregar la respuesta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para dar "Me gusta" a un comentario
app.post("/api/product/:productId/comments/:commentId/like", authenticate, async (req, res) => {
  const { productId, commentId } = req.params;
  const userId = req.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    // Verificar si el usuario ya dio "Me gusta"
    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Si ya dio "Me gusta", lo quitamos
      comment.likes.splice(likeIndex, 1);
    } else {
      // Si no ha dado "Me gusta", lo agregamos
      comment.likes.push(userId);
    }
    await product.save();

    res.status(200).json({ likes: comment.likes.length });
  } catch (error) {
    console.error("❌ Error al procesar el 'Me gusta':", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/product/:productId/comments/:commentId/reply", authenticate, async (req, res) => {
  const { productId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const reply = {
      userId: userId,
      text: text,
      date: new Date(),
    };

    comment.replies.push(reply);
    await product.save();

    res.status(201).json({ message: "Respuesta agregada", reply });
  } catch (error) {
    console.error("❌ Error al agregar la respuesta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para editar el precio de un producto
app.put("/api/product/:productId/update-price", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { newPrice } = req.body;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    // Verificar si el ID del producto es válido
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Buscar el producto en la base de datos
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Verificar si el usuario es el dueño del producto
    if (product.userId.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para editar este producto" });
    }

    // Actualizar el precio
    product.price = newPrice;
    await product.save();

    // Respuesta exitosa
    res.status(200).json({ message: "Precio actualizado", product });
  } catch (error) {
    console.error("❌ Error al actualizar el precio:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para agregar un producto al carrito
app.post("/api/cart/add", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear un nuevo ítem en el carrito
    const cartItem = new Cart({
      userId,
      productId,
      quantity: 1, // Cantidad por defecto
    });

    await cartItem.save();

    res.status(201).json({ message: "Producto agregado al carrito", cartItem });
  } catch (error) {
    console.error("❌ Error al agregar el producto al carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener productos recientes
app.get("/api/recent-products", async (req, res) => {
  try {
    const recentProducts = await Product.find({ status: { $ne: "paused" } }) // Excluir productos con estado "paused"
      .sort({ datePosted: -1 }) // Ordena por fecha descendente
      .limit(5) // Limita a 5 productos
      .populate("userId", "fullName"); // Incluye el nombre del usuario

    res.status(200).json(recentProducts);
  } catch (error) {
    console.error("❌ Error al obtener productos recientes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener ofertas
app.get("/api/offers", async (req, res) => {
  try {
    const offers = await Product.find({ isOnSale: true })
      .sort({ datePosted: -1 }) // Ordena por fecha descendente
      .limit(5) // Limita a 5 ofertas
      .populate("userId", "fullName"); // Incluye el nombre del usuario

    res.status(200).json(offers);
  } catch (error) {
    console.error("❌ Error al obtener ofertas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta de registro
app.post("/api/register", async (req, res) => {
  const { email, password, fullName, phoneNumber, address, city, postalCode, country } = req.body;

  // Validación de campos requeridos
  if (!email || !password || !fullName || !phoneNumber || !address || !city || !postalCode || !country) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phoneNumber,
      address,
      city,
      postalCode,
      country,
    });

    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error("❌ Error al registrar al usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Correo electrónico y contraseña son requeridos" });
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign(
          { email: user.email, userId: user._id },
          JWT_SECRET,
          { expiresIn: "1h" } // El token expira en 1 hora
        );

        await ValidToken.create({ token, userId: user._id });

        return res.status(200).json({ message: "✅ Login exitoso", token });
      } else {
        return res.status(401).json({ message: "❌ Contraseña incorrecta" });
      }
    } else {
      return res.status(404).json({ message: "❌ Usuario no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error al autenticar al usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta de logout
app.post("/api/logout", authenticate, async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
    await ValidToken.deleteOne({ token });
    return res.status(200).json({ message: "✅ Sesión cerrada exitosamente" });
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
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
      status: "active", // Estado por defecto al publicar un producto
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto publicado exitosamente.", product: newProduct });
  } catch (error) {
    console.error("❌ Error al publicar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta para obtener productos del usuario logueado
app.get("/api/products", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    const products = await Product.find({ userId: new mongoose.Types.ObjectId(userId) }); // Filtra por userId
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener estadísticas
app.get("/api/stats", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    const totalSales = await Product.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Filtra por userId
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]).exec();

    const totalPurchases = await Purchase.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } }, // Filtra por userId
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]).exec();

    const totalProducts = await Product.countDocuments({ userId });

    res.status(200).json({
      totalSales: totalSales[0]?.total || 0,
      totalPurchases: totalPurchases[0]?.total || 0,
      totalProducts,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener compras del usuario logueado
app.get("/api/purchases", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    const purchases = await Purchase.find({ buyerId: new mongoose.Types.ObjectId(userId) })
      .populate('productId', 'name userId') // Incluye el nombre del producto y el ID del usuario que lo publicó
      .populate('buyerId', 'fullName'); // Incluye el nombre completo del comprador

    res.status(200).json(purchases);
  } catch (error) {
    console.error("❌ Error al obtener compras:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener todas las compras (para el vendedor)
app.get("/api/all-purchases", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
    const purchases = await Purchase.find()
      .populate({
        path: 'productId',
        match: { userId: userId }, // Filtra por userId del vendedor
        select: 'name userId'
      })
      .populate('buyerId', 'fullName'); // Incluye el nombre completo del comprador

    // Filtrar las compras que no tienen un producto asociado (producto no pertenece al usuario autenticado)
    const filteredPurchases = purchases.filter(purchase => purchase.productId && purchase.productId.userId.toString() === userId);

    res.status(200).json(filteredPurchases);
  } catch (error) {
    console.error("❌ Error al obtener todas las compras:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para obtener datos del usuario
app.get("/api/user", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
      // Buscar el usuario en la base de datos
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Devolver los datos del usuario, incluyendo la foto de perfil
      const userData = {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          postalCode: user.postalCode,
          country: user.country,
          profilePicture: user.profilePicture || "/img/default-avatar.png", // Foto de perfil o una por defecto
      };

      res.status(200).json(userData);
  } catch (error) {
      console.error("❌ Error al obtener datos del usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para actualizar los datos del usuario
app.put("/api/user", authenticate, async (req, res) => {
  const userId = req.userId; // Obtén el userId del middleware de autenticación
  const updatedData = req.body;

  try {
      // Buscar y actualizar el usuario en la base de datos
      const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
      if (!user) {
          return res.status(404).json({ message: "Usuario no encontrado" });
      }

      // Devolver los datos actualizados del usuario
      const userData = {
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          address: user.address,
          city: user.city,
          postalCode: user.postalCode,
          country: user.country,
      };

      res.status(200).json({ message: "Perfil actualizado exitosamente", user: userData });
  } catch (error) {
      console.error("❌ Error al actualizar el perfil:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para subir una imagen de perfil
app.post("/api/user/profile-picture", authenticate, upload.single("profilePicture"), async (req, res) => {
  const userId = req.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No se proporcionó ninguna imagen." });
  }

  const profilePictureUrl = `/uploads/${file.filename}`;

  try {
    const user = await User.findByIdAndUpdate(userId, { profilePicture: profilePictureUrl }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ profilePictureUrl });
  } catch (error) {
    console.error("❌ Error al subir la foto de perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/products", authenticate, upload.array("imagenes", 4), async (req, res) => {
  const { nombre, categoria, precio, descripcion } = req.body;
  const imagenes = req.files;

  if (!nombre || !categoria || !precio || !descripcion || !imagenes) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  try {
      const imagePaths = imagenes.map((file) => `/uploads/${file.filename}`);
      const newProduct = new Product({
          name: nombre,
          category: categoria,
          price: parseFloat(precio),
          description: descripcion,
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

app.post('/api/products', upload.array('imagenes', 5), async (req, res) => {
  try {
      const { nombre, categoria, precio, descripcion, stock, estado } = req.body;
      const imagenes = req.files;

      if (!nombre || !categoria || !precio || !descripcion || !stock || !estado || !imagenes) {
          return res.status(400).json({ message: "Todos los campos son requeridos." });
      }

      // Guardar el producto en la base de datos
      const newProduct = new Product({
          name: nombre,
          category: categoria,
          price: parseFloat(precio),
          description: descripcion,
          stock: parseInt(stock),
          condition: estado,
          images: imagenes.map(file => `/uploads/${file.filename}`),
      });

      await newProduct.save();

      res.status(201).json({ message: "Producto publicado exitosamente.", product: newProduct });
  } catch (error) {
      console.error("Error al publicar el producto:", error);
      res.status(500).json({ message: "Error interno del servidor.", error: error.message });
  }
});

app.put('/api/products/:productId/archive', authenticate, async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
      // Verificar si el ID del producto es válido
      if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "ID de producto no válido" });
      }

      // Buscar el producto en la base de datos
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Verificar si el usuario es el dueño del producto
      if (product.userId.toString() !== userId) {
          return res.status(403).json({ message: "No tienes permiso para modificar este producto" });
      }

      // Archivar el producto (cambiar su estado)
      product.status = "archived"; // O "out_of_stock" si está agotado
      await product.save();

      // Respuesta exitosa
      res.status(200).json({ message: "Producto archivado exitosamente", product });
  } catch (error) {
      console.error("Error al archivar el producto:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para marcar un producto como agotado
app.put('/api/products/:productId/out-of-stock', authenticate, async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId; // Obtén el userId del middleware de autenticación

  try {
      // Verificar si el ID del producto es válido
      if (!mongoose.Types.ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "ID de producto no válido" });
      }

      // Buscar el producto en la base de datos
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Verificar si el usuario es el dueño del producto
      if (product.userId.toString() !== userId) {
          return res.status(403).json({ message: "No tienes permiso para modificar este producto" });
      }

      // Marcar el producto como agotado
      product.status = "out_of_stock";
      await product.save();

      // Respuesta exitosa
      res.status(200).json({ message: "Producto marcado como agotado exitosamente", product });
  } catch (error) {
      console.error("Error al marcar el producto como agotado:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta para actualizar un producto
app.put("/api/products/:productId", authenticate, upload.array("imagenes", 4), async (req, res) => {
  const { productId } = req.params;
  const { nombre, categoria, precio, descripcion, stock, estado, currency, status } = req.body;
  const imagenes = req.files;

  if (!nombre || !categoria || !precio || !descripcion || !stock || !estado || !currency) {
    return res.status(400).json({ message: "Todos los campos son requeridos." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    product.name = nombre;
    product.category = categoria;
    product.price = parseFloat(precio);
    product.description = descripcion;
    product.stock = parseInt(stock);
    product.condition = estado;
    product.currency = currency;
    product.status = status || "active"; // Actualizar el estado del producto

    if (imagenes.length > 0) {
      const imagePaths = imagenes.map((file) => `/uploads/${file.filename}`);
      product.images = imagePaths;
    }

    await product.save();
    res.status(200).json({ message: "Producto actualizado exitosamente.", product });
  } catch (error) {
    console.error("❌ Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Ruta para procesar la compra
app.post("/api/checkout", authenticate, async (req, res) => {
  const { productId, deliveryMethod, paymentMethod } = req.body;
  const buyerId = req.userId;

  try {
    // Verificar si el producto existe
    const product = await Product.findById(productId).populate("userId");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    // Crear la compra
    const purchase = new Purchase({
      buyerId,
      productId,
      price: product.price,
      datePurchased: new Date(),
    });
    await purchase.save();

    // Pausar el producto
    product.status = "paused";
    await product.save();

    // Crear una notificación para el vendedor
    const notification = new Notification({
      userId: product.userId._id,
      productId: product._id,
      message: `Has recibido una nueva compra para el producto: ${product.name}`, // Usar el nombre del producto
    });
    await notification.save();
    emitNotification(product.userId._id, notification); // Emitir notificación

    res.status(200).json({ success: true, message: "Compra procesada exitosamente." });
  } catch (error) {
    console.error("❌ Error al procesar la compra:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Ruta principal para servir el archivo index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});

// Configuración de WebSocket
io.on("connection", (socket) => {
  console.log("🔌 Nuevo cliente conectado");

  socket.on("joinRoom", ({ productId }) => {
    if (productId) {
      socket.join(productId);
      console.log(`🔌 Cliente unido a la sala del producto: ${productId}`);
    } else {
      console.error("Error: productId es null o undefined");
    }
  });

  socket.on("sendMessage", (data) => {
    const { productId, message } = data;
    console.log(`📩 Mensaje recibido en sala ${productId}: ${message}`);

    if (productId) {
      io.to(productId).emit("newMessage", message);
    } else {
      console.error("Error: productId es null o undefined al enviar mensaje");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado");
  });
});

app.get('/api/payments', authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    // Fetch sales where the logged-in user is the seller
    const soldPayments = await Purchase.find()
      .populate({
        path: 'productId',
        match: { userId: userId }, // Ensure the product belongs to the seller
        select: 'name currency',
      })
      .select('price datePurchased productId')
      .lean();

    // Fetch purchases where the logged-in user is the buyer
    const boughtPayments = await Purchase.find({ buyerId: userId })
      .populate('productId', 'name currency')
      .select('price datePurchased productId')
      .lean();

    // Combine sales and purchases into a single array
    const payments = [
      ...soldPayments
        .filter(payment => payment.productId) // Exclude null products
        .map(payment => ({
          type: 'sold',
          product: payment.productId,
          amount: payment.price,
          date: payment.datePurchased,
          currency: payment.productId.currency || 'USD', // Use the product's currency
        })),
      ...boughtPayments.map(payment => ({
        type: 'bought',
        product: payment.productId,
        amount: payment.price,
        date: payment.datePurchased,
        currency: payment.productId.currency || 'USD', // Use the product's currency
      })),
    ];

    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
