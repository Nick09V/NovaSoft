document.addEventListener("DOMContentLoaded", function () {
  fetch("../../src/controllers/rutina.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }

      // Llenar los datos en la vista
      document.getElementById("terapia_nombre").textContent =
        "Terapia: " + data.terapia_nombre;
      document.getElementById("serie_nombre").textContent = data.serie_nombre;
      document.getElementById("sesiones_realizadas").textContent =
        data.sesiones_realizadas;
      document.getElementById("numero_sesiones").textContent =
        data.numero_sesiones;

      // Activar botón
      const btn = document.getElementById("btn-iniciar");
      btn.disabled = false;

      // Guardar serie_id para el próximo paso
      btn.addEventListener("click", function () {
        window.location.href =
          "dolor_inicial.html?serie_id=" + data.serie_id;
      });
    })
    .catch((error) => {
      console.error("Error al obtener datos:", error);
      alert("Ocurrió un error al cargar la rutina.");
    });
});
