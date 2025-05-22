// server.js

// Importaciones de módulos
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from 'uuid';
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { v2 as cloudinary } from 'cloudinary';

// Cargar variables de entorno al inicio
dotenv.config();

// Configuración de ES Modules para __filename y __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
<<<<<<< HEAD
const server = http.createServer(app); // Crear servidor HTTP para Express y Socket.IO

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// --- Configuración de CORS Centralizada ---
// Define todos los orígenes permitidos para tu frontend
const RAILWAY_APP_URL = process.env.RAILWAY_APP_URL; // Tu dominio en Railway (se leerá de las variables de entorno)
const LOCAL_VITE_DEV_SERVER = 'http://localhost:5174'; // Origen común para el servidor de desarrollo de Vite
const LOCAL_BACKEND_SERVER_ORIGIN = 'http://localhost:3000'; // El origen de tu propio backend, si el frontend es servido desde aquí en algún escenario

const allowedOrigins = [LOCAL_BACKEND_SERVER_ORIGIN]; // Siempre permitir el origen del propio backend

if (RAILWAY_APP_URL) {
    // Si la variable de entorno RAILWAY_APP_URL existe, añádela a los orígenes permitidos
    allowedOrigins.push(RAILWAY_APP_URL);
}

// Si LOCAL_VITE_DEV_SERVER es diferente del origen del backend, añádelo también
if (LOCAL_VITE_DEV_SERVER && !allowedOrigins.includes(LOCAL_VITE_DEV_SERVER)) {
    allowedOrigins.push(LOCAL_VITE_DEV_SERVER);
}

// Configuración de Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins, // Usa el array de orígenes permitidos
    methods: ["GET", "POST"]
=======
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
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
  }
});

// Middleware
app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// 1. Configuración de CORS para Express (rutas API)
const corsOptions = {
  origin: allowedOrigins, // Usa el array de orígenes permitidos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
  credentials: true // Permite el envío de cookies y encabezados de autorización
};
app.use(cors(corsOptions));


// Conexión a la base de datos (MongoDB/Mongoose)
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tutti_market';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));


// --- Definición de Modelos (Asegúrate de que tus modelos reales están aquí o importados) ---

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: String,
    address: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileImage: String,
    phoneNumber: String,
    createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
<<<<<<< HEAD
=======

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    req.userId = decoded.userId;
    req.user = user; // Adjuntar el objeto de usuario a la solicitud
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
    next();
});

const User = mongoose.model('User', UserSchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    category: String,
    images: [String],
    stock: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive', 'archived', 'out_of_stock'], default: 'active' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });
const Product = mongoose.model('Product', ProductSchema);

const CartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 }
});

const CartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Cart = mongoose.model('Cart', CartSchema);

const OrderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Number, required: true } // Precio del producto en el momento de la compra
});

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    paymentId: String, // ID de la transacción de pago
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});
const Order = mongoose.model('Order', OrderSchema);

const ChatMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});
const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'new_message', 'order_status', 'new_offer'
    message: { type: String, required: true },
    link: String, // Link a una página relacionada
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', NotificationSchema);


// --- Middleware de Autenticación JWT ---
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_jwt_key_please_change_this_in_production'; // Usar variable de entorno
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: '🚫 No se proporcionó token de autenticación.' });

    const token = authHeader.split(' ')[1]; // Espera "Bearer TOKEN"
    if (!token) return res.status(401).json({ message: '🚫 Formato de token inválido.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id; // Almacena el ID del usuario en el request
        next();
    } catch (error) {
        console.error("❌ Error de verificación de token:", error);
        return res.status(403).json({ message: '🚫 Token inválido o expirado.' });
    }
};

<<<<<<< HEAD
// Configuración de Multer para la subida de archivos (imágenes de productos, etc.)
// No se almacena en disco, se usa para Cloudinary directamente
const storage = multer.memoryStorage(); // Almacenar el archivo en memoria
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB de límite
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no soportado. Solo imágenes (jpeg, png, gif, webp) son permitidas.'), false);
        }
    }
});


// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, fullName, address, phoneNumber } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'El nombre de usuario o correo electrónico ya está registrado.' });
        }

        const newUser = new User({ username, email, password, fullName, address, phoneNumber });
        await newUser.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        console.error('❌ Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al registrar usuario.' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token, userId: user._id, username: user.username, email: user.email, role: user.role });
    } catch (error) {
        console.error('❌ Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
});

// Obtener perfil de usuario
app.get('/api/user/profile', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password'); // Excluir la contraseña
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('❌ Error al obtener perfil de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener perfil.' });
    }
});

