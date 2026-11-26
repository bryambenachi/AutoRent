
const express = require('express');
const router = express.Router();
const db = require('./config/database');

// VERIFICAR SESIÓN
function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión.'
        });
    }

    next();
}

// CONSULTAR CLIENTES
router.get('/', verificarSesion, async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM clientes ORDER BY id DESC'
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error('Error al consultar clientes:', error);

        res.status(500).json({
            mensaje: 'Error al consultar los clientes.'
        });
    }
});

// REGISTRAR CLIENTES
router.post('/', verificarSesion, async (req, res) => {
    try {
        const {
            nombre,
            documento,
            telefono,
            email,
            direccion
        } = req.body;

        if (!nombre || !documento || !telefono || !email) {
            return res.status(400).json({
                mensaje: 'Completa todos los campos obligatorios.'
            });
        }

        const resultado = await db.query(
            `INSERT INTO clientes
            (nombre, documento, telefono, email, direccion)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                nombre.trim(),
                documento.trim(),
                telefono.trim(),
                email.trim().toLowerCase(),
                direccion?.trim() || null
            ]
        );

        res.status(201).json({
            mensaje: 'Cliente registrado correctamente.',
            cliente: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar cliente:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensaje: 'El documento o correo ya está registrado.'
            });
        }

        res.status(500).json({
            mensaje: 'Error al registrar el cliente.'
        });
    }
});

module.exports = router;
