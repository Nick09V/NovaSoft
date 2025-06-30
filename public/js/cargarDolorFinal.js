console.log("▶ Script cargarDolorFinal iniciado");

// Verificar el estado del documento
console.log("▶ Estado del documento:", document.readyState);

function ejecutarCargaDolorFinal() {
  console.log("▶ Ejecutando inicialización de dolor final...");
  inicializarDolorFinal();
}

// Múltiples estrategias para asegurar que se ejecute
if (document.readyState === 'loading') {
  console.log("▶ Documento aún cargando, esperando DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', ejecutarCargaDolorFinal);
} else {
  console.log("▶ DOM ya está listo, ejecutando inmediatamente");
  ejecutarCargaDolorFinal();
}

// Backup: ejecutar después de un pequeño delay
setTimeout(() => {
  console.log("▶ Ejecutando backup después de 100ms");
  ejecutarCargaDolorFinal();
}, 100);

function inicializarDolorFinal() {
  console.log("▶ Inicializando dolor final");
  console.log("▶ Sesion ID disponible:", window.sesionId);
  console.log("▶ Tiempo total:", window.tiempoTotalSesion);
  console.log("▶ Posturas completadas:", window.posturasCompletadas);

  // Elementos del DOM
  const loadingView = document.getElementById('loadingView');
  const dolorView = document.getElementById('dolorView');
  const infoSesionIdElement = document.getElementById('infoSesionId');
  const tiempoTotalElement = document.getElementById('tiempoTotal');
  const posturasCompletadasElement = document.getElementById('posturasCompletadas');
  const btnConfirmar = document.getElementById('btnConfirmar');
  const btnVolver = document.getElementById('btnVolver');

  // Verificar que tenemos los datos necesarios
  if (!window.sesionId) {
    console.error("▶ No se encontró sesionId");
    alert("Error: No se encontró información de la sesión");
    cargarContenido('paciente', 'Rutina');
    return;
  }

  // Mostrar información de la sesión
  if (infoSesionIdElement) infoSesionIdElement.textContent = window.sesionId || '-';
  if (tiempoTotalElement) tiempoTotalElement.textContent = Math.ceil((window.tiempoTotalSesion || 0) / 60);
  if (posturasCompletadasElement) posturasCompletadasElement.textContent = window.posturasCompletadas || '-';

  // Ocultar loading y mostrar la vista principal
  if (loadingView) loadingView.classList.add('hidden');
  if (dolorView) dolorView.classList.remove('hidden');

  // Event listeners
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', confirmarDolorFinal);
  }

  if (btnVolver) {
    btnVolver.addEventListener('click', () => {
      cargarContenido('paciente', 'Rutina');
    });
  }

  console.log("▶ Dolor final inicializado correctamente");
}

function seleccionarOpcion(valor) {
  console.log("▶ Seleccionando opción de dolor:", valor);
  
  // Desmarcar todas las opciones
  const opciones = document.querySelectorAll('.dolor-opcion');
  opciones.forEach(opcion => opcion.classList.remove('selected'));
  
  // Marcar la opción seleccionada
  const radioButton = document.getElementById(`dolor${valor}`);
  if (radioButton) {
    radioButton.checked = true;
    radioButton.closest('.dolor-opcion').classList.add('selected');
    
    // Habilitar el botón de confirmar
    const btnConfirmar = document.getElementById('btnConfirmar');
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
    }
  }
}

