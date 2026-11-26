
const express = require('express');
const router = express.Router();
const db = require('./config/database');

// Verificar que el usuario haya iniciado sesión
function verificarSesion(req, res, next) {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'Debes iniciar sesión.'
        });
    }

    next();
}

// Consultar vehículos registrados
router.get('/', verificarSesion, async (req, res) => {
    try {
        const resultado = await db.query(
            'SELECT * FROM vehiculos ORDER BY id DESC'
        );

        res.json(resultado.rows);

    } catch (error) {
        console.error('Error al consultar vehículos:', error);

        res.status(500).json({
            mensaje: 'Error al consultar los vehículos.'
        });
    }
});

// Registrar un vehículo
router.post('/', verificarSesion, async (req, res) => {
    try {
        let {
            placa,
            marca,
            modelo,
            tipo,
            caracteristicas,
            estado
        } = req.body;

        // Validar campos obligatorios
        if (!placa || !marca || !modelo || !tipo) {
            return res.status(400).json({
                mensaje: 'Completa todos los campos obligatorios.'
            });
        }

        placa = placa.trim().toUpperCase();

        // Validar estado
        const estadosPermitidos = [
            'Disponible',
            'Alquilado',
            'Mantenimiento'
        ];

        if (estado && !estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado seleccionado no es válido.'
            });
        }

        // Guardar vehículo
        const resultado = await db.query(
            `INSERT INTO vehiculos
            (placa, marca, modelo, tipo, caracteristicas, estado)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                placa,
                marca.trim(),
                modelo.trim(),
                tipo,
                caracteristicas || '',
                estado || 'Disponible'
            ]
        );

        res.status(201).json({
            mensaje: 'Vehículo registrado correctamente.',
            vehiculo: resultado.rows[0]
        });

    } catch (error) {
        console.error('Error al registrar vehículo:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensaje: 'Ya existe un vehículo registrado con esa placa.'
            });
        }

        res.status(500).json({
            mensaje: 'No se pudo registrar el vehículo.'
        });
    }
});

module.exports = router;
