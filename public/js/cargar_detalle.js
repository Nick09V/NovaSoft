document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(window.location.search).get('id');
  const contenedor = document.getElementById('detalle-postura');

  try {
    const res = await fetch(`../../../src/models/posturasapi.php?id=${id}`);
    if (!res.ok) throw new Error('No se pudo cargar el detalle');

    const postura = await res.json();

    // Convertir link de YouTube a embed si es necesario
    let embedUrl = postura.video_url;
    if (embedUrl.includes("watch?v=")) {
      embedUrl = embedUrl.replace("watch?v=", "embed/");
    }

    document.getElementById('titulo').textContent = `${postura.nombre_es} (${postura.nombre_sanskrito})`;

    contenedor.innerHTML = `
      <img src="${postura.foto_url}" alt="${postura.nombre_es}">
      <h3>${postura.nombre_es}</h3>
      <p><strong>Nombre sánscrito:</strong> ${postura.nombre_sanskrito}</p>
      <p><strong>Beneficios:</strong> ${postura.beneficios}</p>
      <p><strong>Instrucciones:</strong> ${postura.instrucciones}</p>
      <p><strong>Modificaciones:</strong> ${postura.modificaciones || 'Ninguna'}</p>

      <h4 style="margin-top: 1.5em; color: #1f3dbf;"> Video explicativo</h4>
      <iframe width="100%" height="315"
        src="${embedUrl}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
      <a href="posturas.html" class="btn-volver">Volver al listado</a>
    `;
  } catch (e) {
    contenedor.innerHTML = `<p style="color:red">${e.message}</p>`;
  }
});
