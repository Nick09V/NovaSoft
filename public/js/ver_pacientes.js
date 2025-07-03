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
          <td><span class="${p.estado === 'activo' ? 'estado-activo' : 'estado-inactivo'}">${p.estado}</span></td>
          <td>${p.series_asignadas}</td>
          <td><button onclick="editarPaciente(${p.id})" class="btn-editar"> Editar</button></td>
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

function editarPaciente(pacienteId) {
    console.log('Editando paciente:', pacienteId);
    
    // Guardar el ID en sessionStorage
    sessionStorage.setItem('editandoPacienteId', pacienteId);
    
    // Cargar la página de edición
    if (typeof cargarContenido === 'function') {
        cargarContenido('instructor', 'editarPaciente');
    } else {
        console.error('Función cargarContenido no disponible');
    }
}


window.editarPaciente = editarPaciente;

// 🔁 Ejecutar inmediatamente porque el script fue cargado dinámicamente
cargarPacientesInstructor();