async function confirmarDolorFinal() {
  console.log("▶ Confirmando dolor final...");
  
  const nivelDolorElement = document.querySelector('input[name="nivelDolor"]:checked');
  if (!nivelDolorElement) {
    alert('Por favor selecciona tu nivel de dolor actual');
    return;
  }

  const nivelDolor = parseInt(nivelDolorElement.value);
  const nivelesDolor = ['', 'SIN DOLOR', 'LEVE', 'MODERADO', 'INTENSO', 'MÁXIMO'];
  const dolorFinalTexto = nivelesDolor[nivelDolor] || 'SIN DOLOR';
  
  console.log("▶ Dolor final seleccionado:", dolorFinalTexto);

  // Deshabilitar el botón mientras procesamos
  const btnConfirmar = document.getElementById('btnConfirmar');
  if (btnConfirmar) {
    btnConfirmar.disabled = true;
    btnConfirmar.textContent = 'Finalizando...';
  }

  try {
    const res = await fetch('/NovaSoft/src/models/finalizar_sesion.php', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sesion_id: window.sesionId,
        dolor_final: dolorFinalTexto,
        tiempo_total_minutos: Math.ceil((window.tiempoTotalSesion || 0) / 60)
      })
    });

    const data = await res.json();
    console.log("▶ Respuesta finalizar_sesion.php:", data);

    if (data.status === "ok") {
      // Mostrar mensaje de éxito en la interfaz
      mostrarMensajeExito();
      
      // Limpiar variables globales después de un delay
      setTimeout(() => {
        window.sesionId = null;
        window.asignacionId = null;
        window.tiempoTotalSesion = null;
        window.posturasCompletadas = null;
        
        // Volver a la página de rutina
        cargarContenido('paciente', 'Rutina');
      }, 3000); // 3 segundos para mostrar el mensaje
    } else {
      console.error("▶ Error al finalizar sesión:", data);
      mostrarMensajeError("Error al finalizar la sesión: " + (data.message || "Error desconocido"));
      
      // Re-habilitar el botón
      if (btnConfirmar) {
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Finalizar Sesión';
      }
    }
  } catch (error) {
    console.error("▶ Error de conexión:", error);
    mostrarMensajeError("Error de conexión al finalizar la sesión");
    
    // Re-habilitar el botón
    if (btnConfirmar) {
      btnConfirmar.disabled = false;
      btnConfirmar.textContent = 'Finalizar Sesión';
    }
  }
}

function mostrarMensajeExito() {
  // Ocultar el formulario de dolor
  const dolorView = document.getElementById('dolorView');
  if (dolorView) {
    dolorView.innerHTML = `
      <div class="mensaje-exito">
        <div class="icono-exito">✅</div>
        <h2 class="titulo-exito">¡Sesión Completada Exitosamente!</h2>
        <p class="descripcion-exito">Tu rutina de yoga terapéutico ha sido finalizada correctamente.</p>
        <p class="redireccion-info">Serás redirigido automáticamente en unos segundos...</p>
        <div class="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    `;
    
    // Agregar estilos dinámicamente
    const style = document.createElement('style');
    style.textContent = `
      .mensaje-exito {
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #d4edda, #c3e6cb);
        border-radius: 15px;
        border: 2px solid #27ae60;
        margin: 20px auto;
        max-width: 500px;
      }
      
      .icono-exito {
        font-size: 64px;
        margin-bottom: 20px;
        animation: bounce 1s ease-in-out;
      }
      
      .titulo-exito {
        font-size: 28px;
        color: #27ae60;
        margin-bottom: 15px;
        font-weight: bold;
      }
      
      .descripcion-exito {
        font-size: 18px;
        color: #155724;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      
      .redireccion-info {
        font-size: 16px;
        color: #6c757d;
        margin-bottom: 20px;
      }
      
      .loading-dots {
        font-size: 20px;
        color: #27ae60;
      }
      
      .loading-dots span {
        animation: blink 1.4s infinite;
      }
      
      .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
      }
      
      .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        25%, 75% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
  }
}

function mostrarMensajeError(mensaje) {
  // Mostrar mensaje de error integrado
  const dolorView = document.getElementById('dolorView');
  if (dolorView) {
    const mensajeErrorDiv = document.createElement('div');
    mensajeErrorDiv.className = 'mensaje-error';
    mensajeErrorDiv.innerHTML = `
      <div class="icono-error">❌</div>
      <h3>Error al finalizar sesión</h3>
      <p>${mensaje}</p>
      <button onclick="location.reload()" class="btn btn-secondary">Reintentar</button>
    `;
    
    // Agregar estilos para el mensaje de error
    const style = document.createElement('style');
    style.textContent = `
      .mensaje-error {
        background: #f8d7da;
        border: 2px solid #e74c3c;
        border-radius: 10px;
        padding: 20px;
        text-align: center;
        margin: 20px 0;
        color: #721c24;
      }
      
      .icono-error {
        font-size: 48px;
        margin-bottom: 15px;
      }
      
      .mensaje-error h3 {
        color: #e74c3c;
        margin-bottom: 10px;
      }
      
      .mensaje-error p {
        margin-bottom: 20px;
      }
    `;
    document.head.appendChild(style);
    
    dolorView.prepend(mensajeErrorDiv);
  }
}
