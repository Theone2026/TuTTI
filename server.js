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
import { v4 as uuidv4 } from 'uuid';
import http from "http";
import { Server } from "socket.io";

// Configuración de ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://tutti-production.up.railway.app' || 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "mi_super_secreto";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const PORT = process.env.PORT || 3000;

// Conexión a MongoDB
const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Tutti:Maikelfox@cluster0.uw1mo.mongodb.net/TuTTI?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Conectado a MongoDB"))
.catch((err) => {
  console.error("❌ Error de conexión a MongoDB:", err.messaage);
  process.exit(1);
});

// Configuración de CORS
const allowedOrigins = ['http://localhost:3000', 'https://tutti-production.up.railway.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configuración de Multer
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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
  profilePicture: { type: String, default: "/img/default-avatar.png" },
});

const User = mongoose.model("User", userSchema);

const validTokensSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now, expires: "1h" },
});

const ValidToken = mongoose.model("ValidToken", validTokensSchema);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  datePosted: { type: Date, default: Date.now },
  isOnSale: { type: Boolean, default: false },
  originalPrice: { type: Number },
  comments: [{
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
  currency: { type: String, required: true },
  stock: { type: Number, required: true },
  status: { type: String, default: "active" },
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
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  datePurchased: { type: Date, default: Date.now },
  status: { type: String, default: "completed" },
  chatId: { type: String, unique: true },
});

const Purchase = mongoose.model("Purchase", purchaseSchema);

const chatSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  type: { type: String }
});

const Notification = mongoose.model("Notification", notificationSchema);

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isBuyer: { type: Boolean, required: true } // Nuevo campo
});

const Message = mongoose.model('Message', messageSchema);

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Acceso denegado. No hay token." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const isValidToken = await ValidToken.findOne({ token, userId: decoded.userId });
    if (!isValidToken) {
      return res.status(403).json({ message: "Token inválido o sesión cerrada." });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Error de autenticación:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expirado. Por favor, inicia sesión nuevamente." });
    }
    return res.status(403).json({ message: "Token inválido." });
  }
};

// Funciones de utilidad
const emitNotification = async (userId, notification) => {
  io.to(userId.toString()).emit("notification", notification);
};

