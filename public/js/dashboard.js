function cargarEstadisticasDashboard() {
  console.log('dashboard.js cargado');

  fetch('/NovaSoft/src/models/dashboard_instructor.php')
    .then(res => res.json())
    .then(data => {
      console.log('Datos recibidos:', data);

      if (data.status === 'ok') {
        // Contadores principales
        document.getElementById('pacientes-activos').textContent = data.pacientes_activos;
        document.getElementById('pacientes-sin-serie').textContent = data.sin_serie;
        document.getElementById('sesiones-hoy').textContent = data.completadas_hoy;

        // Mostrar niveles de molestia
        const contenedorDetalle = document.getElementById('detalle-dolor-niveles');
        if (contenedorDetalle && data.dolor_por_nivel) {
          contenedorDetalle.innerHTML = '';

          const niveles = Object.entries(data.dolor_por_nivel);
          niveles.forEach(([nivel, cantidad]) => {
            if (cantidad > 0) {
              const span = document.createElement('span');
              span.textContent = `${cantidad} paciente${cantidad > 1 ? 's' : ''}: ${nivel}`;

              const claseNivel = {
                "SIN DOLOR": "nivel-verde",
                "LEVE": "nivel-lima",
                "MODERADO": "nivel-amarillo",
                "INTENSO": "nivel-naranja",
                "MÁXIMO": "nivel-rojo"
              };

              const clase = claseNivel[nivel.toUpperCase()];
              if (clase) span.classList.add(clase);

              contenedorDetalle.appendChild(span);
            }
          });
        }

        // Mostrar pacientes sin serie
        const tablaPacientes = document.getElementById('tabla-pacientes-sin-serie');
        if (tablaPacientes && Array.isArray(data.pacientes_sin_serie)) {
          tablaPacientes.innerHTML = ''; // limpiar contenido previo

          if (data.pacientes_sin_serie.length === 0) {
            tablaPacientes.innerHTML = `
              <tr>
                <td colspan="5">🎉 Todos los pacientes tienen serie asignada</td>
              </tr>
            `;
          } else {
            data.pacientes_sin_serie.forEach((p, i) => {
              const fila = document.createElement('tr');
              fila.innerHTML = `
                <td><span class="indicator ${i % 2 === 0 ? '' : 'even'}"></span></td>
                <td>${p.nombre} ${p.apellido}</td>
                <td>${p.ciudad || '-'}</td>
                <td>${p.correo}</td>
              `;
              tablaPacientes.appendChild(fila);
            });
          }
        }

      } else {
        console.error('Error en los datos:', data.message);
      }
    })
    .catch(err => console.error('Error de red:', err));
}


function cargarSesionesRecientes() {
  fetch('/NovaSoft/src/models/dashboard_sesiones.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'ok') {
        const tbody = document.getElementById('tabla-sesiones-body');
        tbody.innerHTML = '';

        data.sesiones.forEach(sesion => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${sesion.paciente}</td>
            <td>${sesion.fecha}<br><small>${sesion.tiempo_real_minutos} min</small></td>
            <td>${sesion.comentario || 'Sin comentario'}</td>
            <td>${sesion.iniciadas}</td>
            <td>${sesion.terminadas}</td>
          `;
          tbody.appendChild(row);
        });
      } else {
        console.error('Error al cargar sesiones:', data.message);
      }
    })
    .catch(err => console.error('Error de red:', err));
}

// Ejecutar funciones al cargar
cargarEstadisticasDashboard();
cargarSesionesRecientes();
