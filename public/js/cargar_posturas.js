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
        <img src="${postura.imagen_url}" alt="Postura">
        <h3>${postura.nombre_es}</h3>
        <p><strong>Beneficios:</strong> ${postura.beneficios}</p>
        <p><strong>Instrucciones:</strong> ${postura.instrucciones}</p>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    contenedor.innerHTML = `<p style="color:red">Error: ${error.message}</p>`;
  }
});
