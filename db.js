const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Usa true si estás en Azure, false para local
        trustServerCertificate: true,
    },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conexión a SQL Server exitosa');
        return pool;
    })
    .catch(err => {
        console.error('Error en la conexión a la base de datos:', err);
    });

module.exports = poolPromise;
