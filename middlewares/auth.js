const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Verifica que el token esté presente en el encabezado 'Authorization'
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    // Eliminar el prefijo 'Bearer ' si está presente en el token
    const tokenWithoutBearer = token.replace('Bearer ', '');

    try {
        // Verificar el token usando la clave secreta
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.user = decoded; // Guardar los datos del usuario decodificados en la solicitud
        next(); // Continuar con el siguiente middleware o controlador
    } catch (err) {
        // Si el token es inválido o ha expirado
        res.status(403).json({ error: 'Token inválido o expirado' });
    }
};
