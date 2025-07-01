(function () {
    const telefonoInput = document.getElementById('telefono');
    const form = document.getElementById('editar-paciente');

    if (!form) {
        console.warn('No se encontró el formulario de edición de paciente');
        return;
    }

    // Prevenir múltiples registros del evento submit
    if (form.dataset.listenerAttached === 'true') {
        console.warn('El listener ya fue registrado');
        return;
    }

    // Formatear teléfono solo números
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Cargar datos del paciente al inicializar
    cargarDatosPaciente();

    form.addEventListener('submit', handleSubmit);
    form.dataset.listenerAttached = 'true';

    // Cargar datos del paciente para edición
    async function cargarDatosPaciente() {
        const pacienteId = sessionStorage.getItem('editandoPacienteId');
        
        if (!pacienteId) {
            alert('No se especificó el paciente a editar');
            cancelarEdicion();
            return;
        }

        // Mostrar estado de carga
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Cargando...';

        try {
            const response = await fetch(`/NovaSoft/src/models/obtener_paciente_por_id.php?id=${pacienteId}`);
            const result = await response.json();

            if (result.success && result.paciente) {
                const paciente = result.paciente;
                
                // Llenar el formulario con los datos existentes
                document.getElementById('paciente-id').value = paciente.id;
                document.getElementById('nombre').value = paciente.nombre || '';
                document.getElementById('apellido').value = paciente.apellido || '';
                document.getElementById('email').value = paciente.correo || '';
                document.getElementById('telefono').value = paciente.telefono || '';
                document.getElementById('direccion').value = paciente.direccion || '';
                document.getElementById('ciudad').value = paciente.ciudad || '';

                console.log('Datos del paciente cargados correctamente');
            } else {
                alert(result.message || 'Error al cargar los datos del paciente');
                cancelarEdicion();
            }
        } catch (error) {
            console.error('Error al cargar datos del paciente:', error);
            alert('Error al cargar los datos del paciente');
            cancelarEdicion();
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Cambios';
        }
    }

    // Manejar envío del formulario de actualización
    async function handleSubmit(e) {
        e.preventDefault();
        console.log('📨 Enviando formulario de actualización de paciente');

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Limpiar teléfono
        if (data.telefono) {
            data.telefono = data.telefono.replace(/[^0-9]/g, '');
        }

        try {
            const response = await fetch('/NovaSoft/src/models/actualizar_paciente.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || 'Paciente actualizado exitosamente');
                console.log('Paciente actualizado');
                
                // Limpiar sessionStorage y volver a la lista de pacientes
                sessionStorage.removeItem('editandoPacienteId');
                
                // Volver a la página de ver pacientes
                if (typeof cargarContenido === 'function') {
                    cargarContenido('instructor', 'verPacientes');
                }
            } else {
                alert(result.message || 'Error al actualizar paciente');
                console.warn('Error:', result.message);
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
            alert('Ocurrió un error al actualizar el paciente. Intenta nuevamente.');
        } finally {
            submitBtn.disabled = false;
        }
    }

})();

// Función global para cancelar edición
function cancelarEdicion() {
    console.log('Cancelando edición');
    
    // Limpiar sessionStorage
    sessionStorage.removeItem('editandoPacienteId');
    
    // Volver a la página de ver pacientes
    if (typeof cargarContenido === 'function') {
        cargarContenido('instructor', 'verPacientes');
    } else {
        console.error('Función cargarContenido no disponible');
    }
}

// Hacer la función global
window.cancelarEdicion = cancelarEdicion;