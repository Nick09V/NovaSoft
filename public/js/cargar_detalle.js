document.addEventListener('DOMContentLoaded', async () => {
  const id = new URLSearchParams(window.location.search).get('id');
  const contenedor = document.getElementById('detalle-postura');

  try {
    const res = await fetch(`../../../src/models/posturasapi.php?id=${id}`);
    if (!res.ok) throw new Error('No se pudo cargar el detalle');

    const postura = await res.json();

    document.getElementById('titulo').textContent = `${postura.nombre_es} (${postura.nombre_sanskrito})`;

    contenedor.innerHTML = `
      <img src="${postura.foto_url}" alt="${postura.nombre_es}">
      <h3>${postura.nombre_es}</h3>
      <p><strong>Nombre sánscrito:</strong> ${postura.nombre_sanskrito}</p>
      <p><strong>Beneficios:</strong> ${postura.beneficios}</p>
      <p><strong>Instrucciones:</strong> ${postura.instrucciones}</p>
      <p><strong>Modificaciones:</strong> ${postura.modificaciones || 'Ninguna'}</p>
      <a href="posturas.html" class="btn-volver"> Volver al Listado</a>
    `;
  } catch (e) {
    contenedor.innerHTML = `<p style="color:red">${e.message}</p>`;
  }
});
