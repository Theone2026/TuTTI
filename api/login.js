const { json } = require('micro');
const cors = require('cors');
const jwt = require('jsonwebtoken');

// Orígenes permitidos
const allowedOrigins = ['http://localhost:5173', 'https://tu-frontend.vercel.app'];  // Asegúrate de que tu frontend esté configurado correctamente
const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ['POST'],
});

const JWT_SECRET = 'mi_super_secreto';  // Clave secreta para JWT

module.exports = async (req, res) => {
  // Aplica el CORS
  corsMiddleware(req, res, () => {});

  if (req.method === 'POST') {
    const { email, password } = await json(req);

    // Lógica de autenticación aquí (puedes conectar con una base de datos en producción)
    if (email === 'admin' && password === 'admin123') {
      // Generar JWT para el usuario
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        message: 'Autenticación exitosa',
        token,
      });
    } else {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
};
