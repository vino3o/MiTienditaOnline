const sql = require('mssql');
const poolPromise = require('../db');

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Categoria WHERE idEstado = 1');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
};

exports.create = async (req, res) => {
    const { nombreCategoria, descripcionCategoria, idEstado, idUsuario } = req.body;

    try {
        const pool = await poolPromise;

        // Insertar la categoría en la base de datos
        await pool.request()
            .input('nombreCategoria', sql.VarChar, nombreCategoria)
            .input('descripcionCategoria', sql.VarChar, descripcionCategoria)
            .input('idEstado', sql.Int, idEstado)
            .input('idUsuario', sql.Int, idUsuario)
            .query('INSERT INTO Categoria (nombreCategoria, descripcionCategoria, idEstado, idUsuario, fechaModificacionCategoria) ' + 
                   'VALUES (@nombreCategoria, @descripcionCategoria, @idEstado, @idUsuario, GETDATE())');

        res.json({ message: 'Categoría creada con éxito' });
    } catch (err) {
        console.error("Error al crear la categoría:", err);
        res.status(500).json({ error: 'Error al crear categoría', details: err.message });
    }
};

exports.update = async (req, res) => {
    const { idCategoria } = req.params;  
    const { nombreCategoria, descripcionCategoria, idEstado } = req.body;  

    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('idCategoria', sql.Int, idCategoria)
            .input('nombreCategoria', sql.VarChar, nombreCategoria)
            .input('descripcionCategoria', sql.VarChar, descripcionCategoria)
            .input('idEstado', sql.Int, idEstado)
            .query('UPDATE Categoria SET nombreCategoria = @nombreCategoria, descripcionCategoria = @descripcionCategoria, ' +
                   'idEstado = @idEstado, fechaModificacionCategoria = GETDATE() WHERE idCategoria = @idCategoria');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json({ message: 'Categoría actualizada con éxito' });
    } catch (err) {
        console.error("Error al actualizar la categoría:", err);
        res.status(500).json({ error: 'Error al actualizar categoría', details: err.message });
    }
};

exports.delete = async (req, res) => {
    const { idCategoria } = req.params;  

    try {
        const pool = await poolPromise;

        // Ejecutar la consulta SQL para eliminar la categoria
        const result = await pool.request()
            .input('idCategoria', sql.Int, idCategoria)
            .query('DELETE FROM Categoria WHERE idCategoria = @idCategoria');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Categoria no encontrado' });
        }

        res.json({ message: 'Categoria eliminada con éxito' });

    } catch (err) {
        console.error("Error al eliminar la categoria:", err);
        res.status(500).json({ error: 'Error al eliminar categoria', details: err.message });
    }
};
