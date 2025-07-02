console.log("▶ Script ejecutarRutina iniciado");

// Verificar el estado del documento
console.log("▶ Estado del documento:", document.readyState);

function ejecutarCargaRutina() {
  console.log("▶ Ejecutando inicialización de rutina...");
  inicializarEjecutarRutina();
}

// Múltiples estrategias para asegurar que se ejecute
if (document.readyState === 'loading') {
  console.log("▶ Documento aún cargando, esperando DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', ejecutarCargaRutina);
} else {
  console.log("▶ DOM ya está listo, ejecutando inmediatamente");
  ejecutarCargaRutina();
}

// Backup: ejecutar después de un pequeño delay
setTimeout(() => {
  console.log("▶ Ejecutando backup después de 100ms");
  ejecutarCargaRutina();
}, 100);

function inicializarEjecutarRutina() {
  console.log("▶ Inicializando ejecución de rutina");
  console.log("▶ Sesion ID disponible:", window.sesionId);
  console.log("▶ Asignacion ID disponible:", window.asignacionId);

  // Variables globales
  let posturas = [];
  let posturaActual = 0;
  let cronometroInterval = null;
  let tiempoRestante = 60;
  let tiempoTotalSesion = 0;
  let tiempoTotalInterval = null;
  let sesionEnPausa = false;
  let cronometroActivo = false;

  // Elementos del DOM
  const loadingView = document.getElementById('loadingView');
  const rutinaView = document.getElementById('rutinaView');
  const cronometroElement = document.getElementById('cronometro');
  const posturaActualElement = document.getElementById('posturaActual');
  const totalPosturasElement = document.getElementById('totalPosturas');
  const posturaNombreElement = document.getElementById('posturaNombre');
  const posturaSubtituloElement = document.getElementById('posturaSubtitulo');
  const infoSesionIdElement = document.getElementById('infoSesionId');
  const tiempoTotalElement = document.getElementById('tiempoTotal');
  const estadoSesionElement = document.getElementById('estadoSesion');

  // Botones
  const btnIniciar = document.getElementById('btnIniciar');
  const btnPausar = document.getElementById('btnPausar');
  const btnVideo = document.getElementById('btnVideo');
  const btnInstrucciones = document.getElementById('btnInstrucciones');
  const btnBeneficios = document.getElementById('btnBeneficios');
  const btnModificaciones = document.getElementById('btnModificaciones');
  const btnPrecauciones = document.getElementById('btnPrecauciones');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnSiguiente = document.getElementById('btnSiguiente');
  const btnFinalizar = document.getElementById('btnFinalizar');

  // Elementos del modal
  const infoModal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeModal = document.getElementById('closeModal');

  // Verificar datos necesarios
  if (!window.sesionId) {
    console.error("❌ No se encontró sesion_id");
    alert("Error: No se pudo obtener la información de la sesión.");
    return;
  }

  // Mostrar información de la sesión
  infoSesionIdElement.textContent = window.sesionId;

  // ✅ NO mostrar loading view, ir directo a cargar datos
  console.log("▶ Cargando posturas directamente sin pantalla de carga...");
  
  // Ocultar loading inmediatamente si existe
  if (loadingView) {
    loadingView.style.display = 'none';
    loadingView.classList.add('hidden');
  }
  
  // Mostrar rutina view inmediatamente
  if (rutinaView) {
    rutinaView.style.display = 'block';
    rutinaView.classList.remove('hidden');
  }

  // Cargar datos de rutina inmediatamente
  cargarPosturasRutina();

  // Event Listeners
  btnIniciar.addEventListener('click', iniciarCronometro);
  btnPausar.addEventListener('click', togglePausa);
  btnAnterior.addEventListener('click', posturaAnterior);
  btnSiguiente.addEventListener('click', siguientePostura);
  btnFinalizar.addEventListener('click', finalizarSesion);
  btnVideo.addEventListener('click', () => mostrarModal('Video', 'video'));
  btnInstrucciones.addEventListener('click', () => mostrarModal('Instrucciones', 'instrucciones'));
  btnBeneficios.addEventListener('click', () => mostrarModal('Beneficios', 'beneficios'));
  btnModificaciones.addEventListener('click', () => mostrarModal('Modificaciones', 'modificaciones'));
  btnPrecauciones.addEventListener('click', () => mostrarModal('Precauciones', 'precauciones'));
  
  // Event listeners del modal
  closeModal.addEventListener('click', cerrarModal);
  infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
      cerrarModal();
    }
  });

  async function cargarPosturasRutina() {
    try {
      console.log("▶ Cargando posturas de la rutina...");
      
      const res = await fetch('/NovaSoft/src/models/obtener_posturas_rutina.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asignacion_id: window.asignacionId
        })
      });

      const data = await res.json();
      console.log("▶ Respuesta obtener_posturas_rutina.php:", data);

      if (data.status === "ok") {
        posturas = data.posturas;
        console.log("▶ Posturas cargadas:", posturas.length);
        
        // Mostrar primera postura inmediatamente
        mostrarPostura(0);
        
        // Iniciar cronómetro total
        iniciarCronometroTotal();
        
      } else {
        throw new Error(data.message || "Error al cargar posturas");
      }
    } catch (e) {
      console.error("❌ Error cargando posturas:", e);
      
      // En caso de error, mostrar el loading view con mensaje de error
      if (loadingView) {
        loadingView.innerHTML = `
          <div class="error-message">
            <h2>Error al cargar la rutina</h2>
            <p>${e.message}</p>
            <button onclick="window.cargarContenido('InfoRutina')" class="btn btn-primary">
              Volver a Rutina
            </button>
          </div>
        `;
        loadingView.style.display = 'block';
      }
      
      if (rutinaView) {
        rutinaView.style.display = 'none';
      }
    }
  }

  function mostrarPostura(index) {
    if (index < 0 || index >= posturas.length) return;
    
    posturaActual = index;
    const postura = posturas[index];
    
    console.log("▶ Mostrando postura:", postura.nombre_es);
    
    // Actualizar información
    posturaActualElement.textContent = index + 1;
    totalPosturasElement.textContent = posturas.length;
    posturaNombreElement.textContent = postura.nombre_es;
    posturaSubtituloElement.textContent = postura.nombre_sanskrito || '';
    
    // Actualizar imagen
    const img = document.getElementById('posturaImagen');
    const placeholder = document.getElementById('imagenPlaceholder');
    
    if (postura.foto_url) {
      img.src = postura.foto_url;
      img.style.display = 'block';
      placeholder.style.display = 'none';
    } else {
      img.style.display = 'none';
      placeholder.style.display = 'block';
    }
    
    // Resetear cronómetro y estado
    detenerCronometro();
    cronometroActivo = false;
    tiempoRestante = postura.duracion_segundos || 60;
    actualizarCronometro();
    
    // Actualizar estado de botones
    btnIniciar.disabled = false;
    btnIniciar.textContent = '▶ Iniciar Postura';
    btnPausar.disabled = true;
    btnPausar.textContent = 'Pausar';
    estadoSesionElement.textContent = 'Listo para iniciar';
    
    // Actualizar botones de navegación
    btnAnterior.disabled = index === 0;
    btnSiguiente.style.display = index === posturas.length - 1 ? 'none' : 'inline-block';
    btnFinalizar.style.display = index === posturas.length - 1 ? 'inline-block' : 'none';
  }

  function iniciarCronometro() {
    if (!cronometroActivo) {
      console.log("▶ Iniciando cronómetro manualmente");
      cronometroActivo = true;
      sesionEnPausa = false;
      
      // Actualizar estado de botones
      btnIniciar.disabled = true;
      btnPausar.disabled = false;
      estadoSesionElement.textContent = 'En progreso';
      
      // Iniciar el intervalo del cronómetro
      cronometroInterval = setInterval(() => {
        if (!sesionEnPausa) {
          tiempoRestante--;
          actualizarCronometro();
          
          if (tiempoRestante <= 0) {
            posturaCompletada();
          }
        }
      }, 1000);
    }
  }

  function detenerCronometro() {
    if (cronometroInterval) {
      clearInterval(cronometroInterval);
      cronometroInterval = null;
    }
    cronometroActivo = false;
  }

  function actualizarCronometro() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    cronometroElement.textContent = 
      `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  function iniciarCronometroTotal() {
    tiempoTotalInterval = setInterval(() => {
      if (!sesionEnPausa && cronometroActivo) { // Solo contar cuando el cronómetro esté activo
        tiempoTotalSesion++;
        const minutos = Math.floor(tiempoTotalSesion / 60);
        const segundos = tiempoTotalSesion % 60;
        tiempoTotalElement.textContent = 
          `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  function togglePausa() {
    if (cronometroActivo) {
      sesionEnPausa = !sesionEnPausa;
      btnPausar.textContent = sesionEnPausa ? 'Reanudar' : 'Pausar';
      estadoSesionElement.textContent = sesionEnPausa ? 'Pausado' : 'En progreso';
      console.log("▶ Sesión", sesionEnPausa ? 'pausada' : 'reanudada');
    }
  }

  function posturaAnterior() {
    if (posturaActual > 0) {
      mostrarPostura(posturaActual - 1);
      // No iniciar automáticamente el cronómetro
    }
  }

  function siguientePostura() {
    if (posturaActual < posturas.length - 1) {
      mostrarPostura(posturaActual + 1);
      // No iniciar automáticamente el cronómetro
    } else {
      // Última postura
      detenerCronometro();
      btnFinalizar.style.display = 'inline-block';
      btnSiguiente.style.display = 'none';
      btnIniciar.disabled = true;
      btnPausar.disabled = true;
    }
  }

  function posturaCompletada() {
    console.log("▶ Postura completada automáticamente");
    detenerCronometro();
    
    // Mostrar mensaje de postura completada
    estadoSesionElement.textContent = 'Postura completada';
    btnIniciar.textContent = '✓ Completada';
    
    // Si no es la última postura, habilitar el botón siguiente
    if (posturaActual < posturas.length - 1) {
      setTimeout(() => {
        siguientePostura();
      }, 2000); // Esperar 2 segundos antes de pasar a la siguiente
    } else {
      // Es la última postura
      btnFinalizar.style.display = 'inline-block';
      btnSiguiente.style.display = 'none';
    }
  }

  function mostrarModal(titulo, tipo) {
    const postura = posturas[posturaActual];
    if (!postura) return;

    modalTitle.textContent = titulo;
    let contenido = '';

    switch (tipo) {
      case 'video':
        if (postura.video_url) {
          contenido = `
            <video class="modal-video" controls>
              <source src="${postura.video_url}" type="video/mp4">
              Tu navegador no soporta el elemento de video.
            </video>
            <p>Video demostrativo de la postura: <strong>${postura.nombre_es}</strong></p>
          `;
        } else {
          contenido = '<p>No hay video disponible para esta postura.</p>';
        }
        break;
        
      case 'instrucciones':
        contenido = postura.instrucciones || 
          '<p>No hay instrucciones específicas disponibles para esta postura.</p>';
        break;
        
      case 'beneficios':
        contenido = postura.beneficios || 
          '<p>No hay información de beneficios disponible para esta postura.</p>';
        break;
        
      case 'modificaciones':
        contenido = postura.modificaciones || 
          '<p>No hay modificaciones específicas disponibles para esta postura.</p>';
        break;
        
      case 'precauciones':
        contenido = postura.precauciones || 
          '<p>No hay precauciones específicas disponibles para esta postura.</p>';
        break;
        
      default:
        contenido = '<p>Información no disponible.</p>';
    }

    modalBody.innerHTML = contenido;
    infoModal.style.display = 'block';
  }

  function cerrarModal() {
    infoModal.style.display = 'none';
    // Pausar video si existe
    const video = modalBody.querySelector('video');
    if (video) {
      video.pause();
    }
  }

  async function finalizarSesion() {
    try {
      console.log("▶ Finalizando sesión...");
      
      // Detener cronómetros
      detenerCronometro();
      if (tiempoTotalInterval) {
        clearInterval(tiempoTotalInterval);
      }
      
      // Guardar información para la página de dolor final
      window.tiempoTotalSesion = tiempoTotalSesion;
      window.posturasCompletadas = posturas.length;
      
      console.log("▶ Redirigiendo a dolor final...");
      console.log("▶ Tiempo total sesión:", tiempoTotalSesion);
      console.log("▶ Posturas completadas:", posturas.length);
      
      // Cargar la página de dolor final
      cargarContenido('paciente', 'DolorFinal');
    } catch (e) {
      console.error("❌ Error finalizando sesión:", e);
      alert("Error al finalizar la sesión: " + e.message);
    }
  }
}
