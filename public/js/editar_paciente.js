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
            mostrarAdvertencia('No se especificó el paciente a editar', 'error');
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
                document.getElementById('estado').value = paciente.estado || 'activo';

                console.log('Datos del paciente cargados correctamente');
                console.log('🔍 Estado cargado:', paciente.estado); // ← AGREGADO: Debug estado
            } else {
                mostrarAdvertencia(result.message || 'Error al cargar los datos del paciente', 'error');
                cancelarEdicion();
            }
        } catch (error) {
            console.error('Error al cargar datos del paciente:', error);
            mostrarAdvertencia('Error al cargar los datos del paciente', 'error');
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

        // ⭐ AGREGADO: Debug para verificar datos antes de enviar
        console.log('🔍 Datos a enviar:', data);
        console.log('🔍 Estado seleccionado:', data.estado);
        
        // ⭐ AGREGADO: Verificar que el campo estado existe y forzar su valor
        const estadoSelect = document.getElementById('estado');
        if (estadoSelect) {
            console.log('✅ Campo estado encontrado, valor actual:', estadoSelect.value);
            data.estado = estadoSelect.value; // Forzar el valor por si acaso
        } else {
            console.error('❌ Campo estado NO encontrado en el DOM');
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
            
            // ⭐ AGREGADO: Debug de respuesta del servidor
            console.log('📨 Respuesta completa del servidor:', result);

            if (result.success) {
                mostrarAdvertencia(result.message || 'Paciente actualizado exitosamente', 'success');
                console.log('Paciente actualizado');
                
                // ⭐ AGREGADO: Mostrar info de debug si existe
                if (result.debug) {
                    console.log('🔍 Debug del servidor:', result.debug);
                }
                
                // Limpiar sessionStorage y volver a la lista de pacientes
                sessionStorage.removeItem('editandoPacienteId');
                
                // Volver a la página de ver pacientes
                if (typeof cargarContenido === 'function') {
                    cargarContenido('instructor', 'verPacientes');
                }
            } else {
                mostrarAdvertencia(result.message || 'Error al actualizar paciente', 'error');

                console.warn('Error:', result.message);
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
            mostrarAdvertencia('Ocurrió un error al actualizar el paciente. Intenta nuevamente.', 'error');

        } finally {
            submitBtn.disabled = false;
        }
    }

})();
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
window.mostrarAdvertencia = mostrarAdvertencia;