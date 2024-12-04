const bcrypt = require('bcryptjs');  // Para encriptar la contraseña
const jwt = require('jsonwebtoken');
const poolPromise = require('../db');  // Conexión a la base de datos
const sql = require('mssql');  // Importar sql para las consultas

// Función para encriptar la contraseña
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);  // Generar un "salt" con 10 rondas
    return await bcrypt.hash(password, salt);  // Retorna la contraseña encriptada
};

exports.login = async (req, res) => {
    const { emailUsuario, contrasenaUsuario } = req.body;  // Datos enviados en la solicitud

    try {
        // Buscar al usuario por correo electrónico
        const pool = await poolPromise;
        const result = await pool.request()
            .input('emailUsuario', sql.VarChar, emailUsuario)
            .query('SELECT * FROM Usuario WHERE emailUsuario = @emailUsuario');
        
        const usuario = result.recordset[0];  // Tomamos el primer usuario encontrado

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });  // Si el usuario no existe
        }

        // Comparar la contraseña directamente (sin bcrypt)
        if (contrasenaUsuario !== usuario.contrasenaUsuario) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });  // Si la contraseña no coincide
        }

        // Generar un token JWT
        const payload = {
            idUsuario: usuario.idUsuario,
            emailUsuario: usuario.emailUsuario,
            idRol: usuario.idRol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

        // Responder con el token
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Usuario');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

exports.create = async (req, res) => {
    const { emailUsuario, contrasenaUsuario, nombreCompletoUsuario, telefonoUsuario, fechaNacimientoUsuario, idRol, idEstado } = req.body;

    try {
        const pool = await poolPromise;

        // Encriptar la contraseña antes de almacenarla
        const encryptedPassword = await encryptPassword(contrasenaUsuario);

        // Insertar el nuevo usuario con la contraseña encriptada
        await pool.request()
            .input('emailUsuario', sql.VarChar, emailUsuario)
            .input('contrasenaUsuario', sql.VarChar, encryptedPassword)
            .input('nombreCompletoUsuario', sql.VarChar, nombreCompletoUsuario)
            .input('telefonoUsuario', sql.VarChar, telefonoUsuario)
            .input('fechaNacimientoUsuario', sql.Date, fechaNacimientoUsuario)
            .input('idRol', sql.Int, idRol)
            .input('idEstado', sql.Int, idEstado)
            .query('INSERT INTO Usuario (emailUsuario, contrasenaUsuario, nombreCompletoUsuario, telefonoUsuario, fechaNacimientoUsuario, idRol, idEstado) VALUES (@emailUsuario, @contrasenaUsuario, @nombreCompletoUsuario, @telefonoUsuario, @fechaNacimientoUsuario, @idRol, @idEstado)');

        res.json({ message: 'Usuario creado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el usuario', details: err.message });
    }
};

exports.update = async (req, res) => {
    const { idUsuario } = req.params;
    const { emailUsuario, contrasenaUsuario, nombreCompletoUsuario, telefonoUsuario, fechaNacimientoUsuario, idRol, idEstado } = req.body;

    try {
        const pool = await poolPromise;

        // Si la contraseña fue actualizada, encriptarla
        let encryptedPassword = null;
        if (contrasenaUsuario) {
            encryptedPassword = await encryptPassword(contrasenaUsuario);  // Encriptar la nueva contraseña
        }

        // Actualizar el usuario
        await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .input('emailUsuario', sql.VarChar, emailUsuario)
            .input('contrasenaUsuario', sql.VarChar, encryptedPassword || null)  // Si la contraseña no es nueva, no la actualices
            .input('nombreCompletoUsuario', sql.VarChar, nombreCompletoUsuario)
            .input('telefonoUsuario', sql.VarChar, telefonoUsuario)
            .input('fechaNacimientoUsuario', sql.Date, fechaNacimientoUsuario)
            .input('idRol', sql.Int, idRol)
            .input('idEstado', sql.Int, idEstado)
            .query('UPDATE Usuario SET emailUsuario = @emailUsuario, contrasenaUsuario = COALESCE(@contrasenaUsuario, contrasenaUsuario), nombreCompletoUsuario = @nombreCompletoUsuario, telefonoUsuario = @telefonoUsuario, fechaNacimientoUsuario = @fechaNacimientoUsuario, idRol = @idRol, idEstado = @idEstado WHERE idUsuario = @idUsuario');

        res.json({ message: 'Usuario actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el usuario', details: err.message });
    }
};

exports.delete = async (req, res) => {
    const { idUsuario } = req.params;

    try {
        const pool = await poolPromise;

        // Eliminar el usuario
        await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .query('DELETE FROM Usuario WHERE idUsuario = @idUsuario');

        res.json({ message: 'Usuario eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el usuario', details: err.message });
    }
};