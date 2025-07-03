(function () {
    const telefonoInput = document.getElementById('telefono');
    const form = document.getElementById('registro-paciente');

    if (!form) {
        console.warn(' No se encontró el formulario de registro de paciente');
        return;
    }

    // Prevenir múltiples registros del evento submit
    if (form.dataset.listenerAttached === 'true') {
        console.warn('El listener ya fue registrado');
        return;
    }

    if (telefonoInput) {
        telefonoInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    form.addEventListener('submit', handleSubmit);
    form.dataset.listenerAttached = 'true'; // Marcar que ya se registró el listener

    // --- INICIO: Sistema de advertencias bonitas ---
    function crearContenedorAdvertencias() {
        if (!document.getElementById('contenedorAdvertencias')) {
            const div = document.createElement('div');
            div.id = 'contenedorAdvertencias';
            div.style.position = 'fixed';
            div.style.top = '30px';
            div.style.left = '50%';
            div.style.transform = 'translateX(-50%)';
            div.style.zIndex = '9999';
            div.style.display = 'none';
            document.body.appendChild(div);
        }
    }

    function mostrarAdvertencia(mensaje) {
        crearContenedorAdvertencias();
        const contenedor = document.getElementById('contenedorAdvertencias');
        contenedor.innerHTML = `
            <div style="
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
                border-radius: 6px;
                padding: 16px 32px;
                font-size: 1.1em;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 10px;
                min-width: 280px;
                text-align: center;
                ">
                <strong>Advertencia:</strong> ${mensaje}
            </div>
        `;
        contenedor.style.display = 'block';
        setTimeout(() => {
            contenedor.style.display = 'none';
        }, 3500);
    }
    // --- FIN: Sistema de advertencias bonitas ---

    async function handleSubmit(e) {
        e.preventDefault();
        console.log('📨 Enviando formulario de registro de paciente');

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.telefono = data.telefono.replace(/[^0-9]/g, '');

        // Validaciones de campos obligatorios
        if (!data.nombre || data.nombre.trim() === "") {
            mostrarAdvertencia("Por favor, ingrese el nombre del paciente.");
            submitBtn.disabled = false;
            return;
        }
        if (!data.apellido || data.apellido.trim() === "") {
            mostrarAdvertencia("Por favor, ingrese el apellido del paciente.");
            submitBtn.disabled = false;
            return;
        }
        if (!data.telefono || data.telefono.trim() === "") {
            mostrarAdvertencia("Por favor, ingrese el teléfono del paciente.");
            submitBtn.disabled = false;
            return;
        }

        if (!data.correo || data.correo.trim() === "") {
            mostrarAdvertencia("Por favor, ingrese el correo electrónico.");
            submitBtn.disabled = false;
            return;
        }
        // Puedes agregar más validaciones según los campos de tu formulario

        try {
            const response = await fetch('/NovaSoft/src/models/registrar_paciente.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                mostrarAdvertencia(result.message || 'Paciente registrado exitosamente');
                console.log('Paciente registrado');
                form.reset();
            } else {
                mostrarAdvertencia(result.message || 'Error al registrar paciente');
                console.warn('Error:', result.message);
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
            mostrarAdvertencia('Ocurrió un error al registrar el paciente. Intenta nuevamente.');
        } finally {
            submitBtn.disabled = false;
        }
    }
})();
