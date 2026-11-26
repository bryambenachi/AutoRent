// ELEMENTOS DEL FORMULARIO
const formulario = document.getElementById('vehiculoForm');
const mensaje = document.getElementById('mensajeVehiculo');
const listaVehiculos = document.getElementById('listaVehiculos');

const btnMostrarFormulario = document.getElementById('btnMostrarFormulario');
const contenedorFormulario = document.getElementById('formularioVehiculo');
const btnCancelar = document.getElementById('btnCancelar');

// ELEMENTOS DE CONSULTA
const buscarVehiculo = document.getElementById('buscarVehiculo');
const filtroEstado = document.getElementById('filtroEstado');
const btnActualizarVehiculos = document.getElementById('btnActualizarVehiculos');
const mensajeConsulta = document.getElementById('mensajeConsulta');

let vehiculosRegistrados = [];

// MOSTRAR FORMULARIO
btnMostrarFormulario.addEventListener('click', () => {
    contenedorFormulario.hidden = false;
    mensaje.textContent = '';
});

// CANCELAR REGISTRO
btnCancelar.addEventListener('click', () => {
    contenedorFormulario.hidden = true;
    formulario.reset();
    mensaje.textContent = '';
});

// MOSTRAR VEHÍCULOS EN LA TABLA
function mostrarVehiculos(vehiculos) {
    listaVehiculos.innerHTML = '';

    if (vehiculos.length === 0) {
        listaVehiculos.innerHTML = `
            <tr>
                <td colspan="6">No se encontraron vehículos.</td>
            </tr>
        `;
        return;
    }

    vehiculos.forEach(vehiculo => {
        const fila = document.createElement('tr');

        const datos = [
            vehiculo.placa,
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.tipo,
            vehiculo.caracteristicas,
            vehiculo.estado
        ];

        datos.forEach(dato => {
            const celda = document.createElement('td');
            celda.textContent = dato ?? '';
            fila.appendChild(celda);
        });

        listaVehiculos.appendChild(fila);
    });
}

// FILTRAR VEHÍCULOS
function filtrarVehiculos() {
    const busqueda = buscarVehiculo.value.toLowerCase().trim();
    const estadoSeleccionado = filtroEstado.value;

    const resultados = vehiculosRegistrados.filter(vehiculo => {
        const textoVehiculo = [
            vehiculo.placa,
            vehiculo.marca,
            vehiculo.modelo,
            vehiculo.tipo,
            vehiculo.caracteristicas
        ].join(' ').toLowerCase();

        const coincideTexto = textoVehiculo.includes(busqueda);

        const coincideEstado =
            estadoSeleccionado === 'Todos' ||
            vehiculo.estado === estadoSeleccionado;

        return coincideTexto && coincideEstado;
    });

    mostrarVehiculos(resultados);
}

// CONSULTAR VEHÍCULOS EN LA BASE DE DATOS
async function cargarVehiculos() {
    try {
        mensajeConsulta.textContent = 'Actualizando vehículos...';

        const respuesta = await fetch('/api/vehiculos');

        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los vehículos.');
        }

        vehiculosRegistrados = await respuesta.json();

        filtrarVehiculos();

        mensajeConsulta.textContent =
            `Se encontraron ${vehiculosRegistrados.length} vehículos registrados.`;

    } catch (error) {
        console.error('Error al consultar vehículos:', error);
        mensajeConsulta.textContent = error.message;
    }
}

// BUSCADOR EN TIEMPO REAL
buscarVehiculo.addEventListener('input', filtrarVehiculos);

// FILTRO POR ESTADO
filtroEstado.addEventListener('change', filtrarVehiculos);

// BOTÓN ACTUALIZAR
btnActualizarVehiculos.addEventListener('click', cargarVehiculos);

// REGISTRAR VEHÍCULO
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const vehiculo = {
        placa: document.getElementById('placa').value.trim(),
        marca: document.getElementById('marca').value.trim(),
        modelo: document.getElementById('modelo').value.trim(),
        tipo: document.getElementById('tipo').value,
        caracteristicas: document.getElementById('caracteristicas').value.trim(),
        estado: document.getElementById('estado').value
    };

    try {
        const respuesta = await fetch('/api/vehiculos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehiculo)
        });

        const datos = await respuesta.json();

        mensaje.textContent = datos.mensaje;

        if (!respuesta.ok) {
            return;
        }

        formulario.reset();

        await cargarVehiculos();

        contenedorFormulario.hidden = true;

    } catch (error) {
        console.error('Error al registrar vehículo:', error);
        mensaje.textContent = 'Error al conectar con el servidor.';
    }
});

