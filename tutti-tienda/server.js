import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Para poder manejar datos JSON en las solicitudes

// Base de datos ficticia para demostrar (deberías usar una base de datos real)
const users = [
  { email: 'user@example.com', password: '123456', fullName: 'Juan Pérez', phoneNumber: '+1 234 567 890', address: 'Calle Falsa 123', city: 'Ciudad de México' }
];

// Ruta para manejar el login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe y la contraseña es correcta
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Si la autenticación es exitosa, responder con el correo del usuario
    res.status(200).json({ message: 'Login exitoso', email: user.email });
  } else {
    // Si no, responder con un mensaje de error
    res.status(400).json({ message: 'Credenciales incorrectas' });
  }
});

// Ruta para manejar el registro de nuevos usuarios
app.post('/register', (req, res) => {
  const { email, password, fullName, phoneNumber, address, city } = req.body;

  // Verificar si el usuario ya existe
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
  }

  // Si no existe, agregar el nuevo usuario a la base de datos ficticia
  users.push({ email, password, fullName, phoneNumber, address, city });

  // Responder con un mensaje de éxito
  res.status(201).json({ message: 'Cuenta creada con éxito' });
});

// Ruta para obtener el perfil del usuario
app.get('/profile', (req, res) => {
  const { email } = req.query; // Asumimos que el correo se envía como query

  // Buscar al usuario por su correo
  const user = users.find(u => u.email === email);

  if (user) {
    // Si se encuentra el usuario, devolver la información
    res.status(200).json({ user });
  } else {
    // Si no, responder con un error
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

// Ruta para actualizar el perfil del usuario
app.post('/updateProfile', (req, res) => {
  const { email } = req.query;
  const { fullName, phoneNumber, address, city } = req.body;

  // Buscar al usuario
  const user = users.find(u => u.email === email);

  if (user) {
    // Actualizar los datos del perfil
    user.fullName = fullName;
    user.phoneNumber = phoneNumber;
    user.address = address;
    user.city = city;

    // Responder con éxito
    res.status(200).json({ message: 'Perfil actualizado con éxito' });
  } else {
    // Si el usuario no existe
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
