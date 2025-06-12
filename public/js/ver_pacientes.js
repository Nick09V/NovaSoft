function cargarPacientesInstructor() {
  fetch('/NovaSoft/src/models/pacientes_instructor.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('tabla-pacientes-instructor');
      tbody.innerHTML = '';

      if (data.status !== 'ok' || !data.pacientes.length) {
        tbody.innerHTML = '<tr><td colspan="4">No hay pacientes registrados.</td></tr>';
        return;
      }

      data.pacientes.forEach(p => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${p.nombre} ${p.apellido}</td>
          <td>${p.ciudad || '-'}</td>
          <td>${p.estado}</td>
          <td>${p.series_asignadas}</td>
        `;
        tbody.appendChild(fila);
      });
    })
    .catch(err => {
      console.error('Error al cargar pacientes:', err);
      document.getElementById('tabla-pacientes-instructor').innerHTML =
        '<tr><td colspan="4">Error al cargar los pacientes.</td></tr>';
    });
}

// 🔁 Ejecutar inmediatamente porque el script fue cargado dinámicamente
cargarPacientesInstructor();

