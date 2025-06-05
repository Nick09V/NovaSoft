(function () {
    let Terapia = null;
    const terapiaSelect = document.getElementById('terapia');
    const formulario = document.getElementById('formularioNuevaSerieTerapeutica');
    const botonRegistrar = document.getElementById('botonNuevaSerie');
    const inputBotonSerie = document.getElementById('nombreSerieTerapeutica');
    let posturasSeries = document.getElementById('serieExistente');

    
    if (terapiaSelect) {
        fetch('/NovaSoft/src/models/terapia.php')
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener terapias');
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    console.log('Cargando terapias:', data);
                    // Limpiar opciones previas y agregar opción por defecto
                    terapiaSelect.innerHTML = '<option value="">Seleccione una terapia</option>';
                    data.forEach(terapia => {
                        const option = document.createElement('option');
                        option.value = terapia.id;
                        option.textContent = terapia.nombre;
                        terapiaSelect.appendChild(option);
                    });
                } else {
                    console.error('Formato de datos inesperado no es un array:', data);
                }
            })
            .catch(error => {
                console.error('Error al cargar terapias:', error);
            });
    }


    terapiaSelect.addEventListener('change', (e) => {
        console.log('Terapia seleccionada:', e.target.value);
        funcionCargarSeries(e.target.value);

    });


    if (inputBotonSerie) {
        inputBotonSerie.addEventListener('keyup', () => {
            console.log('Ingreso:', inputBotonSerie.value);
        });
    }   

    if (formulario) {
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulario enviado para nueva serie terapéutica');
        const formData = new FormData(formulario);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/NovaSoft/src/models/serieTerapeutica.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            });

            if (!res.ok) throw new Error('Error al registrar serie');

            const result = await res.json();

            if (result.error) {
                alert(result.error);
            } else if (result.ok) {
                alert(result.message || 'Serie registrada exitosamente');
                console.log('Serie registrada exitosamente');
                formulario.reset();
            } else {
                alert('Respuesta inesperada del servidor');
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Ocurrió un error al registrar la serie terapéutica. Inténtalo de nuevo.');
        }
    });
}



function funcionCargarSeries(valor) {
    console.log('Cargando series para terapia:', valor);
    fetch('/NovaSoft/src/models/serie/cargarSeries.php?id=' + valor)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener series');
            return response.json();
        })
        .then(data => {
            console.log('Series obtenidas:', data);
            //posturasSeries.innerHTML = ''; // Limpiar posturas previas
            //posturasSeries.style.display = 'block'; // Mostrar el contenedor de posturas
            //cargarPosturasSeries(data.id);


        })
        .catch(error => {
            console.error('Error al cargar series:', error);
        });
}





function cargarPosturasSeries(serieID) {
    console.log('Cargando posturas para series');
    fetch('/NovaSoft/src/models/postura/cargarPosturas.php')
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener posturas');
            return response.json();
        })
        .then(data => {
            console.log('Posturas obtenidas:', data);
            // Aquí puedes procesar las posturas obtenidas
        })
        .catch(error => {
            console.error('Error al cargar posturas:', error);
        });
};


  const crearSerieSi = document.getElementById("crearSerieSi");
  const crearSerieNo = document.getElementById("crearSerieNo");
  const loginContainer = document.querySelector(".login-container");
  const crearNuevaSerie = document.getElementById("crearNuevaSerie");

  // Agregar evento cuando se selecciona "Sí" para mover el contenedor y mostrar el formulario
  crearSerieSi.addEventListener("change", () => {
    loginContainer.classList.add("moverIzquierda"); // Mover el contenedor hacia la izquierda
    crearNuevaSerie.classList.add("mostrar"); // Mostrar el formulario para crear nueva serie
  });

  // Agregar evento cuando se selecciona "No" para regresar el contenedor y ocultar el formulario
  crearSerieNo.addEventListener("change", () => {
    loginContainer.classList.remove("moverIzquierda"); // Regresar el contenedor a su posición original
    crearNuevaSerie.classList.remove("mostrar"); // Ocultar el formulario para crear nueva serie
  });

})();





