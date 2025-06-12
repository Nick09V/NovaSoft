// Función que se ejecuta inmediatamente, sin esperar DOMContentLoaded
function iniciarCargaPosturas() {
  console.log('🚀 INICIANDO CARGA DE POSTURAS INMEDIATAMENTE');
  
  // Esperar a que el DOM esté listo
  const verificarYCargar = () => {
    const contenedor = document.getElementById('contenedor-posturas');
    const filtroSintoma = document.getElementById('filtro-sintoma');
    const inputBusqueda = document.getElementById('busqueda');

    console.log('🔍 Verificando elementos DOM...');
    console.log('📦 Contenedor:', contenedor);
    console.log('🔽 Filtro:', filtroSintoma);
    console.log('🔍 Input búsqueda:', inputBusqueda);

    if (!contenedor) {
      console.log('⏳ Contenedor no encontrado aún, reintentando en 100ms...');
      setTimeout(verificarYCargar, 100);
      return;
    }

    console.log('✅ Elementos DOM encontrados, iniciando aplicación...');
    
    let todasLasPosturas = [];

    // ⭐ FUNCIÓN MEJORADA: Verificar y corregir URLs de imágenes
    const verificarImagen = (url, nombre) => {
      return new Promise((resolve) => {
        if (!url || url.trim() === '') {
          console.warn(`⚠️ URL vacía para ${nombre}, usando imagen por defecto`);
          resolve(crearImagenPorDefecto(nombre));
          return;
        }

        const img = new Image();
        img.onload = () => {
          console.log(`✅ Imagen válida para ${nombre}: ${url}`);
          resolve(url);
        };
        img.onerror = () => {
          console.warn(`❌ Error cargando imagen para ${nombre}: ${url}`);
          resolve(crearImagenPorDefecto(nombre));
        };
        
        // Timeout de 3 segundos para cargar la imagen
        setTimeout(() => {
          console.warn(`⏰ Timeout cargando imagen para ${nombre}: ${url}`);
          resolve(crearImagenPorDefecto(nombre));
        }, 3000);
        
        img.src = url;
      });
    };

    // ⭐ FUNCIÓN: Crear imagen SVG por defecto personalizada
    const crearImagenPorDefecto = (nombrePostura) => {
      const texto = nombrePostura.length > 15 ? 
        nombrePostura.substring(0, 15) + '...' : 
        nombrePostura;
      
      const svg = `
        <svg width="200" height="160" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#0f684b;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7BBF7B;stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad)"/>
          <circle cx="100" cy="50" r="15" fill="white" opacity="0.8"/>
          <ellipse cx="100" cy="80" rx="30" ry="8" fill="white" opacity="0.6"/>
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

    // Función para cargar posturas con múltiples intentos
    const cargarPosturas = async (terapiaId = '', reintentos = 3) => {
      console.log(`📡 Cargando posturas (intentos restantes: ${reintentos})...`);
      
      if (contenedor) {
        contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px; font-size: 1.2em;">🔄 Cargando posturas...</p>';
      }
      
      for (let intento = 1; intento <= reintentos; intento++) {
        try {
          console.log(`🔄 Intento ${intento} de ${reintentos}`);
          
          // Múltiples URLs para probar
          const urls = [
            'http://localhost/NovaSoft/src/models/posturas.php',
            '/NovaSoft/src/models/posturas.php',
            '../../../src/models/posturas.php'
          ];
          
          let data = null;
          let urlUsada = '';
          
          // Probar cada URL hasta que una funcione
          for (const baseUrl of urls) {
            try {
              const url = terapiaId ? `${baseUrl}?terapia=${terapiaId}` : baseUrl;
              console.log(`🌐 Probando URL ${intento}: ${url}`);
              
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
              
              const res = await fetch(url, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
                },
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              console.log(`📊 Respuesta de ${url}:`, res.status, res.statusText);
              
              if (res.ok) {
                const responseText = await res.text();
                console.log(`📄 Texto de respuesta (primeros 200 chars):`, responseText.substring(0, 200));
                
                data = JSON.parse(responseText);
                urlUsada = url;
                console.log(`✅ Datos obtenidos exitosamente de: ${urlUsada}`);
                break; // Salir del bucle de URLs si esta funciona
              }
            } catch (urlError) {
              console.warn(`⚠️ Error con URL ${baseUrl}:`, urlError.message);
              continue; // Probar la siguiente URL
            }
          }
          
          if (!data) {
            throw new Error('Ninguna URL funcionó');
          }
          
          if (data.error) {
            throw new Error(`Error del servidor: ${data.error}`);
          }
          
          if (!Array.isArray(data)) {
            throw new Error('La respuesta no es un array');
          }
          
          console.log(`📏 Posturas recibidas: ${data.length}`);
          
          if (data.length === 0) {
            if (contenedor) {
              contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">📭 No se encontraron posturas en la base de datos</p>';
            }
            return;
          }
          
          todasLasPosturas = data;
          mostrarPosturas(todasLasPosturas);
          return; // Éxito, salir de la función
          
        } catch (error) {
          console.error(`❌ Error en intento ${intento}:`, error);
          
          if (intento === reintentos) {
            // Último intento fallido
            if (contenedor) {
              contenedor.innerHTML = `
                <div style="color: white; text-align: center; padding: 20px; background: rgba(255,0,0,0.2); border-radius: 8px; margin: 20px;">
                  <h3>❌ Error al cargar posturas</h3>
                  <p><strong>Error:</strong> ${error.message}</p>
                  <p><small>Intento ${intento} de ${reintentos} falló</small></p>
                  <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #0f684b; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Recargar página
                  </button>
                </div>
              `;
            }
          } else {
            // Esperar antes del siguiente intento
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    };

    const mostrarPosturas = async (lista) => {
      console.log('🎨 Mostrando posturas:', lista.length);
      
      if (!contenedor) {
        console.error('❌ Contenedor no disponible para mostrar posturas');
        return;
      }
      
      if (!lista || lista.length === 0) {
        contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">📭 No hay posturas para mostrar</p>';
        return;
      }
      
      contenedor.innerHTML = '<p style="color: white; text-align: center; padding: 20px;">🖼️ Verificando imágenes...</p>';
      
      // ⭐ VERIFICAR TODAS LAS IMÁGENES ANTES DE MOSTRARLAS
      const posturasConImagenes = await Promise.all(
        lista.map(async (postura, index) => {
          console.log(`🔍 Verificando imagen ${index + 1}: ${postura.nombre_es}`);
          const imagenUrl = await verificarImagen(postura.foto_url, postura.nombre_es);
          return {
            ...postura,
            foto_url_verificada: imagenUrl
          };
        })
      );

      contenedor.innerHTML = '';
      
      posturasConImagenes.forEach((postura, index) => {
        try {
          console.log(`🧘 Creando tarjeta ${index + 1}: ${postura.nombre_es}`);
          
          if (!postura.id || !postura.nombre_es) {
            console.warn('⚠️ Postura con datos incompletos:', postura);
            return;
          }
          
          const div = document.createElement('div');
          div.classList.add('postura');
          
          div.innerHTML = `
            <a href="javascript:void(0)" onclick="abrirDetalle(${postura.id})">
              <img src="${postura.foto_url_verificada}" 
                   alt="${postura.nombre_es}"
                   style="width: 100%; height: 160px; object-fit: cover; border-radius: 8px;">
              <h3 style="margin: 10px 0; color: #0f684b;">${postura.nombre_es}</h3>
              <p style="color: #666; font-style: italic;"><em>${postura.nombre_sanskrito || 'Sin nombre sánscrito'}</em></p>
            </a>
          `;
          
          contenedor.appendChild(div);
        } catch (error) {
          console.error(`❌ Error creando tarjeta para postura ${index}:`, error);
        }
      });
      
      console.log('✅ Todas las posturas mostradas correctamente');
    };

    // Configurar event listeners
    if (filtroSintoma) {
      filtroSintoma.addEventListener('change', () => {
        const val = filtroSintoma.value;
        console.log('🔽 Filtro cambiado a:', val);
        cargarPosturas(val);
      });
      console.log('✅ Event listener del filtro configurado');
    }

    if (inputBusqueda) {
      inputBusqueda.addEventListener('input', () => {
        const texto = inputBusqueda.value.toLowerCase();
        console.log('🔍 Búsqueda:', texto);
        if (todasLasPosturas.length > 0) {
          const filtradas = todasLasPosturas.filter(p => 
            p.nombre_es && p.nombre_es.toLowerCase().includes(texto)
          );
          mostrarPosturas(filtradas);
        }
      });
      console.log('✅ Event listener de búsqueda configurado');
    }

    // Iniciar carga de posturas
    console.log('🚀 Iniciando carga inicial de posturas...');
    cargarPosturas();
  };

  // Iniciar verificación inmediatamente
  verificarYCargar();
}

// ⭐ FUNCIÓN: Abrir detalle sin cambiar de página
function abrirDetalle(posturaId) {
  console.log('🔍 Abriendo detalle de postura:', posturaId);
  
  // Cargar el detalle dinámicamente en el mismo contenedor
  const contenedor = document.getElementById('contenido');
  if (contenedor) {
    // Hacer fetch del HTML de detalle
    fetch(`/NovaSoft/public/pages/posturas/detalle.html`)
      .then(response => response.text())
      .then(html => {
        contenedor.innerHTML = html;
        
        // Cargar el script de detalle
        const script = document.createElement('script');
        script.src = '/NovaSoft/public/js/cargar_detalle.js';
        script.onload = () => {
          // Simular que la URL tiene el parámetro id
          window.history.pushState({}, '', `?id=${posturaId}`);
          
          // Disparar el evento DOMContentLoaded para el script de detalle
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

// Ejecutar inmediatamente
console.log('📋 Script cargado, iniciando...');
iniciarCargaPosturas();

// También ejecutar cuando el DOM esté listo (por si acaso)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarCargaPosturas);
} else {
  // DOM ya está listo
  setTimeout(iniciarCargaPosturas, 100);
}