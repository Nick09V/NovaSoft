document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔍 Script cargar_detalle.js iniciado');
  
  const id = new URLSearchParams(window.location.search).get('id');
  const contenedor = document.getElementById('detalle-postura');

  console.log('📋 ID de postura:', id);
  console.log('📦 Contenedor encontrado:', contenedor);

  if (!contenedor) {
    console.error('❌ No se encontró el contenedor con ID "detalle-postura"');
    return;
  }

  if (!id) {
    contenedor.innerHTML = '<p style="color: red;">No se especificó una postura válida</p>';
    return;
  }

  try {
    console.log('📡 Cargando detalle de postura...');
    
    // Usar la misma URL que funciona para las posturas
    const url = `http://localhost/NovaSoft/src/models/posturas.php?id=${id}`;
    console.log('🌐 URL de petición:', url);
    
    const res = await fetch(url);
    console.log('📊 Respuesta del servidor:', res.status, res.statusText);
    
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo cargar el detalle`);
    }

    const postura = await res.json();
    console.log('📋 Datos de postura recibidos:', postura);

    if (!postura || postura.error) {
      throw new Error(postura.error || 'Postura no encontrada');
    }

    // Convertir link de YouTube a embed si es necesario
    let embedUrl = postura.video_url;
    if (embedUrl && embedUrl.includes("watch?v=")) {
      embedUrl = embedUrl.replace("watch?v=", "embed/");
    }

    // Actualizar título de la página
    if (document.getElementById('titulo')) {
      document.getElementById('titulo').textContent = `${postura.nombre_es} (${postura.nombre_sanskrito})`;
    }

    // ⭐ MEJORAR: Botón de volver inteligente
    const esAccesoDirecto = window.location.href.includes('/detalle.html');
    let botonVolver = '';
    
    if (esAccesoDirecto) {
      // Si es acceso directo, ir a la página de posturas
      botonVolver = '<a href="http://localhost/NovaSoft/public/pages/posturas/posturas.html" class="btn-volver">← Volver al listado</a>';
    } else {
      // Si viene del menú dinámico, cargar posturas en el mismo contenedor
      botonVolver = '<button onclick="volverAPosturas()" class="btn-volver">← Volver al listado</button>';
    }

    // Mostrar contenido
    contenedor.innerHTML = `
      <img src="${postura.foto_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzBmNjg0YiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+'}" 
           alt="${postura.nombre_es}"
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2NjMDAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RXJyb3IgYWwgY2FyZ2FyIGltYWdlbjwvdGV4dD48L3N2Zz4='">
      
      <h3>${postura.nombre_es}</h3>
      <p><strong>Nombre sánscrito:</strong> ${postura.nombre_sanskrito}</p>
      <p><strong>Beneficios:</strong> ${postura.beneficios}</p>
      <p><strong>Instrucciones:</strong> ${postura.instrucciones}</p>
      <p><strong>Modificaciones:</strong> ${postura.modificaciones || 'Ninguna'}</p>

      ${embedUrl ? `
        <h4 class="titulovideo">Video explicativo</h4>
        <iframe width="100%" height="315"
          src="${embedUrl}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen>
        </iframe>
      ` : ''}
      
      ${botonVolver}
    `;

    console.log('✅ Detalle de postura mostrado correctamente');

  } catch (e) {
    console.error('❌ Error al cargar detalle:', e);
    contenedor.innerHTML = `
      <div style="color: red; text-align: center; padding: 20px;">
        <h3>❌ Error al cargar la postura</h3>
        <p>${e.message}</p>
        <button onclick="volverAPosturas()" class="btn-volver">← Volver al listado</button>
      </div>
    `;
  }
});

// ⭐ NUEVA FUNCIÓN: Volver a posturas dinámicamente
function volverAPosturas() {
  console.log('🔙 Volviendo a la lista de posturas...');
  
  const contenedorPrincipal = document.getElementById('contenido');
  if (contenedorPrincipal) {
    // Cargar la página de posturas dinámicamente
    fetch('/NovaSoft/public/pages/posturas/posturas.html')
      .then(response => response.text())
      .then(html => {
        contenedorPrincipal.innerHTML = html;
        
        // Limpiar scripts anteriores
        const scriptsAnteriores = document.querySelectorAll('script[data-dynamic="true"]');
        scriptsAnteriores.forEach(script => script.remove());
        
        // Cargar el script de posturas
        const script = document.createElement('script');
        script.src = '/NovaSoft/public/js/cargar_posturas.js';
        script.setAttribute('data-dynamic', 'true');
        script.onload = () => {
          console.log('✅ Script de posturas recargado');
        };
        document.body.appendChild(script);
      })
      .catch(error => {
        console.error('Error volviendo a posturas:', error);
        contenedorPrincipal.innerHTML = '<p style="color: red;">Error cargando la lista de posturas</p>';
      });
  }
}