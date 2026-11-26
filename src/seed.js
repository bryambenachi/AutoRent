require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function crearAdministrador() {
    try {
        const passwordHash = await bcrypt.hash('AutoRent123!', 12);

        await db.query(
            `INSERT INTO usuarios (nombre, email, password_hash, rol)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING`,
            [
                'Administrador',
                'admin@autorent.com',
                passwordHash,
                'Administrador'
            ]
        );

        console.log('Usuario administrador creado o ya existente.');

    } catch (error) {
        console.error('Error al crear administrador:', error);
        process.exitCode = 1;
    } finally {
        await db.end();
    }
}

crearAdministrador();