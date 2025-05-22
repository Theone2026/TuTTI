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
});