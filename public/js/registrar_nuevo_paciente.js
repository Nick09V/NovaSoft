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

    async function handleSubmit(e) {
        e.preventDefault();
        console.log('📨 Enviando formulario de registro de paciente');

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.telefono = data.telefono.replace(/[^0-9]/g, '');

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
                alert(result.message || 'Paciente registrado exitosamente');
                console.log('Paciente registrado');
                form.reset();
            } else {
                alert(result.message || 'Error al registrar paciente');
                console.warn('Error:', result.message);
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Ocurrió un error al registrar el paciente. Intenta nuevamente.');
        } finally {
            submitBtn.disabled = false;
        }
    }
})();
