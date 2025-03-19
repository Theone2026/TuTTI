module.exports = async (req, res) => {
  // Agregar los encabezados CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://tutti-tienda.vercel.app'); // Permite solo solicitudes desde tu dominio de frontend en Vercel
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Responder a las solicitudes preflight de CORS
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { email, password, fullName, phoneNumber, address, city, postalCode, country } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
      }

      // Simulación de un registro exitoso
      const user = {
        email,
        fullName,
        phoneNumber,
        address,
        city,
        postalCode,
        country,
      };

      return res.status(200).json({ message: 'Usuario registrado con éxito', user });

    } catch (error) {
      console.error('Error en el registro:', error);
      return res.status(500).json({ message: 'Hubo un error al registrar el usuario. Inténtalo de nuevo.' });
    }
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
};
