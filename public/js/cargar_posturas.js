document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('contenedor-posturas');
  const filtroSintoma = document.getElementById('filtro-sintoma');
  const inputBusqueda = document.getElementById('busqueda');

  let todasLasPosturas = [];

  const cargarPosturas = async (terapiaId = '') => {
    try {
      // Cambiar rutas relativas por rutas absolutas
      const url = terapiaId
        ? `/NovaSoft/src/models/posturas.php?terapia=${terapiaId}`
        : '/NovaSoft/src/models/posturas.php';

      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudieron cargar las posturas');
      todasLasPosturas = await res.json();
      mostrarPosturas(todasLasPosturas);
    } catch (err) {
      contenedor.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
    }
  };

  const mostrarPosturas = (lista) => {
    contenedor.innerHTML = '';
    lista.forEach(postura => {
      const div = document.createElement('div');
      div.classList.add('postura');
      div.innerHTML = `
        <a href="/NovaSoft/public/pages/posturas/detalle.html?id=${postura.id}" style="text-decoration: none; color: inherit;">
          <img src="${postura.foto_url}" alt="${postura.nombre_es}">
          <h3>${postura.nombre_es}</h3>
          <p><em>${postura.nombre_sanskrito}</em></p>
        </a>
      `;
      contenedor.appendChild(div);
    });
  };

  filtroSintoma.addEventListener('change', () => {
    const val = filtroSintoma.value;
    cargarPosturas(val);
  });

  inputBusqueda.addEventListener('input', () => {
    const texto = inputBusqueda.value.toLowerCase();
    const filtradas = todasLasPosturas.filter(p => p.nombre_es.toLowerCase().includes(texto));
    mostrarPosturas(filtradas);
  });

  cargarPosturas(); // inicial
});