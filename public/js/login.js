
const formulario = document.getElementById('loginForm');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const mensaje = document.getElementById('mensaje');

    try {
        const respuesta = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mensaje.textContent = datos.mensaje;
            return;
        }

        window.location.href = '/dashboard';

    } catch (error) {
        mensaje.textContent = 'No se pudo conectar con el servidor.';
        console.error(error);
    }
});
