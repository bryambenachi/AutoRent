
// Elementos del formulario
const formulario = document.getElementById('vehiculoForm');
const mensaje = document.getElementById('mensajeVehiculo');
const listaVehiculos = document.getElementById('listaVehiculos');

const btnMostrarFormulario = document.getElementById('btnMostrarFormulario');

if (btnMostrarFormulario && formulario) {
    btnMostrarFormulario.addEventListener('click', () => {
        formulario.style.display = 'block';
    });
} else {
    console.error('No se encontró el botón o el formulario.');
}

// Consultar vehículos registrados
async function cargarVehiculos() {
    try {
        const respuesta = await fetch('/api/vehiculos');

        if (!respuesta.ok) {
            throw new Error('No se pudieron consultar los vehículos.');
        }

        const vehiculos = await respuesta.json();

        listaVehiculos.innerHTML = '';

        if (vehiculos.length === 0) {
            listaVehiculos.innerHTML = `
                <tr>
                    <td colspan="6">No hay vehículos registrados.</td>
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
                vehiculo.caracteristicas || '',
                vehiculo.estado
            ];

            datos.forEach(dato => {
                const celda = document.createElement('td');
                celda.textContent = dato;
                fila.appendChild(celda);
            });

            listaVehiculos.appendChild(fila);
        });

    } catch (error) {
        console.error(error);
        mensaje.textContent = error.message;
    }
}

// Registrar vehículo
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const vehiculo = {
        placa: document.getElementById('placa').value,
        marca: document.getElementById('marca').value,
        modelo: document.getElementById('modelo').value,
        tipo: document.getElementById('tipo').value,
        caracteristicas: document.getElementById('caracteristicas').value,
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

    } catch (error) {
        console.error(error);
        mensaje.textContent = 'Error al conectar con el servidor.';
    }
});

// Cargar vehículos al abrir el panel
cargarVehiculos();
