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
    // CORRECCIÓN: Esto debe ser un array de strings para ambos orígenes
    origin: ['https://tutti-production.up.railway.app', 'http://localhost:3000', 'http://localhost:5173'], // Añadido 5173
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
  console.error("❌ Error de conexión a MongoDB:", err.message);
  process.exit(1); // Sale de la aplicación si no se puede conectar a la DB
});

// Configuración de CORS para Express (más detallado que el de Socket.io)
const allowedOrigins = ['http://localhost:3000', 'https://tutti-production.up.railway.app', 'http://localhost:5173']; // Añadido 5173

const corsOptions = {
  origin: function (origin, callback) {
    // Permite solicitudes sin origen (como las de Postman o CURL) o de los orígenes permitidos
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

// Esquemas de Mongoose (Mantengo tus esquemas tal cual los enviaste)
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
  // Añadimos estos campos si los usas para publicar producto
  condition: { type: String }, // Asegúrate de que este campo exista si lo usas en el frontend
  retiroLocal: { type: Boolean, default: false },
  direccionRetiro: { type: String },
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
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // productId puede ser opcional si la notificación no es de producto
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
  type: { type: String },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Puede ser útil para notificaciones de chat
});
const Notification = mongoose.model("Notification", notificationSchema);

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isBuyer: { type: Boolean, required: true }
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
    req.user = user; // Adjuntar el objeto de usuario a la solicitud
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

        return res.status(200).json({ message: "Inicio de sesión exitoso", token, userId: user._id, fullName: user.fullName });
      } else {
        return res.status(401).json({ message: "Credenciales incorrectas" });
      }
    } else {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("❌ Error en el inicio de sesión:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

app.post("/api/logout", authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await ValidToken.deleteOne({ token: token, userId: req.userId });
    res.status(200).json({ message: "Sesión cerrada exitosamente." });
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    res.status(500).json({ message: "Error interno del servidor al cerrar sesión." });
  }
});

