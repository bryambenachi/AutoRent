
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./src/config/database');

const app = express();
const vehiculosRoutes = require('./src/vehiculos');
const clientesRoutes = require('./src/clientes');
const reservasRoutes = require('./src/reservas');
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'autorent-clave-local-cambiar',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60
    }
}));

// Rutas de vehículos después de configurar las sesiones
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/reservas', reservasRoutes);
app.use(express.static(path.join(__dirname, 'public')));

// Pantalla principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicio de sesión
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: 'Ingresa el correo y la contraseña.'
            });
        }

        const resultado = await db.query(
            'SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE',
            [email]
        );

        if (resultado.rows.length === 0) {
            return res.status(401).json({
                mensaje: 'Usuario o contraseña incorrectos.'
            });
        }

        const usuario = resultado.rows[0];

        const coincide = await bcrypt.compare(
            password,
            usuario.password_hash
        );

        if (!coincide) {
            return res.status(401).json({
                mensaje: 'Usuario o contraseña incorrectos.'
            });
        }

        req.session.regenerate((error) => {
            if (error) {
                return res.status(500).json({
                    mensaje: 'No se pudo iniciar la sesión.'
                });
            }

            req.session.usuario = {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            };

            req.session.save((errorGuardar) => {
                if (errorGuardar) {
                    return res.status(500).json({
                        mensaje: 'No se pudo guardar la sesión.'
                    });
                }

                res.json({
                    mensaje: 'Inicio de sesión exitoso.'
                });
            });
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            mensaje: 'Error interno del servidor.'
        });
    }
});

// Proteger el dashboard
app.get('/dashboard', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/');
    }

    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Consultar usuario conectado
app.get('/api/me', (req, res) => {
    if (!req.session.usuario) {
        return res.status(401).json({
            mensaje: 'No has iniciado sesión.'
        });
    }

    res.json(req.session.usuario);
});

// Cerrar sesión
app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ mensaje: 'Sesión cerrada.' });
    });
});

// Verificar conexión a PostgreSQL
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({ mensaje: 'Servidor y PostgreSQL funcionando.' });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error de conexión con PostgreSQL.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`AutoRent funcionando en http://localhost:${PORT}`);
});
