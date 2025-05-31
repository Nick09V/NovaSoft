document.addEventListener('DOMContentLoaded', async () => {
  const contenedor = document.getElementById('contenedor-posturas');

  try {
    const res = await fetch('../../../src/models/posturasapi.php');
    if (!res.ok) throw new Error('No se pudieron cargar las posturas');

    const posturas = await res.json();

    posturas.forEach(postura => {
      const div = document.createElement('div');
      div.classList.add('postura');
      div.innerHTML = `
        <a href="detalle.html?id=${postura.id}" style="text-decoration: none; color: inherit;">
          <img src="${postura.foto_url}" alt="${postura.nombre_es}">
          <h3>${postura.nombre_es}</h3>
          <p>${postura.nombre_sanskrito}</p>
        </a>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    contenedor.innerHTML = `<p style="color:red">${error.message}</p>`;
  }
});
