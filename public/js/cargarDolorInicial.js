document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('dolorSelect');
  const btn = document.getElementById('btnConfirmarDolor');

  btn.addEventListener('click', async () => {
    const valorDolor = select.value;

    console.log("▶ Dolor inicial seleccionado:", valorDolor);

    try {
      const res = await fetch('/NovaSoft/src/models/crear_sesion.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          asignacion_id: window.asignacionId, // Ajusta esto si hace falta
          dolor_inicial: valorDolor
        })
      });

      const data = await res.json();
      console.log("▶ Respuesta crear_sesion.php:", data);

      if (data.status === "ok") {
        document.getElementById('mensajeExito').style.display = 'block';
        // opcional → redirigir al siguiente paso
      } else {
        alert("Error: " + data.message);
      }
    } catch (e) {
      console.error(e);
      alert("Error al crear la sesión.");
    }
  });
});