// Actualizar perfil de usuario
app.put('/api/user/profile', authenticate, async (req, res) => {
    try {
        const { username, email, fullName, address, phoneNumber } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.userId,
            { username, email, fullName, address, phoneNumber, updatedAt: Date.now() },
            { new: true, runValidators: true }
        ).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Perfil actualizado exitosamente.', user: updatedUser });
    } catch (error) {
        console.error('❌ Error al actualizar perfil de usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar perfil.' });
    }
});


// --- RUTAS DE PRODUCTOS ---
// Crear un nuevo producto
app.post('/api/products', authenticate, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, stock, currency = 'USD' } = req.body;
        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({ message: 'Todos los campos requeridos deben ser completados.' });
        }

        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                    folder: `tutti_products/${req.userId}` // Organizar por usuario
                })
            );
            const results = await Promise.all(uploadPromises);
            imageUrls = results.map(result => result.secure_url);
        }

        const newProduct = new Product({
            name,
            description,
            price,
            currency,
            category,
            stock,
            images: imageUrls,
            userId: req.userId // Asocia el producto al usuario autenticado
        });

        await newProduct.save();
        res.status(201).json({ message: 'Producto creado exitosamente', product: newProduct });
    } catch (error) {
        console.error('❌ Error al crear producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear producto.' });
    }
});

// Obtener todos los productos (con filtros y paginación opcional)
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, sortBy, order, page = 1, limit = 10 } = req.query;
        let query = { status: 'active', stock: { $gt: 0 } };

        if (category) query.category = category;
        if (search) query.$text = { $search: search }; // Requiere un índice de texto en el esquema de Producto

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        let sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = order === 'asc' ? 1 : -1;
        } else {
            sortOptions.createdAt = -1; // Por defecto, los más recientes
        }

        const products = await Product.find(query)
                                      .sort(sortOptions)
                                      .skip((page - 1) * limit)
                                      .limit(parseInt(limit))
                                      .populate('userId', 'username fullName'); // Opcional: información del vendedor

        const totalProducts = await Product.countDocuments(query);

        res.status(200).json({
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: parseInt(page),
            totalItems: totalProducts
        });
    } catch (error) {
        console.error('❌ Error al obtener productos:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener productos.' });
    }
});

// Obtener productos recientes
app.get('/api/recent-products', async (req, res) => {
    try {
        const products = await Product.find({ status: 'active', stock: { $gt: 0 } })
                                      .sort({ createdAt: -1 }) // Ordena por los más recientes
                                      .limit(10) // Limita a 10 productos
                                      .populate('userId', 'username fullName');
        res.status(200).json(products);
    } catch (error) {
        console.error("❌ Error en /api/recent-products:", error);
        res.status(500).json({ message: "Error interno del servidor al cargar productos recientes." });
    }
});

// Obtener ofertas del día
app.get("/api/ofertas-del-dia", async (req, res) => {
    try {
        const ofertas = await Product.find({ status: 'active', stock: { $gt: 0 }, price: { $lt: 50 } }) // Ejemplo: productos de menos de 50
                                     .sort({ createdAt: -1 })
                                     .limit(5)
                                     .populate('userId', 'username');
        res.status(200).json(ofertas);
    } catch (error) {
        console.error("❌ Error en /api/ofertas-del-dia:", error);
        res.status(500).json({ message: "Error interno del servidor al cargar ofertas." });
    }
});

// Obtener nuevos ingresos
app.get("/api/nuevos-ingresos", async (req, res) => {
    try {
        const nuevosIngresos = await Product.find({ status: 'active', stock: { $gt: 0 } })
                                            .sort({ createdAt: -1 }) // Los más recientes
                                            .limit(5)
                                            .populate('userId', 'username');
        res.status(200).json(nuevosIngresos);
    } catch (error) {
        console.error("❌ Error en /api/nuevos-ingresos:", error);
        res.status(500).json({ message: "Error interno del servidor al cargar nuevos ingresos." });
    }
});


