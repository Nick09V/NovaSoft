  // ⭐ EJECUTAR INMEDIATAMENTE - Sin esperar DOMContentLoaded
(function() {
  console.log('🔍 Script cargar_posturas.js iniciado INMEDIATAMENTE');
  
  // Función para verificar y ejecutar cuando estén listos los elementos
  function iniciarPosturas() {
    const contenedor = document.getElementById('contenedor-posturas');
    const filtroSintoma = document.getElementById('filtro-sintoma');
    const inputBusqueda = document.getElementById('busqueda');

    console.log('🔍 Verificando elementos...');
    console.log('📦 Contenedor:', contenedor);
    console.log('🔽 Filtro:', filtroSintoma);
    console.log('🔍 Input búsqueda:', inputBusqueda);

    if (!contenedor) {
      console.log('⏳ Elementos no listos, reintentando en 100ms...');
      setTimeout(iniciarPosturas, 100);
      return;
    }

    console.log('✅ Elementos encontrados, configurando aplicación...');

    let todasLasPosturas = [];

    // ⭐ FUNCIÓN: Crear SVG personalizado como fallback
    const crearImagenSVG = (nombrePostura, id) => {
      const colores = ['#0f684b', '#7BBF7B', '#03484c', '#1c232e', '#114c3c'];
      const color = colores[id % colores.length];
      
      const texto = nombrePostura.length > 18 ? 
        nombrePostura.substring(0, 18) + '...' : 
        nombrePostura;
      
      const svg = `
        <svg width="220" height="160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad${id}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7BBF7B;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad${id})" rx="8"/>
          <circle cx="110" cy="50" r="15" fill="white" opacity="0.8"/>
          <ellipse cx="110" cy="80" rx="25" ry="8" fill="white" opacity="0.6"/>
          <text x="50%" y="70%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" font-weight="bold">
            ${texto}
          </text>
          <text x="50%" y="85%" font-family="Arial" font-size="10" fill="white" text-anchor="middle" opacity="0.8">
            🧘‍♀️ Postura de Yoga
          </text>
        </svg>
      `;
      
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    // ⭐ FUNCIÓN: Obtener imagen segura
    const obtenerImagenSegura = (postura) => {
      const { id, nombre_es, foto_url } = postura;
      
      // Si la URL original existe y no es NULL, usarla
      if (foto_url && foto_url.trim() !== '' && foto_url !== 'NULL') {
        return foto_url;
      }
      
      // Si no hay imagen, crear SVG personalizado
      return crearImagenSVG(nombre_es, id);
    };

    const cargarPosturas = async (terapiaId = '') => {
      console.log('📡 Cargando posturas...');
      contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">🔄 Cargando posturas...</p>';
      
      try {
        // ⭐ URL absoluta que sabemos que funciona
        const url = terapiaId
          ? `/NovaSoft/src/models/posturas.php?terapia=${terapiaId}`
          : '/NovaSoft/src/models/posturas.php';

        console.log('🌐 URL de petición:', url);
        
        const res = await fetch(url);
        console.log('📊 Respuesta del servidor:', res.status, res.statusText);
        
        if (!res.ok) {
          throw new Error(`Error ${res.status}: No se pudieron cargar las posturas`);
        }
        
        const data = await res.json();
        console.log('📋 Datos recibidos:', data);
        console.log('📏 Número de posturas:', data.length);
        
        if (!Array.isArray(data)) {
          throw new Error('Respuesta inválida del servidor');
        }
        
        todasLasPosturas = data;
        mostrarPosturas(todasLasPosturas);
        
      } catch (err) {
        console.error('❌ Error al cargar posturas:', err);
        contenedor.innerHTML = `
          <div style="color: white; text-align: center; padding: 20px; background: rgba(255,0,0,0.2); border-radius: 8px; margin: 20px;">
            <h3>❌ Error al cargar posturas</h3>
            <p>${err.message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #0f684b; color: white; border: none; border-radius: 5px; cursor: pointer;">
              🔄 Recargar página
            </button>
          </div>
        `;
      }
    };

    const mostrarPosturas = (lista) => {
      console.log('🎨 Mostrando posturas:', lista.length);
      
      if (!lista || lista.length === 0) {
        contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">📭 No se encontraron posturas</p>';
        return;
      }
      
      contenedor.innerHTML = '';
      
      lista.forEach((postura, index) => {
        console.log(`🧘 Procesando postura ${index + 1}: ${postura.nombre_es}`);
        
        if (!postura.id || !postura.nombre_es) {
          console.warn('⚠️ Postura con datos incompletos:', postura);
          return;
        }
        
        const div = document.createElement('div');
        div.classList.add('postura');
        
        // ⭐ Usar imagen segura (original o SVG fallback)
        const imagenSegura = obtenerImagenSegura(postura);
        
        div.innerHTML = `
          <a href="javascript:void(0)" onclick="abrirDetalle(${postura.id})" style="text-decoration: none; color: inherit;">
            <img src="${imagenSegura}" 
                 alt="${postura.nombre_es}"
                 onerror="this.src='${crearImagenSVG(postura.nombre_es, postura.id)}'"
                 style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px;">
            <h3>${postura.nombre_es}</h3>
            <p><em>${postura.nombre_sanskrito || 'Sin nombre sánscrito'}</em></p>
          </a>
        `;
        
        contenedor.appendChild(div);
      });
      
      console.log('✅ Todas las posturas mostradas correctamente');
    };

    // Event listeners
    if (filtroSintoma) {
      filtroSintoma.addEventListener('change', () => {
        const val = filtroSintoma.value;
        console.log('🔽 Filtro cambiado a:', val);
        cargarPosturas(val);
      });
    }

    if (inputBusqueda) {
      inputBusqueda.addEventListener('input', () => {
        const texto = inputBusqueda.value.toLowerCase();
        console.log('🔍 Búsqueda:', texto);
        const filtradas = todasLasPosturas.filter(p => 
          p.nombre_es && p.nombre_es.toLowerCase().includes(texto)
        );
        mostrarPosturas(filtradas);
      });
    }

    // ⭐ CARGAR POSTURAS INMEDIATAMENTE
    console.log('🚀 Iniciando carga inicial de posturas');
    cargarPosturas();
  }

  // Iniciar inmediatamente
  iniciarPosturas();
})();

// ⭐ FUNCIÓN GLOBAL: Abrir detalle
function abrirDetalle(posturaId) {
  console.log('🔍 Abriendo detalle de postura:', posturaId);
  
  const contenedor = document.getElementById('contenido');
  if (contenedor) {
    fetch(`/NovaSoft/public/pages/posturas/detalle.html`)
      .then(response => response.text())
      .then(html => {
        contenedor.innerHTML = html;
        
        const script = document.createElement('script');
        script.src = '/NovaSoft/public/js/cargar_detalle.js';
        script.onload = () => {
          window.history.pushState({}, '', `?id=${posturaId}`);
          const event = new Event('DOMContentLoaded');
          document.dispatchEvent(event);
        };
        document.body.appendChild(script);
      })
      .catch(error => {
        console.error('Error cargando detalle:', error);
        contenedor.innerHTML = '<p style="color: red;">Error cargando detalle de la postura</p>';
      });
  }
}