const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sql = require('mssql'); // Importar sql de mssql para la conexión a la base de datos
const poolPromise = require('./db'); // Asegúrate de tener tu conexión a DB

// Cargar variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());
app.use(cors());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('¡Bienvenido a Mi Tiendita Online!');
});

// Endpoint de Login
app.post('/api/login', async (req, res) => {
    const { emailUsuario, contrasenaUsuario } = req.body;

    try {
        // Conectar con la base de datos
        const pool = await poolPromise;
        const result = await pool.request()
            .input('emailUsuario', sql.VarChar, emailUsuario)
            .query('SELECT * FROM Usuario WHERE emailUsuario = @emailUsuario');

        const user = result.recordset[0]; // Supongamos que el resultado es un solo usuario

        // Si no se encuentra el usuario, responder con error
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        // Comparar las contraseñas en texto plano (sin encriptación)
        if (contrasenaUsuario !== user.contrasenaUsuario) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.idUsuario, emailUsuario: user.emailUsuario, idRol: user.idRol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Devolver el token en la respuesta
        res.json({ token });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Importar rutas
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const statusRoutes = require('./routes/status');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');
const clientsRoutes = require('./routes/clients');
const auth = require('./middlewares/auth');

// Usar rutas con autenticación para productos
app.use('/api/products', auth, productsRoutes);
app.use('/api/categories', auth, categoriesRoutes);
app.use('/api/status', auth, statusRoutes);
app.use('/api/users', auth, usersRoutes);
app.use('/api/orders', auth, ordersRoutes);
app.use('/api/clients', auth, clientsRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
