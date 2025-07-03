async function cargarHistorialSesionesPaciente() {
   console.log('cargarHistorialSesiones() fue llamada'); // <--- AÑADE ESTO
  try {
    const res = await fetch('/NovaSoft/src/models/getHistorialSesiones.php');
    const data = await res.json();

    if (data.status === 'ok') {
      const tbody = document.getElementById('tabla-sesiones');
      tbody.innerHTML = '';

      data.sesiones.forEach(s => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${new Date(s.fecha_inicio).toLocaleDateString('es-ES')}</td>
          <td>${s.dolor_inicio}</td>
          <td>${s.dolor_fin}</td>
          <td>${s.comentario || '-'}</td>
          <td>${s.nombre_serie}</td>
          <td>${s.tiempo_real_minutos} min</td>
        `;
        tbody.appendChild(fila);
      });
    } else {
      alert('Error al cargar historial');
    }
  } catch (err) {
    console.error('Error en JS historial:', err);
  }
}

cargarHistorialSesionesPaciente();
