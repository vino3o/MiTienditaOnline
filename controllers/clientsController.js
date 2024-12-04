const bcrypt = require('bcryptjs');  // Para encriptar la contraseña
const poolPromise = require('../db');  // Conexión a la base de datos
const sql = require('mssql');  // Importar sql para las consultas

// Función para encriptar la contraseña
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);  // Generar un "salt" con 10 rondas
    return await bcrypt.hash(password, salt);  // Retorna la contraseña encriptada
};

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Usuario WHERE idRol = 2');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener clientes' });
    }
};

exports.create = async (req, res) => {
    const { emailUsuario, contrasenaUsuario, nombreCompletoUsuario, telefonoUsuario, fechaNacimientoUsuario, idRol, idEstado } = req.body;

    try {
        const pool = await poolPromise;
        const idRol = 2; //Rol de cliente

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

        res.json({ message: 'Cliente creado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear el cliente', details: err.message });
    }
};

exports.update = async (req, res) => {
    const { idUsuario } = req.params;
    const { emailUsuario, contrasenaUsuario, nombreCompletoUsuario, telefonoUsuario, fechaNacimientoUsuario, idEstado } = req.body;

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
            .input('idEstado', sql.Int, idEstado)
            .query('UPDATE Usuario SET emailUsuario = @emailUsuario, contrasenaUsuario = COALESCE(@contrasenaUsuario, contrasenaUsuario), nombreCompletoUsuario = @nombreCompletoUsuario, telefonoUsuario = @telefonoUsuario, fechaNacimientoUsuario = @fechaNacimientoUsuario, idEstado = @idEstado WHERE idUsuario = @idUsuario');

        res.json({ message: 'Cliente actualizado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el cliente', details: err.message });
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

        res.json({ message: 'Cliente eliminado con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar el Cliente', details: err.message });
    }
};