function cargarPacientesInstructor() {
  fetch('/NovaSoft/src/models/pacientes_instructor.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('tabla-pacientes-instructor');
      tbody.innerHTML = '';

      if (data.status !== 'ok' || !data.pacientes.length) {
        tbody.innerHTML = '<tr><td colspan="5">No hay pacientes registrados.</td></tr>';
        return;
      }

      data.pacientes.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${p.nombre} ${p.apellido}</td>
          <td>${p.ciudad || '-'}</td>
          <td>${p.estado}</td>
          <td>${p.series_asignadas}</td>
          <td>
            <button class="btn-editar" data-id="${p.id}" onclick="editarPaciente(${p.id})">
              Editar
            </button>
          </td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error('Error al cargar pacientes:', err);
      document.getElementById('tabla-pacientes-instructor').innerHTML =
        '<tr><td colspan="5">Error al cargar los pacientes.</td></tr>';
    });
}

// 🔁 Ejecutar inmediatamente porque el script fue cargado dinámicamente
cargarPacientesInstructor();

// Función para editar paciente
function editarPaciente(pacienteId) {
  console.log('Editando paciente con ID:', pacienteId);
  // Usar el sistema de navegación existente para cargar la página de edición
  if (typeof cargarContenido === 'function') {
    // Almacenar el ID del paciente para ser usado por la página de edición
    sessionStorage.setItem('editandoPacienteId', pacienteId);
    cargarContenido('instructor', 'editarPaciente');
  } else {
    console.error('Función cargarContenido no disponible');
  }
}

// Hacer la función global para que pueda ser llamada desde el HTML
window.editarPaciente = editarPaciente;

