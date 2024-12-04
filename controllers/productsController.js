const sql = require('mssql');
const poolPromise = require('../db');

exports.getAll = async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Producto WHERE idEstado = 1');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

exports.create = async (req, res) => {
    const { nombreProducto, marcaProducto, codigoProducto, stockProducto, precioProducto, imagenProducto, idCategoria, idEstado } = req.body;

    try {
        const pool = await poolPromise;

        // Insertar el producto en la base de datos
        await pool.request()
            .input('nombreProducto', sql.VarChar, nombreProducto)
            .input('marcaProducto', sql.VarChar, marcaProducto)
            .input('codigoProducto', sql.VarChar, codigoProducto)
            .input('stockProducto', sql.Int, stockProducto)
            .input('precioProducto', sql.Decimal, precioProducto)
            .input('imagenProducto', sql.NVarChar, imagenProducto)
            .input('idCategoria', sql.Int, idCategoria)
            .input('idEstado', sql.Int, idEstado)
            .query('INSERT INTO Producto (nombreProducto, marcaProducto, codigoProducto, stockProducto, precioProducto, imagenProducto, idCategoria, idEstado) VALUES (@nombreProducto, @marcaProducto, @codigoProducto, @stockProducto, @precioProducto, @imagenProducto, @idCategoria, @idEstado)');

        res.json({ message: 'Producto creado con éxito' });

    } catch (err) {
        console.error("Error al crear el producto:", err);
        res.status(500).json({ error: 'Error al crear producto', details: err.message });
    }
};



exports.update = async (req, res) => {
    const { idProducto } = req.params;  
    const { nombreProducto, marcaProducto, codigoProducto, stockProducto, precioProducto, imagenProducto, idCategoria, idEstado } = req.body;

    try {
        const pool = await poolPromise;

        // Ejecutar la consulta SQL para actualizar el producto
        const result = await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .input('nombreProducto', sql.VarChar, nombreProducto)
            .input('marcaProducto', sql.VarChar, marcaProducto)
            .input('codigoProducto', sql.VarChar, codigoProducto)
            .input('stockProducto', sql.Int, stockProducto)
            .input('precioProducto', sql.Decimal, precioProducto)
            .input('imagenProducto', sql.NVarChar, imagenProducto)
            .input('idCategoria', sql.Int, idCategoria)
            .input('idEstado', sql.Int, idEstado)
            .query(`
                UPDATE Producto
                SET nombreProducto = @nombreProducto,
                    marcaProducto = @marcaProducto,
                    codigoProducto = @codigoProducto,
                    stockProducto = @stockProducto,
                    precioProducto = @precioProducto,
                    imagenProducto = @imagenProducto,
                    idCategoria = @idCategoria,
                    idEstado = @idEstado
                WHERE idProducto = @idProducto
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado con éxito' });

    } catch (err) {
        console.error("Error al actualizar el producto:", err);
        res.status(500).json({ error: 'Error al actualizar producto', details: err.message });
    }
};


exports.delete = async (req, res) => {
    const { idProducto } = req.params;  

    try {
        const pool = await poolPromise;

        // Ejecutar la consulta SQL para eliminar el producto
        const result = await pool.request()
            .input('idProducto', sql.Int, idProducto)
            .query('DELETE FROM Producto WHERE idProducto = @idProducto');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado con éxito' });

    } catch (err) {
        console.error("Error al eliminar el producto:", err);
        res.status(500).json({ error: 'Error al eliminar producto', details: err.message });
    }
};

