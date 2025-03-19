const mongoose = require('mongoose');

// Configura tu URL de conexión a MongoDB
const mongoURI = "mongodb+srv://Tutti:Maikelfox@cluster0.uw1mo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Conectar a la base de datos
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.log('Error de conexión: ', err));
