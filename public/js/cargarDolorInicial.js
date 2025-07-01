console.log("▶ Script cargarDolorInicial iniciado");

// Verificar el estado del documento
console.log("▶ Estado del documento:", document.readyState);

function ejecutarCargaDolorInicial() {
  console.log("▶ Ejecutando inicialización del dolor inicial...");
  inicializarDolorInicial();
}

// Múltiples estrategias para asegurar que se ejecute
if (document.readyState === 'loading') {
  console.log("▶ Documento aún cargando, esperando DOMContentLoaded");
  document.addEventListener('DOMContentLoaded', ejecutarCargaDolorInicial);
} else {
  console.log("▶ DOM ya está listo, ejecutando inmediatamente");
  ejecutarCargaDolorInicial();
}

// Backup: ejecutar después de un pequeño delay
setTimeout(() => {
  console.log("▶ Ejecutando backup después de 100ms");
  ejecutarCargaDolorInicial();
}, 100);

function inicializarDolorInicial() {
  const select = document.getElementById('dolorSelect');
  let btn = document.getElementById('btnConfirmarDolor');
  
  console.log("▶ DolorInicial listo");
  console.log("▶ Asignacion ID disponible:", window.asignacionId);

  // Verificar que tenemos el asignacion_id
  if (!window.asignacionId) {
    console.error("❌ No se encontró asignacion_id");
    alert("Error: No se pudo obtener la información de la sesión. Vuelve a la página anterior.");
    return;
  }

  // ✅ Reemplazar botón para limpiar listeners duplicados
  if (btn) {
    const nuevoBtn = btn.cloneNode(true);
    btn.replaceWith(nuevoBtn);
    btn = nuevoBtn;
  }

  btn?.addEventListener('click', async () => {
    const valorDolor = select?.value;

    if (!valorDolor) {
      alert("Selecciona una intensidad de dolor.");
      return;
    }

    console.log("▶ Dolor inicial seleccionado:", valorDolor);

    try {
      const res = await fetch('/NovaSoft/src/models/crear_sesion.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asignacion_id: window.asignacionId,
          dolor_inicial: valorDolor
        })
      });

      const data = await res.json();
      console.log("▶ Respuesta crear_sesion.php:", data);

      if (data.status === "ok") {
        const msg = document.getElementById('mensajeExito');
        if (msg) {
          msg.textContent = "✅ Sesión inicial creada correctamente.";
          msg.style.display = 'block';
        }
        
        console.log("▶ Sesión creada exitosamente, navegando a rutina...");
        
        // Guardar el ID de la sesión para la ejecución de rutina
        window.sesionId = data.sesion_id;
        console.log("▶ Sesion ID guardado:", window.sesionId);
        
        // Navegar a la pantalla de ejecución de rutina después de 1.5 segundos
        setTimeout(() => {
          cargarContenido('paciente', 'EjecutarRutina');
        }, 1500);
      } else {
        console.error("▶ Error en respuesta:", data);
        
        // Verificar si es porque ya completó todas las sesiones
        if (data.sesiones_completadas) {
          console.log("▶ Sesiones completadas, regresando a rutina");
          // Guardar el mensaje para mostrarlo en la pantalla de rutina
          window.mensajeSerieCompletada = data.message;
          // Regresar a la vista de rutina
          cargarContenido('paciente', 'Rutina');
        } else {
          alert("Error: " + data.message);
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear la sesión.");
    }
  });
}
