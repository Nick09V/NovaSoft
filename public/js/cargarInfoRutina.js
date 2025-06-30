console.log("▶ Cargar info de rutina - Script iniciado");

document.addEventListener('DOMContentLoaded', () => {
  cargarInfoRutina();
});

async function cargarInfoRutina() {
  try {
    const res = await fetch('/NovaSoft/src/models/obtener_rutina.php', {
      credentials: 'include'
    });

    console.log("▶ Estado de respuesta HTTP:", res.status);

    if (!res.ok) {
      console.error("Error HTTP:", res.status);
      return;
    }

    const data = await res.json();
    console.log("▶ Datos recibidos de obtener_rutina.php:", data);

    if (data.status === "ok") {
      document.getElementById('nombreSerie').textContent = data.serie.serie_nombre;
      document.getElementById('nombreTerapia').textContent = data.serie.terapia_nombre;
      document.getElementById('sesionesRealizadas').textContent = data.serie.sesiones_realizadas;
      document.getElementById('numeroSesiones').textContent = data.serie.numero_sesiones;

      const btn = document.getElementById('btnIniciarSesion');
      if (btn) {
        btn.disabled = false;
        btn.addEventListener('click', () => {
          console.log("▶ Botón iniciar sesión clickeado");
          window.location.href = '/NovaSoft/public/pages/usuario/dolor_inicial.html';
        });
      }
    } else {
      console.warn("No hay serie asignada al paciente", data);
      document.getElementById('nombreSerie').textContent = "No asignada";
      document.getElementById('nombreTerapia').textContent = "-";
      document.getElementById('sesionesRealizadas').textContent = "0";
      document.getElementById('numeroSesiones').textContent = "0";

      document.getElementById('btnIniciarSesion').disabled = true;
      document.getElementById('mensajeErrorRutina').style.display = 'block';
    }
  } catch (e) {
    console.error("Error al obtener datos de la rutina:", e);
  }
}