// CARGAR VEHÍCULOS AL ABRIR EL PANEL
cargarVehiculos();

// ==========================================
// HU-11: CARGAR VEHÍCULOS PARA RESERVAS
// ==========================================

const selectorVehiculo = document.getElementById('vehiculoReserva');
const fechaInicio = document.getElementById('fechaInicio');
const fechaFin = document.getElementById('fechaFin');

// CARGAR VEHÍCULOS DISPONIBLES
async function cargarVehiculosReserva() {
    try {
        const respuesta = await fetch('/api/vehiculos');

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los vehículos.');
        }

        const vehiculos = await respuesta.json();

        selectorVehiculo.innerHTML =
            '<option value="">Seleccionar vehículo</option>';

        const disponibles = vehiculos.filter(
            vehiculo => vehiculo.estado === 'Disponible'
        );

        disponibles.forEach(vehiculo => {
            const opcion = document.createElement('option');

            opcion.value = vehiculo.id;
            opcion.textContent =
                `${vehiculo.placa} - ${vehiculo.marca} ${vehiculo.modelo}`;

            selectorVehiculo.appendChild(opcion);
        });

        if (disponibles.length === 0) {
            selectorVehiculo.innerHTML =
                '<option value="">No hay vehículos disponibles</option>';
        }

    } catch (error) {
        console.error('Error al cargar vehículos para reservas:', error);
        selectorVehiculo.innerHTML =
            '<option value="">Error al cargar vehículos</option>';
    }
}

// EVITAR SELECCIONAR FECHAS PASADAS
const hoy = new Date();
const fechaActual = new Date(
    hoy.getTime() - hoy.getTimezoneOffset() * 60000
).toISOString().split('T')[0];

fechaInicio.min = fechaActual;
fechaFin.min = fechaActual;

// LA FECHA FINAL DEBE SER POSTERIOR A LA INICIAL
fechaInicio.addEventListener('change', () => {
    fechaFin.min = fechaInicio.value || fechaActual;

    if (fechaFin.value && fechaFin.value <= fechaInicio.value) {
        fechaFin.value = '';
    }
});

// CARGAR VEHÍCULOS AL ABRIR EL FORMULARIO
cargarVehiculosReserva();

// ==========================================
// MODULO DE CLIENTES
// ==========================================

const formularioCliente = document.getElementById('clienteForm');
const mensajeCliente = document.getElementById('mensajeCliente');
const listaClientes = document.getElementById('listaClientes');

// CONSULTAR CLIENTES
async function cargarClientes() {
    try {
        const respuesta = await fetch('/api/clientes');

        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los clientes.');
        }

        const clientes = await respuesta.json();

        listaClientes.innerHTML = '';

        if (clientes.length === 0) {
            listaClientes.innerHTML = `
                <tr>
                    <td colspan="5">No hay clientes registrados.</td>
                </tr>
            `;
            return;
        }

        clientes.forEach(cliente => {
            const fila = document.createElement('tr');

            const datos = [
                cliente.nombre,
                cliente.documento,
                cliente.telefono,
                cliente.email,
                cliente.direccion
            ];

            datos.forEach(dato => {
                const celda = document.createElement('td');
                celda.textContent = dato ?? '';
                fila.appendChild(celda);
            });

            listaClientes.appendChild(fila);
        });

    } catch (error) {
        console.error('Error al cargar clientes:', error);
        mensajeCliente.textContent = error.message;
    }
}

// REGISTRAR CLIENTE
formularioCliente.addEventListener('submit', async (e) => {
    e.preventDefault();

    const cliente = {
        nombre: document.getElementById('nombreCliente').value.trim(),
        documento: document.getElementById('documentoCliente').value.trim(),
        telefono: document.getElementById('telefonoCliente').value.trim(),
        email: document.getElementById('emailCliente').value.trim(),
        direccion: document.getElementById('direccionCliente').value.trim()
    };

    try {
        const respuesta = await fetch('/api/clientes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cliente)
        });

        const datos = await respuesta.json();

        mensajeCliente.textContent = datos.mensaje;

        if (!respuesta.ok) {
            return;
        }

        formularioCliente.reset();

        await cargarClientes();

    } catch (error) {
        console.error('Error al registrar cliente:', error);
        mensajeCliente.textContent = 'Error al conectar con el servidor.';
    }
});

