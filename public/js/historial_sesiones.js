async function cargarHistorialSesionesInstructor() {
   console.log('cargarHistorialSesiones() fue llamada'); 
    try {
    const res = await fetch('/NovaSoft/src/models/historial_sesiones.php');
    const data = await res.json();

    if (data.status !== 'ok') {
      console.warn('Error al cargar sesiones:', data.message);
      return;
    }

    const tbody = document.getElementById('tabla-historial-sesiones');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpiar anterior

    if (data.sesiones.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">No hay sesiones registradas</td></tr>`;
      return;
    }

    data.sesiones.forEach(sesion => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${sesion.paciente}</td>
        <td>${sesion.fecha}</td>
        <td>${sesion.dolor_inicio}</td>
        <td>${sesion.dolor_fin}</td>
        <td>${sesion.comentario ?? '-'}</td>
        <td>${sesion.tiempo_real_minutos} min</td>
      `;
      tbody.appendChild(fila);
    });

  } catch (err) {
    console.error('Error al obtener historial:', err);
  }
}

cargarHistorialSesionesInstructor();