// Rutas de autenticación
app.post("/api/register", async (req, res) => {
  const { email, password, fullName, phoneNumber, address, city, postalCode, country } = req.body;

  if (!email || !password || !fullName || !phoneNumber || !address || !city || !postalCode || !country) {
    return res.status(400).json({ message: "Todos los campos son requeridos" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
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
          { expiresIn: "1h" }
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

// Rutas de usuario
app.get("/api/user", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

app.put("/api/user", authenticate, async (req, res) => {
  const userId = req.userId;
  const updatedData = req.body;

  try {
    const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

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

app.post("/api/user/profile-picture", authenticate, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: "Foto de perfil actualizada con éxito", profilePicture: user.profilePicture });
  } catch (error) {
    console.error("Error al actualizar la foto de perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de productos
app.post("/api/products", authenticate, upload.array("imagenes", 4), async (req, res) => {
  const { nombre, categoria, precio, descripcion, stock, estado, currency, retiroLocal, direccionRetiro } = req.body;
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
      status: "active",
      retiroLocal: retiroLocal === 'true',
      direccionRetiro: direccionRetiro,
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto publicado exitosamente.", product: newProduct });
  } catch (error) {
    console.error("❌ Error al publicar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/products", authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    const products = await Product.find({ userId: new mongoose.Types.ObjectId(userId) })
      .select('_id name category price description images isOnSale currency stock status datePosted comments')
      .sort({ datePosted: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get('/api/product/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId).populate('userId', 'fullName _id');

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

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
    product.status = status || "active";

    if (imagenes && imagenes.length > 0) {
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

app.put('/api/products/:productId/archive', authenticate, async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.userId.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para modificar este producto" });
    }

    product.status = "archived";
    await product.save();

    res.status(200).json({ message: "Producto archivado exitosamente", product });
  } catch (error) {
    console.error("Error al archivar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.put('/api/products/:productId/out-of-stock', authenticate, async (req, res) => {
  const { productId } = req.params;
  const userId = req.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.userId.toString() !== userId) {
      return res.status(403).json({ message: "No tienes permiso para modificar este producto" });
    }

    product.status = "out_of_stock";
    await product.save();

    res.status(200).json({ message: "Producto marcado como agotado exitosamente", product });
  } catch (error) {
    console.error("Error al marcar el producto como agotado:", error);
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

// Rutas de comentarios
app.get("/api/product/:id/comments", async (req, res) => {
  const productId = req.params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId).populate("comments.userId", "fullName");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const sellerName = product.userId.fullName;

    const formattedComments = product.comments.map(comment => ({
      ...comment.toObject(),
      userName: comment.userId._id.equals(product.userId._id) ? sellerName : "Usuario Anonimo",
      replies: comment.replies.map(reply => ({
        ...reply.toObject(),
        userName: reply.userId._id.equals(product.userId._id) ? sellerName : "Usuario Anonimo"
      }))
    }));

    res.status(200).json(formattedComments);
  } catch (error) {
    console.error("❌ Error al obtener los comentarios del producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/product/:productId/comments", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const newComment = {
      userId: userId,
      text: text,
      date: new Date(),
    };

    product.comments.push(newComment);
    await product.save();

    const notification = new Notification({
      userId: product.userId,
      productId: product._id,
      message: `Nuevo comentario en tu producto: ${product.name}`,
      type: "comment"
    });
    await notification.save();
    emitNotification(product.userId, notification);

    res.status(201).json({ message: "Comentario agregado", comment: newComment });
  } catch (error) {
    console.error("❌ Error al agregar el comentario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/product/:productId/comments/:commentId/reply", authenticate, async (req, res) => {
  const { productId, commentId } = req.params;
  const { text } = req.body;
  const userId = req.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

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

app.post("/api/product/:productId/comments/:commentId/like", authenticate, async (req, res) => {
  const { productId, commentId } = req.params;
  const userId = req.userId;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const likeIndex = comment.likes.findIndex(like => like.equals(userIdObj));

    if (likeIndex === -1) {
      comment.likes.push(userIdObj);
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await product.save();

    res.status(200).json({ 
      message: "Acción de 'me gusta' procesada con éxito",
      likes: comment.likes.length
    });
  } catch (error) {
    console.error("❌ Error al procesar 'me gusta' en el comentario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de compras y carrito
app.post("/api/checkout", authenticate, async (req, res) => {
  const { productId, deliveryMethod, paymentMethod } = req.body;
  const buyerId = req.userId;

  try {
    const product = await Product.findById(productId).populate("userId");
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Producto agotado" });
    }

    const chatId = uuidv4();
    console.log('Generated chatId:', chatId);

    const purchase = new Purchase({
      buyerId,
      sellerId: product.userId._id,
      productId,
      price: product.price,
      datePurchased: new Date(),
      status: "completed",
      chatId
    });
    await purchase.save();

    product.stock -= 1;
    if (product.stock === 0) {
      product.status = "sold";
    }
    await product.save();

    const chat = new Chat({
      chatId,
      productId: product._id,
      buyerId: buyerId,
      sellerId: product.userId._id,
      messages: []
    });
    await chat.save();

    const sellerNotification = new Notification({
      userId: product.userId._id,
      productId: product._id,
      message: `Has vendido tu producto: ${product.name} por ${product.price}`,
      type: "sale"
    });
    await sellerNotification.save();
    emitNotification(product.userId._id, sellerNotification);

    const buyerNotification = new Notification({
      userId: buyerId,
      productId: product._id,
      message: `Has comprado el producto: ${product.name} por ${product.price}`,
      type: "purchase"
    });
    await buyerNotification.save();
    emitNotification(buyerId, buyerNotification);

    res.status(200).json({ 
      success: true, 
      message: "Compra procesada exitosamente.",
      purchaseId: purchase._id,
      chatId: chat.chatId
    });
  } catch (error) {
    console.error("❌ Error al procesar la compra:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/cart/add", authenticate, async (req, res) => {
  const { productId } = req.body;
  const userId = req.userId;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    const cartItem = new Cart({
      userId,
      productId,
      quantity: 1,
    });

    await cartItem.save();
    res.status(201).json({ message: "Producto agregado al carrito", cartItem });
  } catch (error) {
    console.error("❌ Error al agregar el producto al carrito:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de mensajes y chat
app.get("/api/messages", authenticate, async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId es requerido." });
  }

  try {
    const messages = await Message.find({ $or: [{ userId }, { senderId: userId }] })
      .populate("senderId", "fullName profilePicture")
      .populate("productId", "name")
      .sort({ date: -1 })
      .limit(20); // Limitar a los 20 mensajes más recientes, por ejemplo

    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error al obtener los mensajes:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

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

    const product = await Product.findById(productId);
    const productName = product ? product.name : 'Unknown Product';

    const notification = new Notification({
      userId: buyerId,
      productId,
      message: `Nuevo mensaje en el chat del producto: ${productName}`,
      buyerId: senderId,
      createdAt: new Date(),
    });
    await notification.save();
    emitNotification(buyerId, notification);

    io.to(productId).emit("newMessage", {
      _id: newMessage._id,
      senderId: {
        _id: senderId,
        fullName: req.user.fullName || "Usuario Anonimo",
        profilePicture: req.user.profilePicture || "/img/default-avatar.png",
      },
      text: newMessage.text,
      productId: newMessage.productId,
      date: newMessage.date.toISOString(),
    });

    res.status(201).json({ 
      message: "Mensaje enviado", 
      newMessage: {
        ...newMessage.toObject(),
        date: newMessage.date.toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Error al enviar el mensaje:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.delete('/api/messages/clear', authenticate, async (req, res) => {
  const { buyerId, productId } = req.query;

  if (!buyerId || !productId) {
    return res.status(400).json({ message: "buyerId y productId son requeridos." });
  }

  if (!mongoose.Types.ObjectId.isValid(buyerId) || !mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "buyerId o productId no tienen un formato válido." });
  }

  try {
    await Message.deleteMany({ userId: buyerId, productId });
    res.status(200).json({ message: "Chat limpiado exitosamente." });
  } catch (error) {
    console.error("Error al limpiar el chat:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get('/api/chat/:chatId', authenticate, async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await Chat.findOne({ chatId }).populate('buyerId sellerId');
        if (!chat) {
            return res.status(404).json({ message: "Chat no encontrado" });
        }

        const messages = await Message.find({ chatId }).sort({ timestamp: 1 }).populate('sender', 'fullName');

        const formattedMessages = messages.map(msg => ({
            ...msg.toObject(),
            senderName: msg.isBuyer ? 'Comprador' : 'Vendedor'
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post("/api/chat/:chatId/message", authenticate, async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  const senderId = req.userId;

  try {
    const chat = await Chat.findOne({ chatId });
    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado" });
    }

    const isBuyer = chat.buyerId.toString() === senderId;
    const newMessage = new Message({
      chatId,
      sender: senderId,
      content,
      timestamp: new Date(),
      isBuyer
    });

    await newMessage.save();

    chat.messages.push(newMessage._id);
    await chat.save();

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'fullName');

    io.to(chatId).emit('newMessage', {
      ...populatedMessage.toObject(),
      senderName: isBuyer ? 'Comprador' : 'Vendedor'
    });

    res.status(201).json({
      ...populatedMessage.toObject(),
      senderName: isBuyer ? 'Comprador' : 'Vendedor'
    });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Rutas de notificaciones
app.get("/api/notifications", authenticate, async (req, res) => {
  const userId = req.userId;

  try {
    const notifications = await Notification.find({ userId, isRead: false })
      .populate("productId", "name")
      .sort({ date: -1 });

    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      message: notification.message,
      productId: notification.productId._id,
      productName: notification.productId.name,
      date: notification.date,
      type: notification.type
    }));

    res.status(200).json(formattedNotifications);
  } catch (error) {
    console.error("❌ Error al obtener las notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

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

// Rutas del dashboard
app.get("/api/dashboard-data", authenticate, async (req, res) => {
  const userId = req.userId;
  try {
    const products = await Product.find({ userId: userId });
    const purchases = await Purchase.find({ buyerId: userId }).populate('productId');
    const sales = await Purchase.find({ sellerId: userId }).populate('productId');
    const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0);
    const totalPurchases = purchases.reduce((sum, purchase) => sum + purchase.price, 0);

    res.status(200).json({
      totalSales: totalSales,
      totalPurchases: totalPurchases,
      sales: sales,
      purchases: purchases,
      products: products,
      currency: 'UYU', // o la moneda que corresponda
    });
  } catch (error) {
    console.error("Error al obtener los datos del dashboard:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.get('/api/user/stats', authenticate, async (req, res) => {
  const userId = req.userId;
  try {
    const totalSales = await Purchase.aggregate([
      { $match: { 'productId.userId': new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const totalPurchases = await Purchase.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const productsInSale = await Product.countDocuments({ 
      userId: userId,
      status: 'active'
    });

    res.json({
      totalSales: totalSales[0]?.total || 0,
      totalPurchases: totalPurchases[0]?.total || 0,
      productsInSale
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Configuración de WebSocket
io.on("connection", (socket) => {
  console.log("🔌 Nuevo cliente conectado");

  socket.on("joinRoom", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`🔌 Cliente unido a la sala: ${userId}`);
    } else {
      console.error("Error: userId es null o undefined");
    }
  });

  socket.on("sendMessage", (data) => {
    const { productId, message } = data;
    if (productId) {
      console.log(`📩 Mensaje recibido en sala ${productId}: ${message}`);
      io.to(productId).emit("newMessage", message);
    } else {
      console.error("Error: productId es null o undefined al enviar mensaje");
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado");
  });
});

// Servir archivos estáticos desde la carpeta /public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Ruta específica para servir index.html desde la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor normalmente con Express
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});