// Rutas de perfil de usuario
app.get("/api/user/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password"); // Excluir el password
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.put("/api/user/profile", authenticate, async (req, res) => {
  const { fullName, phoneNumber, address, city, postalCode, country } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { fullName, phoneNumber, address, city, postalCode, country },
      { new: true, runValidators: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json({ message: "Perfil actualizado exitosamente", user: updatedUser });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de productos
app.post("/api/products", authenticate, upload.array("images", 5), async (req, res) => {
  try {
    const { name, category, price, description, currency, stock, condition, retiroLocal, direccionRetiro } = req.body;

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    const newProduct = new Product({
      name,
      category,
      price: parseFloat(price),
      description,
      images: imageUrls,
      userId: req.userId,
      currency,
      stock: parseInt(stock, 10),
      condition,
      retiroLocal: retiroLocal === 'true', // Convertir a booleano
      direccionRetiro: retiroLocal === 'true' ? direccionRetiro : undefined,
    });

    await newProduct.save();
    res.status(201).json({ message: "Producto publicado exitosamente", product: newProduct });
  } catch (error) {
    console.error("❌ Error al publicar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor al publicar el producto." });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Búsqueda insensible a mayúsculas/minúsculas
    }
    const products = await Product.find(query).populate('userId', 'fullName profilePicture');
    res.status(200).json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('userId', 'fullName profilePicture');
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.put("/api/products/:id", authenticate, upload.array("images", 5), async (req, res) => {
  try {
    const { name, category, price, description, currency, stock, condition, retiroLocal, direccionRetiro, existingImages } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    if (product.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "No tienes permiso para editar este producto." });
    }

    let updatedImages = existingImages ? JSON.parse(existingImages) : [];
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/${file.filename}`);
      updatedImages = updatedImages.concat(newImages);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        category,
        price: parseFloat(price),
        description,
        currency,
        stock: parseInt(stock, 10),
        images: updatedImages,
        condition,
        retiroLocal: retiroLocal === 'true',
        direccionRetiro: retiroLocal === 'true' ? direccionRetiro : undefined,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: "Producto actualizado exitosamente", product: updatedProduct });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.delete("/api/products/:id", authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    if (product.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "No tienes permiso para eliminar este producto." });
    }

    // Opcional: eliminar imágenes del servidor
    product.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, 'public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Producto eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de comentarios
app.post("/api/products/:productId/comments", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    product.comments.push({ userId: req.userId, text });
    await product.save();

    // Obtener el comentario recién agregado con la información del usuario
    const newComment = product.comments[product.comments.length - 1];
    await newComment.populate('userId', 'fullName profilePicture'); // Populate para el comentario que se va a devolver

    res.status(201).json({ message: "Comentario añadido", comment: newComment });
  } catch (error) {
    console.error("Error al añadir comentario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/comments/:commentId/like", authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId;

    const product = await Product.findOne({ "comments._id": commentId });

    if (!product) {
      return res.status(404).json({ message: "Comentario o producto no encontrado." });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado." });
    }

    const userLikedIndex = comment.likes.indexOf(userId);

    if (userLikedIndex === -1) {
      // Si el usuario no le ha dado "me gusta", añadir el "me gusta"
      comment.likes.push(userId);
      await product.save();
      res.status(200).json({ message: "Me gusta añadido." });
    } else {
      // Si el usuario ya le ha dado "me gusta", eliminar el "me gusta" (toggle)
      comment.likes.splice(userLikedIndex, 1);
      await product.save();
      res.status(200).json({ message: "Me gusta eliminado." });
    }

  } catch (error) {
    console.error("Error al dar/quitar me gusta al comentario:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/comments/:commentId/reply", authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;

    const product = await Product.findOne({ "comments._id": commentId });
    if (!product) {
      return res.status(404).json({ message: "Comentario o producto no encontrado." });
    }

    const comment = product.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentario no encontrado." });
    }

    comment.replies.push({ userId: req.userId, text });
    await product.save();

    // Obtener la respuesta recién agregada con la información del usuario
    const newReply = comment.replies[comment.replies.length - 1];
    await newReply.populate('userId', 'fullName profilePicture'); // Populate para la respuesta que se va a devolver

    res.status(201).json({ message: "Respuesta añadida", reply: newReply });
  } catch (error) {
    console.error("Error al añadir respuesta:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas del carrito
app.post("/api/cart", authenticate, async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity || quantity <= 0) {
    return res.status(400).json({ message: "ID de producto y cantidad válidos son requeridos." });
  }
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `No hay suficiente stock. Solo quedan ${product.stock} unidades.` });
    }

    let cartItem = await Cart.findOne({ userId: req.userId, productId });
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new Cart({ userId: req.userId, productId, quantity });
    }
    await cartItem.save();
    res.status(200).json({ message: "Producto añadido al carrito", cartItem });
  } catch (error) {
    console.error("Error al añadir producto al carrito:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/cart", authenticate, async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.userId }).populate('productId');
    res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error al obtener el carrito:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.delete("/api/cart/:productId", authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const deletedItem = await Cart.findOneAndDelete({ userId: req.userId, productId });
    if (!deletedItem) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito." });
    }
    res.status(200).json({ message: "Producto eliminado del carrito." });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.put("/api/cart/:productId", authenticate, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: "Cantidad inválida." });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `No hay suficiente stock. Solo quedan ${product.stock} unidades.` });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId: req.userId, productId },
      { quantity },
      { new: true }
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Producto no encontrado en el carrito del usuario." });
    }

    res.status(200).json({ message: "Cantidad actualizada en el carrito.", cartItem });
  } catch (error) {
    console.error("Error al actualizar la cantidad del producto en el carrito:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de compras
app.post("/api/purchase", authenticate, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: `No hay suficiente stock. Solo quedan ${product.stock} unidades.` });
    }

    // Reducir el stock del producto
    product.stock -= quantity;
    await product.save();

    // Crear la compra
    const newPurchase = new Purchase({
      buyerId: req.userId,
      sellerId: product.userId,
      productId: product._id,
      price: product.price * quantity,
      chatId: uuidv4(), // Generar un ID de chat único para esta compra
    });
    await newPurchase.save();

    // Crear un nuevo chat asociado a esta compra
    const newChat = new Chat({
      chatId: newPurchase.chatId,
      productId: product._id,
      buyerId: req.userId,
      sellerId: product.userId,
      messages: [],
    });
    await newChat.save();

    // Notificar al vendedor sobre la nueva compra
    const sellerNotification = new Notification({
      userId: product.userId,
      message: `¡Nueva compra de tu producto ${product.name} por ${req.user.fullName}!`,
      productId: product._id,
      type: "purchase",
      buyerId: req.userId,
    });
    await sellerNotification.save();
    emitNotification(product.userId, sellerNotification);

    res.status(201).json({ message: "Compra realizada exitosamente", purchase: newPurchase });
  } catch (error) {
    console.error("Error al realizar la compra:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/purchases/buyer", authenticate, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyerId: req.userId })
      .populate('productId', 'name images price')
      .populate('sellerId', 'fullName');
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error al obtener compras del comprador:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/purchases/seller", authenticate, async (req, res) => {
  try {
    const purchases = await Purchase.find({ sellerId: req.userId })
      .populate('productId', 'name images price')
      .populate('buyerId', 'fullName');
    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error al obtener ventas del vendedor:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de Chats
app.get("/api/chats", authenticate, async (req, res) => {
  try {
    // Obtener chats donde el usuario es comprador o vendedor
    const chats = await Chat.find({
      $or: [{ buyerId: req.userId }, { sellerId: req.userId }]
    })
    .populate('productId', 'name images price') // Popula la info del producto
    .populate('buyerId', 'fullName profilePicture') // Popula la info del comprador
    .populate('sellerId', 'fullName profilePicture') // Popula la info del vendedor
    .sort({ 'messages.timestamp': -1 }); // Ordenar por el mensaje más reciente

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error al obtener chats:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.get("/api/chats/:chatId", authenticate, async (req, res) => {
  try {
    const chat = await Chat.findOne({ chatId: req.params.chatId }).populate([
      { path: 'productId', select: 'name images price' },
      { path: 'buyerId', select: 'fullName profilePicture' },
      { path: 'sellerId', select: 'fullName profilePicture' },
      { path: 'messages.sender', select: 'fullName profilePicture' } // Populate el sender de cada mensaje
    ]);

    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado." });
    }

    // Asegurarse de que el usuario actual es parte de este chat
    if (chat.buyerId._id.toString() !== req.userId && chat.sellerId._id.toString() !== req.userId) {
      return res.status(403).json({ message: "No tienes permiso para ver este chat." });
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error("Error al obtener chat por ID:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.post("/api/chats/:chatId/messages", authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findOne({ chatId: req.params.chatId });

    if (!chat) {
      return res.status(404).json({ message: "Chat no encontrado." });
    }

    // Verificar si el usuario es el comprador o vendedor del chat
    if (chat.buyerId.toString() !== req.userId && chat.sellerId.toString() !== req.userId) {
      return res.status(403).json({ message: "No tienes permiso para enviar mensajes en este chat." });
    }

    const newMessage = {
      sender: req.userId,
      content: content,
      timestamp: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    // Emitir el mensaje a la sala de Socket.io del chat
    io.to(chat.chatId).emit('newMessage', {
      ...newMessage,
      sender: req.user // Envía el objeto de usuario completo para el frontend
    });

    // Notificar al otro participante del chat (si no es el mismo que envía)
    const receiverId = chat.buyerId.toString() === req.userId ? chat.sellerId : chat.buyerId;
    if (receiverId.toString() !== req.userId) { // No te notifiques a ti mismo
      const notification = new Notification({
        userId: receiverId,
        message: `Nuevo mensaje de ${req.user.fullName} en el chat de ${chat.productId.name}.`,
        productId: chat.productId,
        type: 'chat_message',
        buyerId: chat.buyerId.toString() === receiverId.toString() ? req.userId : undefined, // Si el receptor es el comprador, el que envía es el vendedor (req.userId)
      });
      await notification.save();
      emitNotification(receiverId, notification);
    }

    res.status(201).json({ message: "Mensaje enviado", message: newMessage });
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de Notificaciones
app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

app.put("/api/notifications/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada o no pertenece al usuario." });
    }
    res.status(200).json({ message: "Notificación marcada como leída.", notification });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
});

// Rutas de Dashboard/Estadísticas
app.get("/api/dashboard/stats", authenticate, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({ userId: req.userId });
    const productsInSale = await Product.countDocuments({ userId: req.userId, isOnSale: true });
    const totalSales = await Purchase.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalPurchases = await Purchase.aggregate([
      { $match: { buyerId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    res.status(200).json({
      totalProducts,
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

  // Listener para unirse a una sala de chat específica (por chatId)
  socket.on("joinChatRoom", (chatId) => {
    if (chatId) {
      socket.join(chatId);
      console.log(`🔌 Cliente unido a la sala de chat: ${chatId}`);
    } else {
      console.error("Error: chatId es null o undefined al unirse a sala de chat");
    }
  });


  socket.on("sendMessage", async (data) => {
    const { chatId, senderId, content } = data; // Esperamos un chatId, senderId y content
    try {
      const chat = await Chat.findOne({ chatId: chatId });
      if (!chat) {
        console.error(`Chat con ID ${chatId} no encontrado.`);
        return;
      }

      const newMessage = {
        sender: senderId,
        content: content,
        timestamp: new Date()
      };

      chat.messages.push(newMessage);
      await chat.save();

      // Emitir el mensaje a todos en la sala de chat
      io.to(chatId).emit("newMessage", newMessage);

      // Opcional: Notificar al otro usuario si está offline o en otra página
      const receiverId = chat.buyerId.toString() === senderId ? chat.sellerId : chat.buyerId;
      if (receiverId.toString() !== senderId) { // No te notifiques a ti mismo
        const notification = new Notification({
          userId: receiverId,
          message: `Tienes un nuevo mensaje en el chat de ${chat.productId.name}.`,
          productId: chat.productId,
          type: 'chat_message',
        });
        await notification.save();
        emitNotification(receiverId, notification); // Usa la función de utilidad
      }

    } catch (error) {
      console.error("Error al procesar y emitir mensaje de socket:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado");
  });
});

// ----------------------------------------------------
// SERVICIO DE ARCHIVOS ESTÁTICOS Y RUTAS DEL FRONTEND
// ----------------------------------------------------

// CORRECCIÓN CLAVE: Servir archivos estáticos desde la carpeta /dist
// Esto debe ir ANTES de /public si dist contiene tu index.html principal
app.use(express.static(path.join(__dirname, 'dist')));

// Servir archivos estáticos desde la carpeta /public
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img'))); // Si tienes una carpeta 'img' dentro de 'public'


// CORRECCIÓN CLAVE: Ruta específica para servir index.html desde la raíz
// Ahora apunta al index.html dentro de 'dist'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Manejo de rutas que no son API para aplicaciones SPA (Single Page Applications)
// Esto es útil si usas routing en el frontend (ej. React Router, Vue Router)
// y quieres que las rutas como /pago se manejen en el frontend
// y no resulten en 404 si no son rutas API.
// SI NO ES UNA SPA, ESTA RUTA NO ES NECESARIA O PUEDE INTERFERIR.
app.get('*', (req, res) => {
    // Si la solicitud no es a una API y no es un archivo estático ya servido,
    // envía el index.html para que el enrutador del frontend maneje la ruta.
    // Esto es solo si tu frontend es una SPA y tiene rutas como /pago.
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});


// Iniciar el servidor
server.listen(PORT, () => { // Usamos server.listen para que Socket.io funcione
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
// server.js - Añadir esto para manejar el pedido (ejemplo básico)
app.post('/api/place-order', (req, res) => {
  const orderData = req.body;
  console.log('Pedido recibido:', orderData);
  // Aquí iría la lógica real: guardar en DB, procesar pago, etc.
  if (orderData && orderData.items && orderData.items.length > 0) {
    res.status(200).json({ message: 'Pedido procesado con éxito', orderId: 'ORD' + Date.now() });
  } else {
    res.status(400).json({ message: 'No hay productos en el pedido.' });
  }
});