// Obtener un producto por ID
app.get('/api/product/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('userId', 'username fullName profileImage');
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('❌ Error al obtener producto por ID:', error);
        // CastError para IDs inválidos
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Actualizar un producto (solo el propietario o admin)
app.put('/api/products/:id', authenticate, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, stock, status, currency } = req.body;
        const productId = req.params.id;

        let product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        // Verificar que el usuario autenticado es el propietario del producto o un admin
        if (product.userId.toString() !== req.userId && req.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para actualizar este producto.' });
        }

        let imageUrls = product.images; // Mantener imágenes existentes por defecto
        if (req.files && req.files.length > 0) {
            // Subir nuevas imágenes
            const uploadPromises = req.files.map(file =>
                cloudinary.uploader.upload(`data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
                    folder: `tutti_products/${req.userId}`
                })
            );
            const results = await Promise.all(uploadPromises);
            imageUrls = results.map(result => result.secure_url); // Reemplazar con nuevas o añadir a las existentes
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId,
            { name, description, price, category, stock, status, currency, images: imageUrls, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        res.status(200).json({ message: 'Producto actualizado exitosamente', product: updatedProduct });
    } catch (error) {
        console.error('❌ Error al actualizar producto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar producto.' });
    }
});

// Eliminar un producto (solo el propietario o admin)
app.delete('/api/products/:id', authenticate, async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        // Verificar que el usuario autenticado es el propietario del producto o un admin
        if (product.userId.toString() !== req.userId && req.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este producto.' });
        }

        // Opcional: Eliminar imágenes de Cloudinary si es necesario
        // const deletePromises = product.images.map(url => {
        //     const publicId = url.split('/').pop().split('.')[0];
        //     return cloudinary.uploader.destroy(`tutti_products/${req.userId}/${publicId}`);
        // });
        // await Promise.all(deletePromises);

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Producto eliminado exitosamente.' });
    } catch (error) {
        console.error('❌ Error al eliminar producto:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de producto inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor al eliminar producto.' });
    }
});


// --- RUTAS DEL CARRITO ---
// Obtener carrito del usuario
app.get('/api/cart', authenticate, async (req, res) => {
    try {
        // Popula los detalles completos del producto dentro de los ítems del carrito
        let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
        if (!cart) {
            // Si no hay carrito, crea uno vacío para el usuario
            cart = new Cart({ userId: req.userId, items: [] });
            await cart.save();
        }
        res.status(200).json(cart.items);
    } catch (error) {
        console.error('❌ Error al obtener carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor al cargar el carrito.' });
    }
});

// Agregar producto al carrito
app.post('/api/cart/add', authenticate, async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    try {
        let cart = await Cart.findOne({ userId: req.userId });
        const product = await Product.findById(productId);

        if (!product || product.stock < quantity || product.status !== 'active') {
            return res.status(400).json({ message: 'Producto no disponible, sin stock, o inactivo.' });
        }

        if (!cart) {
            cart = new Cart({ userId: req.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // Producto ya en el carrito, actualizar cantidad
            const newQuantity = cart.items[itemIndex].quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({ message: 'No hay suficiente stock disponible para esta cantidad.' });
            }
            cart.items[itemIndex].quantity = newQuantity;
        } else {
            // Agregar nuevo producto al carrito
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        // Recargar el carrito con los productos populados para la respuesta
        const updatedCart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
        res.status(200).json({ message: 'Producto agregado al carrito.', cartItems: updatedCart.items });
    } catch (error) {
        console.error('❌ Error al agregar al carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor al agregar producto al carrito.' });
    }
});

// Actualizar cantidad de producto en el carrito
app.put('/api/cart/update-quantity/:productId', authenticate, async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    try {
        if (typeof quantity !== 'number' || quantity < 0) {
            return res.status(400).json({ message: 'Cantidad inválida.' });
        }

        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito.' });
        }

        if (quantity === 0) {
            // Si la cantidad es 0, eliminar el ítem
            cart.items.splice(itemIndex, 1);
        } else {
            const product = await Product.findById(productId);
            if (!product || product.stock < quantity) {
                return res.status(400).json({ message: 'Stock insuficiente para la cantidad solicitada.' });
            }
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.status(200).json({ message: 'Cantidad de producto actualizada en el carrito.' });
    } catch (error) {
        console.error('❌ Error al actualizar cantidad del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// Eliminar producto del carrito
app.delete('/api/cart/remove/:productId', authenticate, async (req, res) => {
    const { productId } = req.params;
    try {
        const cart = await Cart.findOne({ userId: req.userId });
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado.' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Producto no encontrado en el carrito para eliminar.' });
        }

        await cart.save();
        res.status(200).json({ message: 'Producto eliminado del carrito.' });
    } catch (error) {
        console.error('❌ Error al eliminar del carrito:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});

// --- RUTAS DE ÓRDENES ---
app.post('/api/orders', authenticate, async (req, res) => {
    try {
        const { shippingAddress } = req.body;
        const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío.' });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.productId;
            if (!product || product.stock < item.quantity || product.status !== 'active') {
                return res.status(400).json({ message: `Stock insuficiente o producto no disponible para ${product.name}.` });
            }
            orderItems.push({
                productId: product._id,
                quantity: item.quantity,
                priceAtPurchase: product.price
            });
            totalAmount += product.price * item.quantity;

            // Reducir stock del producto
            product.stock -= item.quantity;
            await product.save();
        }

        const newOrder = new Order({
            userId: req.userId,
            items: orderItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            status: 'pending' // Estado inicial
        });

        await newOrder.save();

        // Vaciar el carrito después de crear la orden
        cart.items = [];
        await cart.save();

        res.status(201).json({ message: 'Orden creada exitosamente.', order: newOrder });
    } catch (error) {
        console.error('❌ Error al crear la orden:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear la orden.' });
    }
});

app.get('/api/orders', authenticate, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.userId })
                                  .populate('items.productId')
                                  .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('❌ Error al obtener órdenes:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener órdenes.' });
    }
});

app.get('/api/orders/:id', authenticate, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.userId })
                                 .populate('items.productId');
        if (!order) {
            return res.status(404).json({ message: 'Orden no encontrada o no pertenece a este usuario.' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error('❌ Error al obtener orden por ID:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de orden inválido.' });
        }
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
});


// --- RUTAS DE NOTIFICACIONES ---
// Obtener notificaciones del usuario
app.get("/api/notifications", authenticate, async (req, res) => {
  const userId = req.userId;
  try {
    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Marcar notificación como leída
app.put("/api/notifications/:id/mark-as-read", authenticate, async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.userId;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: userId }, // Asegurarse de que la notificación pertenece al usuario
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notificación no encontrada o no pertenece al usuario" });
    }

    res.status(200).json({ message: "Notificación marcada como leída" });
  } catch (error) {
        console.error("❌ Error al marcar la notificación como leída:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'ID de notificación inválido.' });
        }
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Marcar todas las notificaciones como leídas
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


// --- Manejo de Socket.IO ---
io.on('connection', (socket) => {
    console.log(`⚡️ Usuario conectado: ${socket.id}`);

    // Unirse a una sala específica de usuario para notificaciones o chat
    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} se unió a la sala del usuario ${userId}`);
    });

    // Manejar mensajes de chat
    socket.on('chatMessage', async (messageData) => {
        const { senderId, receiverId, message } = messageData;
        try {
            // Guardar mensaje en la DB
            const newMessage = new ChatMessage({ senderId, receiverId, message });
            await newMessage.save();

            // Emitir el mensaje al receptor
            io.to(receiverId).emit('receiveMessage', newMessage);
            // También al emisor para que vea su propio mensaje enviado
            io.to(senderId).emit('receiveMessage', newMessage);

        } catch (error) {
            console.error('Error al manejar mensaje de chat:', error);
            // Opcional: Emitir un error al cliente que envió el mensaje
            socket.emit('chatError', 'No se pudo enviar el mensaje.');
        }
    });

    // Manejar notificaciones en tiempo real
    socket.on('sendNotification', async (data) => {
        const { userId, type, message, link } = data;
        try {
            const newNotification = new Notification({ userId, type, message, link });
            await newNotification.save();
            io.to(userId).emit('newNotification', newNotification);
        } catch (error) {
            console.error('Error al enviar notificación por socket:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
    });

    socket.on('error', (err) => {
        console.error(`Socket Error: ${err.message}`);
    });
});


// Servir archivos estáticos del frontend
// ¡AJUSTA ESTA RUTA si tu carpeta de frontend no se llama 'dist' o no está en la raíz del proyecto!
// Por ejemplo, si tu 'server.js' está en 'backend/server.js' y tu frontend está en 'my-project/dist/'
const publicPath = path.join(__dirname, '..', 'dist'); // Considera 'public' si no usas un build tool

// Si tu index.html y assets están directamente en la misma carpeta que server.js (menos común para proyectos grandes)
// const publicPath = __dirname; // Si 'index.html', 'js', 'img' están junto a server.js

app.use(express.static(publicPath));

// Ruta de fallback para el enrutamiento del lado del cliente (para Vue/React/Svelte/etc.)
// Sirve tu index.html para cualquier ruta no reconocida por el backend
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});


// Iniciar el servidor (Express y Socket.IO en el mismo puerto)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor Express y Socket.IO corriendo en http://localhost:${PORT}`);
=======
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
>>>>>>> 6fb3a610a10de6b9a0bc26251e722b7c59f60226
});