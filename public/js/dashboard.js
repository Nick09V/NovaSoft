// dashboard.js
function cargarEstadisticasDashboard() {
  console.log('dashboard.js cargado');

  fetch('/NovaSoft/src/models/dashboard_instructor.php')
    .then(res => res.json())
    .then(data => {
      console.log('Datos recibidos:', data);
      if (data.status === 'ok') {
        document.getElementById('pacientes-activos').textContent = data.pacientes_activos;
        document.getElementById('pacientes-sin-serie').textContent = data.sin_serie;
        document.getElementById('sesiones-hoy').textContent = data.completadas_hoy;
      } else {
        console.error('Error en los datos:', data.message);
      }
    })
    .catch(err => console.error('Error al cargar estadísticas:', err));
}

// Ejecutar directamente (ya que se carga dinámicamente)
cargarEstadisticasDashboard();
