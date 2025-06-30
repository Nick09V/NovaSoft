document.addEventListener("DOMContentLoaded", function () {
  // 1. Tomar serie_id de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const serieId = urlParams.get("serie_id");

  if (!serieId) {
    alert("No se especificó ninguna serie.");
    window.location.href = "rutina.html";
    return;
  }

  // 2. Verificar que la serie está asignada al paciente
  fetch(`/NovaSoft/src/models/dolor_inicio.php?serie_id=${serieId}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        alert(data.error);
        window.location.href = "rutina.html";
        return;
      }

      // (Opcional) podrías mostrar serie y terapia aquí si lo devuelves en PHP
      document.getElementById("serie_nombre").textContent = serieId;
      document.getElementById("terapia_nombre").textContent = "…"; // Podrías llenar esto con más info si devuelves en PHP

      // 3. Al enviar el formulario:
      document
        .getElementById("form-dolor")
        .addEventListener("submit", function (e) {
          e.preventDefault();

          const dolor = document.getElementById("dolor_inicio").value;
          if (!dolor) {
            alert("Selecciona un nivel de dolor.");
            return;
          }

          // 4. Hacer POST a crear_sesion.php
          fetch("../../src/controllers/crear_sesion.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              serie_id: serieId,
              dolor_inicio: dolor,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                alert("Error: " + data.error);
                return;
              }
              // Redirigir a ejecutar_serie.html con el id_sesion
              window.location.href =
                `ejecutar_serie.html?sesion=${data.id_sesion}`;
            })
            .catch((err) => {
              console.error(err);
              alert("Error al crear la sesión.");
            });
        });
    })
    .catch((err) => {
      console.error(err);
      alert("Error al consultar la serie.");
      window.location.href = "rutina.html";
    });
});
