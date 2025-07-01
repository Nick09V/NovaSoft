console.log("▶ Cargar info de rutina - Script iniciado");

// Verificar el estado del documento
console.log("▶ Estado del documento:", document.readyState);

function ejecutarCarga() {
  console.log("▶ Ejecutando cargarInfoRutina...");
  cargarInfoRutina();
}

// Múltiples estrategias para asegurar que se ejecute
if (document.readyState === 'loading') {
  console.log("▶ Documento aún cargando, esperando DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', ejecutarCarga);
} else {
  console.log("▶ DOM ya está listo, ejecutando inmediatamente");
  ejecutarCarga();
}

// Backup: ejecutar después de un pequeño delay
setTimeout(() => {
  console.log("▶ Ejecutando backup después de 100ms");
  ejecutarCarga();
}, 100);

async function cargarInfoRutina() {
  console.log("▶ Iniciando función cargarInfoRutina()");
  
  // Verificar si hay un mensaje de serie completada por intento fallido
  if (window.mensajeSerieCompletada) {
    console.log("▶ Mostrando mensaje de intento fallido:", window.mensajeSerieCompletada);
    // Esperar un momento para que la UI se cargue
    setTimeout(() => {
      mostrarMensajeIntentoFallido(window.mensajeSerieCompletada);
      // Limpiar el mensaje
      window.mensajeSerieCompletada = null;
    }, 500);
  }
  
  // FORZAR verificación adicional después de cargar
  setTimeout(() => {
    console.log("▶ Verificación post-carga del botón");
    const btnCheck = document.getElementById('btnIniciarSesion');
    if (btnCheck) {
      console.log("▶ Estado actual del botón:");
      console.log("   - Disabled:", btnCheck.disabled);
      console.log("   - Text:", btnCheck.textContent);
      console.log("   - Style:", btnCheck.style.cssText);
      console.log("   - PointerEvents:", btnCheck.style.pointerEvents);
    }
  }, 1000);
  
  try {
    console.log("▶ Haciendo fetch a obtener_rutina.php");
    const res = await fetch('/NovaSoft/src/models/obtener_rutina.php', {
      credentials: 'include'
    });

    console.log("▶ Estado de respuesta HTTP:", res.status);
    console.log("▶ Headers de respuesta:", res.headers);

    if (!res.ok) {
      console.error("Error HTTP:", res.status);
      console.error("Status text:", res.statusText);
      return;
    }

    console.log("▶ Intentando parsear JSON...");
    const data = await res.json();
    console.log("▶ Datos recibidos de obtener_rutina.php:", data);

    if (data.status === "ok") {
      console.log("▶ Serie encontrada, actualizando UI...");
      console.log("▶ DATOS COMPLETOS:", JSON.stringify(data, null, 2));
      console.log("▶ Nombre serie:", data.serie.serie_nombre);
      console.log("▶ Nombre terapia:", data.serie.terapia_nombre);
      console.log("▶ Sesiones realizadas:", data.serie.sesiones_realizadas);
      console.log("▶ Número sesiones:", data.serie.numero_sesiones);
      console.log("▶ Tipo de sesiones realizadas:", typeof data.serie.sesiones_realizadas);
      console.log("▶ Tipo de número sesiones:", typeof data.serie.numero_sesiones);
      
      // Verificar que los elementos existen
      const elemNombreSerie = document.getElementById('nombreSerie');
      const elemNombreTerapia = document.getElementById('nombreTerapia');
      const elemSesionesRealizadas = document.getElementById('sesionesRealizadas');
      const elemNumeroSesiones = document.getElementById('numeroSesiones');
      
      console.log("▶ Elemento nombreSerie:", elemNombreSerie);
      console.log("▶ Elemento nombreTerapia:", elemNombreTerapia);
      console.log("▶ Elemento sesionesRealizadas:", elemSesionesRealizadas);
      console.log("▶ Elemento numeroSesiones:", elemNumeroSesiones);
      
      if (elemNombreSerie) elemNombreSerie.textContent = data.serie.serie_nombre;
      if (elemNombreTerapia) elemNombreTerapia.textContent = data.serie.terapia_nombre;
      if (elemSesionesRealizadas) elemSesionesRealizadas.textContent = data.serie.sesiones_realizadas;
      if (elemNumeroSesiones) elemNumeroSesiones.textContent = data.serie.numero_sesiones;

      const btn = document.getElementById('btnIniciarSesion');
      
      // NUEVA VALIDACIÓN: Verificar si ya completó todas las sesiones
      const sesionesRealizadas = parseInt(data.serie.sesiones_realizadas) || 0;
      const numeroSesiones = parseInt(data.serie.numero_sesiones) || 0;
      const sesionesCompletadas = sesionesRealizadas >= numeroSesiones;
      
      console.log("▶ ===== VALIDACIÓN DE SESIONES =====");
      console.log("▶ Sesiones realizadas (parseado):", sesionesRealizadas);
      console.log("▶ Número total sesiones (parseado):", numeroSesiones);
      console.log("▶ Comparación (>=):", sesionesRealizadas >= numeroSesiones);
      console.log("▶ Sesiones completadas:", sesionesCompletadas);
      console.log("▶ ===================================");
      
      if (btn) {
        // Remover TODOS los event listeners posibles
        const btnNuevo = btn.cloneNode(true);
        btn.parentNode.replaceChild(btnNuevo, btn);
        
        if (sesionesCompletadas) {
          console.log("▶ Todas las sesiones completadas, BLOQUEANDO completamente el botón");
          
          // Cambiar completamente el botón
          btnNuevo.innerHTML = '🏆 Serie Completada';
          btnNuevo.disabled = true;
          btnNuevo.className = 'btn btn-completed'; // Nueva clase CSS
          
          // Estilos inline muy específicos
          btnNuevo.style.cssText = `
            background-color: #95a5a6 !important;
            color: #fff !important;
            cursor: not-allowed !important;
            opacity: 0.6 !important;
            pointer-events: none !important;
            border: 2px solid #7f8c8d !important;
            padding: 10px 20px !important;
            border-radius: 5px !important;
            font-size: 14px !important;
          `;
          
          btnNuevo.setAttribute('disabled', 'true');
          btnNuevo.setAttribute('aria-disabled', 'true');
          btnNuevo.setAttribute('tabindex', '-1');
          
          // Como medida extra, agregar un overlay invisible que capte clicks
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 10;
            cursor: not-allowed;
          `;
          
          // Hacer el contenedor del botón relativo para el overlay
          if (btnNuevo.parentNode) {
            btnNuevo.parentNode.style.position = 'relative';
            btnNuevo.parentNode.appendChild(overlay);
          }
          
          // Evento en el overlay para mostrar mensaje
          overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("▶ Intento de clic interceptado por overlay");
            mostrarMensajeIntentoFallido(`Has completado todas las sesiones disponibles para esta serie (${numeroSesiones} sesiones)`);
          });
          
          // Mostrar mensaje de serie completada automáticamente
          mostrarMensajeSerieTerminada(numeroSesiones);
          
        } else {
          console.log("▶ Habilitando botón...");
          btnNuevo.disabled = false;
          btnNuevo.textContent = 'Iniciar Sesión';
          btnNuevo.style.backgroundColor = '';
          btnNuevo.style.cursor = '';
          btnNuevo.style.opacity = '';
          btnNuevo.style.pointerEvents = '';
          btnNuevo.removeAttribute('disabled');
          btnNuevo.removeAttribute('aria-disabled');
          
          // Asegurar que el contenedor del botón no tenga overlay
          if (btnNuevo.parentNode) {
            const existingOverlay = btnNuevo.parentNode.querySelector('div[style*="z-index: 10"]');
            if (existingOverlay) {
              existingOverlay.remove();
            }
            btnNuevo.parentNode.style.position = '';
          }
          
          btnNuevo.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("▶ Botón iniciar sesión clickeado");
            
            // Triple verificación antes de navegar
            if (sesionesRealizadas >= numeroSesiones) {
              console.log("▶ Verificación FINAL: sesiones completadas, BLOQUEANDO navegación");
              mostrarMensajeIntentoFallido(`Has completado todas las sesiones disponibles para esta serie (${numeroSesiones} sesiones)`);
              return false;
            }
            
            // Guardar asignacion_id para la siguiente vista
            window.asignacionId = data.serie.asignacion_id;
            console.log("▶ Asignacion ID guardado:", window.asignacionId);
            cargarContenido('paciente', 'DolorInicial');
          });
        }
      } else {
        console.error("▶ Botón btnIniciarSesion no encontrado");
      }
    } else {
      console.warn("▶ No hay serie asignada al paciente", data);
      document.getElementById('nombreSerie').textContent = "No asignada";
      document.getElementById('nombreTerapia').textContent = "-";
      document.getElementById('sesionesRealizadas').textContent = "0";
      document.getElementById('numeroSesiones').textContent = "0";

      const btn = document.getElementById('btnIniciarSesion');
      if (btn) {
        btn.disabled = true;
      }
      document.getElementById('mensajeErrorRutina').style.display = 'block';
    }
  } catch (e) {
    console.error("❌ Error al obtener datos de la rutina:", e);
    console.error("❌ Tipo de error:", e.constructor.name);
    console.error("❌ Mensaje del error:", e.message);
    
    // Mostrar mensaje de error al usuario
    document.getElementById('nombreSerie').textContent = "Error de conexión";
    document.getElementById('nombreTerapia').textContent = "Error";
    document.getElementById('sesionesRealizadas').textContent = "0";
    document.getElementById('numeroSesiones').textContent = "0";
    document.getElementById('btnIniciarSesion').disabled = true;
  }
}

function mostrarMensajeSerieTerminada(numeroSesiones) {
  console.log("▶ Mostrando mensaje de serie terminada");
  
  // Buscar si ya existe un mensaje
  let mensajeExistente = document.getElementById('mensajeSerieCompletada');
  if (mensajeExistente) {
    mensajeExistente.remove();
  }
  
  // Crear el mensaje
  const mensaje = document.createElement('div');
  mensaje.id = 'mensajeSerieCompletada';
  mensaje.style.cssText = `
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    border: 2px solid #27ae60;
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    color: #155724;
    font-weight: bold;
    animation: fadeIn 0.5s ease-in;
  `;
  
  mensaje.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <h3 style="color: #27ae60; margin-bottom: 10px;">¡Felicitaciones!</h3>
    <p style="margin-bottom: 10px;">Has completado exitosamente todas las sesiones de tu serie terapéutica.</p>
    <p style="font-size: 14px; color: #6c757d;">Contacta a tu instructor para obtener una nueva serie si lo necesitas.</p>
  `;
  
  // Agregar estilos de animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
  
  // Insertar el mensaje después del botón
  const btn = document.getElementById('btnIniciarSesion');
  if (btn && btn.parentNode) {
    btn.parentNode.insertBefore(mensaje, btn.nextSibling);
  }
}

function mostrarMensajeIntentoFallido(mensajeBackend) {
  console.log("▶ Mostrando mensaje de intento fallido:", mensajeBackend);
  
  // Buscar si ya existe un mensaje
  let mensajeExistente = document.getElementById('mensajeIntentoFallido');
  if (mensajeExistente) {
    mensajeExistente.remove();
  }
  
  // Crear el mensaje de alerta
  const mensaje = document.createElement('div');
  mensaje.id = 'mensajeIntentoFallido';
  mensaje.style.cssText = `
    background: linear-gradient(135deg, #f8d7da, #f5c6cb);
    border: 2px solid #e74c3c;
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
    text-align: center;
    color: #721c24;
    font-weight: bold;
    animation: slideIn 0.5s ease-out;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  `;
  
  mensaje.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
    <h3 style="color: #e74c3c; margin-bottom: 10px;">¡Atención!</h3>
    <p style="margin-bottom: 15px; font-size: 16px;">${mensajeBackend}</p>
    <p style="font-size: 14px; color: #6c757d; margin-bottom: 15px;">No puedes crear más sesiones para esta serie.</p>
    <button onclick="this.parentElement.remove()" style="
      background: #e74c3c;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
    ">Entendido</button>
  `;
  
  // Agregar estilos de animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { 
        opacity: 0; 
        transform: translateY(-20px) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1); 
      }
    }
  `;
  document.head.appendChild(style);
  
  // Insertar el mensaje al principio del contenido
  const rutinaContainer = document.querySelector('.rutina-info-container') || document.body;
  if (rutinaContainer) {
    rutinaContainer.insertBefore(mensaje, rutinaContainer.firstChild);
  }
  
  // Auto-remover después de 8 segundos
  setTimeout(() => {
    if (mensaje && mensaje.parentNode) {
      mensaje.style.animation = 'fadeOut 0.5s ease-out';
      setTimeout(() => {
        mensaje.remove();
      }, 500);
    }
  }, 8000);
  
  // Agregar estilo de fadeOut
  const fadeOutStyle = document.createElement('style');
  fadeOutStyle.textContent = `
    @keyframes fadeOut {
      from { opacity: 1; transform: scale(1); }
      to { opacity: 0; transform: scale(0.95); }
    }
  `;
  document.head.appendChild(fadeOutStyle);
}
