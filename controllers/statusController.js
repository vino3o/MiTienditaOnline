const sql = require('mssql');
const poolPromise = require('../db');

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Estado');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener estados' });
    }
};

exports.create = async (req, res) => {
    const { nombreEstado, descripcionEstado } = req.body;

    try {
        const pool = await poolPromise;

        // Insertar el estado en la base de datos
        await pool.request()
            .input('nombreEstado', sql.VarChar, nombreEstado)
            .input('descripcionEstado', sql.VarChar, descripcionEstado)
            .query('INSERT INTO Estado (nombreEstado, descripcionEstado, fechaModificacionEstado) ' + 
                   'VALUES (@nombreEstado, @descripcionEstado, GETDATE())');

        res.json({ message: 'Estado creado con éxito' });
    } catch (err) {
        console.error("Error al crear el estado:", err);
        res.status(500).json({ error: 'Error al crear estado', details: err.message });
    }
};

exports.update = async (req, res) => {
    const { idEstado } = req.params;  
    const { nombreEstado, descripcionEstado } = req.body;  

    try {
        const pool = await poolPromise;

        const result = await pool.request()
        .input('idEstado', sql.Int, idEstado)
        .input('nombreEstado', sql.VarChar, nombreEstado)
        .input('descripcionEstado', sql.VarChar, descripcionEstado)
            .query('UPDATE Estado SET nombreEstado = @nombreEstado, descripcionEstado = @descripcionEstado, fechaModificacionEstado = GETDATE() WHERE idEstado = @idEstado');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }

        res.json({ message: 'Estado actualizado con éxito' });
    } catch (err) {
        console.error("Error al actualizar la Estado:", err);
        res.status(500).json({ error: 'Error al actualizar estado', details: err.message });
    }
};

exports.delete = async (req, res) => {
    const { idEstado } = req.params;  

    try {
        const pool = await poolPromise;

        // Ejecutar la consulta SQL para eliminar el estado
        const result = await pool.request()
            .input('idEstado', sql.Int, idEstado)
            .query('DELETE FROM Estado WHERE idEstado = @idEstado');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Estado no encontrado' });
        }

        res.json({ message: 'Estado eliminado con éxito' });

    } catch (err) {
        console.error("Error al eliminar el estado:", err);
        res.status(500).json({ error: 'Error al eliminar el estado', details: err.message });
    }
};
