
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

// REGISTRAR RESERVA
router.post('/', verificarSesion, async (req, res) => {
    const { cliente_id, vehiculo_id, fecha_inicio, fecha_fin } = req.body;

    if (!cliente_id || !vehiculo_id || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({
            mensaje: 'Completa todos los campos de la reserva.'
        });
    }

    if (fecha_fin <= fecha_inicio) {
        return res.status(400).json({
            mensaje: 'La fecha final debe ser posterior a la fecha inicial.'
        });
    }

    const conexion = await db.connect();

    try {
        await conexion.query('BEGIN');

        // Verificar que el cliente exista
        const cliente = await conexion.query(
            'SELECT id FROM clientes WHERE id = $1',
            [cliente_id]
        );

        if (cliente.rows.length === 0) {
            await conexion.query('ROLLBACK');
            return res.status(404).json({
                mensaje: 'El cliente seleccionado no existe.'
            });
        }

        // Bloquear el vehículo mientras se verifica la reserva
        const vehiculo = await conexion.query(
            'SELECT id, estado FROM vehiculos WHERE id = $1 FOR UPDATE',
            [vehiculo_id]
        );

        if (vehiculo.rows.length === 0) {
            await conexion.query('ROLLBACK');
            return res.status(404).json({
                mensaje: 'El vehículo seleccionado no existe.'
            });
        }

        if (vehiculo.rows[0].estado !== 'Disponible') {
            await conexion.query('ROLLBACK');
            return res.status(409).json({
                mensaje: 'Este vehículo no está disponible.'
            });
        }

        // Verificar que no existan reservas confirmadas en esas fechas
        const cruce = await conexion.query(
            `SELECT id
             FROM reservas
             WHERE vehiculo_id = $1
             AND estado = 'Confirmada'
             AND fecha_inicio <= $3
             AND fecha_fin >= $2`,
            [vehiculo_id, fecha_inicio, fecha_fin]
        );

        if (cruce.rows.length > 0) {
            await conexion.query('ROLLBACK');
            return res.status(409).json({
                mensaje: 'El vehículo ya tiene una reserva confirmada en esas fechas.'
            });
        }

        // Guardar reserva
        const resultado = await conexion.query(
            `INSERT INTO reservas
            (cliente_id, vehiculo_id, fecha_inicio, fecha_fin, estado)
            VALUES ($1, $2, $3, $4, 'Confirmada')
            RETURNING *`,
            [cliente_id, vehiculo_id, fecha_inicio, fecha_fin]
        );

        await conexion.query('COMMIT');

        res.status(201).json({
            mensaje: '¡Reserva registrada y confirmada correctamente!',
            reserva: resultado.rows[0]
        });

    } catch (error) {
        await conexion.query('ROLLBACK');

        console.error('Error al registrar reserva:', error);

        res.status(500).json({
            mensaje: 'Error al registrar la reserva.'
        });

    } finally {
        conexion.release();
    }
});

module.exports = router;
