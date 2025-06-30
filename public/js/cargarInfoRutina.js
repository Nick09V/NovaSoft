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
      console.log("▶ Nombre serie:", data.serie.serie_nombre);
      console.log("▶ Nombre terapia:", data.serie.terapia_nombre);
      console.log("▶ Sesiones realizadas:", data.serie.sesiones_realizadas);
      console.log("▶ Número sesiones:", data.serie.numero_sesiones);
      
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
      if (btn) {
        console.log("▶ Habilitando botón...");
        btn.disabled = false;
        btn.addEventListener('click', () => {
          console.log("▶ Botón iniciar sesión clickeado");
          window.location.href = '/NovaSoft/public/pages/usuario/dolor_inicial.html';
        });
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