// CARGAR CLIENTES AL ABRIR EL PANEL
cargarClientes();

// ==========================================
// HU-11: CARGAR CLIENTES PARA RESERVAS
// ==========================================

const selectorCliente = document.getElementById('clienteReserva');

async function cargarClientesReserva() {
    try {
        const respuesta = await fetch('/api/clientes');

        if (!respuesta.ok) {
            throw new Error('No se pudieron cargar los clientes.');
        }

        const clientes = await respuesta.json();

        selectorCliente.innerHTML =
            '<option value="">Seleccionar cliente</option>';

        clientes.forEach(cliente => {
            const opcion = document.createElement('option');

            opcion.value = cliente.id;
            opcion.textContent =
                `${cliente.nombre} - ${cliente.documento}`;

            selectorCliente.appendChild(opcion);
        });

        if (clientes.length === 0) {
            selectorCliente.innerHTML =
                '<option value="">No hay clientes registrados</option>';
        }

    } catch (error) {
        console.error('Error al cargar clientes para reservas:', error);

        selectorCliente.innerHTML =
            '<option value="">Error al cargar clientes</option>';
    }
}

// CARGAR CLIENTES AL ABRIR EL PANEL
cargarClientesReserva();


// ==========================================
// NAVEGACION ENTRE MODULOS
// ==========================================

const botonesModulos = document.querySelectorAll('.modulo-menu');
const seccionesModulos = document.querySelectorAll('[data-modulo-seccion]');

function mostrarModulo(nombreModulo) {

    // Ocultar todas las secciones
    seccionesModulos.forEach(seccion => {
        seccion.hidden = true;
    });

    // Mostrar las secciones del módulo seleccionado
    seccionesModulos.forEach(seccion => {
        if (seccion.dataset.moduloSeccion === nombreModulo) {
            seccion.hidden = false;
        }
    });

    // Ocultar el menú principal
    document.querySelector('.estadisticas').hidden = true;

    // Mostrar el botón para volver al menú
    document.getElementById('btnVolverMenu').hidden = false;
}

// EVENTOS DE LOS BOTONES
botonesModulos.forEach(boton => {
    boton.addEventListener('click', () => {
        mostrarModulo(boton.dataset.modulo);
    });
});

// VOLVER AL MENU PRINCIPAL
const btnVolverMenu = document.getElementById('btnVolverMenu');

btnVolverMenu.addEventListener('click', () => {

    // Ocultar todos los módulos
    seccionesModulos.forEach(seccion => {
        seccion.hidden = true;
    });

    // Mostrar el menú principal
    document.querySelector('.estadisticas').hidden = false;

    // Ocultar el botón volver
    btnVolverMenu.hidden = true;
});
// CONFIGURAR PANTALLA INICIAL
seccionesModulos.forEach(seccion => {
    seccion.hidden = true;
});

document.querySelector('.estadisticas').hidden = false;
btnVolverMenu.hidden = true;
// HU-11: REGISTRAR RESERVA
const formularioReserva = document.getElementById('reservaForm');
const mensajeReserva = document.getElementById('mensajeReserva');

formularioReserva.addEventListener('submit', async (e) => {
    // Evitar que la página se recargue
    e.preventDefault();

    const reserva = {
        cliente_id: Number(selectorCliente.value),
        vehiculo_id: Number(selectorVehiculo.value),
        fecha_inicio: fechaInicio.value,
        fecha_fin: fechaFin.value
    };

    if (!reserva.cliente_id || !reserva.vehiculo_id) {
        mensajeReserva.textContent =
            'Selecciona un cliente y un vehículo.';
        return;
    }

    try {
        const respuesta = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reserva)
        });

        const datos = await respuesta.json();

        mensajeReserva.textContent = datos.mensaje;

        if (!respuesta.ok) {
            return;
        }

        // Limpiar formulario después de guardar
        formularioReserva.reset();

        // Actualizar los selectores
        await cargarVehiculosReserva();
        await cargarClientesReserva();

    } catch (error) {
        console.error('Error al registrar reserva:', error);

        mensajeReserva.textContent =
            'Error al conectar con el servidor.';
    }
});
// CERRAR SESIÓN
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async () => {
        try {
            const respuesta = await fetch('/api/logout', {
                method: 'POST'
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                window.location.replace('/');
            } else {
                alert(datos.mensaje || 'No se pudo cerrar la sesión.');
            }

        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Error al conectar con el servidor.');
        }
    });
}