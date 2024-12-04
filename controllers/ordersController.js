const sql = require('mssql');
const poolPromise = require('../db');

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Pedido');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener pedidos' });
    }
};

exports.create = async (req, res) => {
    const { idUsuario, idEstado, direccionEnvio, totalPedido, fechaEntrega } = req.body;

    try {
        const pool = await poolPromise;

        // Insertar el encabezado del pedido 
        const result = await pool.request()
            .input('idUsuario', sql.Int, idUsuario)
            .input('idEstado', sql.Int, idEstado)
            .input('direccionEnvio', sql.VarChar, direccionEnvio)
            .input('totalPedido', sql.Decimal, totalPedido)
            .input('fechaEntrega', sql.Date, fechaEntrega)
            .query('INSERT INTO Pedido (idUsuario, idEstado, direccionEnvio, totalPedido, fechaEntrega) OUTPUT INSERTED.idPedido VALUES (@idUsuario, @idEstado, @direccionEnvio, @totalPedido, @fechaEntrega)');

        const idPedido = result.recordset[0].idPedido;  // Obtener el id del pedido insertado

        res.json({ message: 'Pedido creado con éxito', idPedido });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear pedido', details: err.message });
    }
};

exports.update = async (req, res) => {
    const { idPedido } = req.params;  // idPedido del URL
    const { idEstado, direccionEnvio, totalPedido, fechaEntrega } = req.body;  // Nuevos datos

    try {
        const pool = await poolPromise;

        // Actualizar el encabezado del pedido
        await pool.request()
            .input('idPedido', sql.Int, idPedido)
            .input('idEstado', sql.Int, idEstado)
            .input('direccionEnvio', sql.VarChar, direccionEnvio)
            .input('totalPedido', sql.Decimal, totalPedido)
            .input('fechaEntrega', sql.Date, fechaEntrega)
            .query('UPDATE Pedido SET idEstado = @idEstado, direccionEnvio = @direccionEnvio, totalPedido = @totalPedido, fechaEntrega = @fechaEntrega WHERE idPedido = @idPedido');

        res.json({ message: 'Pedido actualizado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar pedido', details: err.message });
    }
};

exports.delete = async (req, res) => {
    const { idPedido } = req.params;  // idPedido del URL

    try {
        const pool = await poolPromise;

        // Eliminar los detalles del pedido
        await pool.request()
            .input('idPedido', sql.Int, idPedido)
            .query('DELETE FROM DetallePedido WHERE idPedido = @idPedido');

        // Eliminar el encabezado del pedido
        await pool.request()
            .input('idPedido', sql.Int, idPedido)
            .query('DELETE FROM Pedido WHERE idPedido = @idPedido');

        res.json({ message: 'Pedido eliminado con éxito' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al eliminar pedido', details: err.message });
    }
};
