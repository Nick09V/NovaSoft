console.log('Iniciando script para nueva serie terapéutica');
(function () {
    console.log('Iniciando script para nueva serie terapéutica');
    let Terapia = null;
    const terapiaSelect = document.getElementById('terapia');
    const formulario = document.getElementById('formularioNuevaSerieTerapeutica');
    const botonRegistrar = document.getElementById('botonNuevaSerie');
    const inputBotonSerie = document.getElementById('nombreSerieTerapeutica');
    let posturasSeries = document.getElementById('posturasSeries');
  const crearSerieSi = document.getElementById("crearSerieSi");
  const crearSerieNo = document.getElementById("crearSerieNo");
  const loginContainer = document.querySelector(".login-container");
  const crearNuevaSerie = document.getElementById("crearNuevaSerie");
  let detalleSerie = document.getElementById('detallesSerie');
    // para elementos de crear nueva serie
    let tipoTerapia = document.getElementById('tipoTerapia');
    terapiaTrabajada = "";
    let posturasCheckBox = document.getElementById('posturasCheckboxGroup');
    let posturasParaGuardar = [];
    let diccionarioPosturasGuardar = {};

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
        const selectedText = e.target.options[e.target.selectedIndex].text;
        console.log('Terapia seleccionada TEXTO:', selectedText);
        tipoTerapia.value = "";
        tipoTerapia.value = selectedText; // Asignar el valor de la terapia seleccionada al campo tipoTerapia
        cargarPosturasTerapia(e.target.value); // Cargar posturas de la terapia al cargar las opciones
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
            // Limpiar posturas previas
            posturasSeries.innerHTML = '<option value="">Seleccione una serie</option>';
            //posturasSeries.style.display = 'block'; // Mostrar el contenedor de posturas
            posturasSeries.disabled = false; // Habilitar el select si estaba deshabilitado
            cargarSeriesID(data);


        })
        .catch(error => {
            console.error('Error al cargar series:', error);
        });
}


function cargarPosturasTerapia(terapiaID) {
    console.log('Cargando posturas para terapia:', terapiaID);
    fetch('/NovaSoft/src/models/serie/cargarPosturasTerapia.php?id=' + terapiaID)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener posturas de terapia');
            return response.json();
        })
        .then(data => {
            console.log('Posturas obtenidas:', data);
            posturasCheckBox.innerHTML = ''; // Limpiar posturas previas
            posturasCheckBox.innerHTML = data.map(postura => `
                <label style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;">
                    <input type="checkbox" name="posturasSeleccionadas" value="${postura.id}">
                    <img src="${postura.foto_url}" alt="${postura.nombre_es}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 6px;">
                    <div>
                        <strong>${postura.nombre_es}</strong><br>
                        <em style="color: #666;">${postura.nombre_sanskrito || 'Sin nombre sánscrito'}</em>
                    </div>
                    <div>
                        <span><strong>Minutos:</strong></span>
                        <input type="number" name="duracionPostura_${postura.id}" min="0" style="width: 60px; margin-left: 8px;">
                        </input>
                    </div>
                </label>
            `).join('');

            // Delegación de eventos para los checkboxes
            posturasCheckBox.addEventListener('change', (e) => {
                if (e.target && e.target.name === "posturasSeleccionadas") {
                    console.log('Checkbox de posturas seleccionadas cambiado');
                    extraerDatosParaGuardarPosturas();
                }
            });
        })
        
            

        .catch(error => {
            console.error('Error al cargar posturas de terapia:', error);
        });
    
}





function extraerDatosParaGuardarPosturas() {
    console.log('Extrayendo datos para guardar posturas');
    posturasParaGuardar = [];
    const seleccionadas = Array.from(document.querySelectorAll('input[name="posturasSeleccionadas"]:checked'));
    seleccionadas.forEach(cb => {
        const id = cb.value;
        const inputMinutos = document.querySelector(`input[name="duracionPostura_${id}"]`);
        const minutos = inputMinutos ? inputMinutos.value : '';
        posturasParaGuardar.push({ id, minutos });
    });
    console.log('Posturas seleccionadas y minutos:', posturasParaGuardar);
}




function cargarPosturasSeries(serieID) {
    console.log('Cargando posturas para series');
    fetch('/NovaSoft/src/models/serie/cargarPosturas.php?id=' + serieID)
        .then(response => {
            if (!response.ok) throw new Error('Error al obtener posturas');
            return response.json();
        })
        .then(data => {
            console.log('Posturas obtenidas:', data);
            pos = `<ul>
        ${Array.isArray(data) && data.length > 0
            ? data.map(postura => `
            <li style="margin-bottom: 24px; display: flex; align-items: flex-start;">
                <img src="${postura.foto_url}" alt="${postura._es}">
                <div style="margin-left: 18px;">
                    <strong style="font-size:1.1em;">${postura.nombre_es}</strong><br>
                    <em style="color: #666;">${postura.nombre_sanskrito || 'Sin nombre sánscrito'}</em>
                    <br>
                    <span><strong>Beneficios:</strong> ${postura.beneficios || 'No especificados'}</span>
                    <br>
                    <span><strong>Duración:</strong> ${postura.duracion_min + " minutos" || 'No especificada'}</span>
                </div>
            </li>
        `).join('')
        : '<li><strong>No hay posturas registradas para esta serie.</strong></li>'
    }
</ul>`;

                detalleSerie.innerHTML += pos; // Agregar las posturas al detalle de la serie

            return data; // Retornar las posturas obtenidas
            // Aquí puedes procesar las posturas obtenidas
        })
        .catch(error => {
            console.error('Error al cargar posturas:', error);
        });
};




  // Agregar evento cuando se selecciona "Sí" para mover el contenedor y mostrar el formulario
  crearSerieSi.addEventListener("change", () => {
    loginContainer.classList.add("moverIzquierda"); // Mover el contenedor hacia la izquierda
    crearNuevaSerie.classList.add("mostrar"); // Mostrar el formulario para crear nueva serie
    posturasSeries.value = ""; // Limpiar el select de series
    posturasSeries.disabled = true; // Deshabilitar el select de series
    detalleSerie.innerHTML = ""; // Limpiar el contenido del detalle de la serie
    detalleSerie.style.display = "none"; // Ocultar el detalle de la serie

  });

  // Agregar evento cuando se selecciona "No" para regresar el contenedor y ocultar el formulario
  crearSerieNo.addEventListener("change", () => {
    loginContainer.classList.remove("moverIzquierda"); // Regresar el contenedor a su posición original
    crearNuevaSerie.classList.remove("mostrar"); // Ocultar el formulario para crear nueva serie
    posturasSeries.disabled = false; // Habilitar el select de series
    //detalleSerie.style.display = "block"; // Mostrar el detalle de la serie
    
  });


    let diccionarioSeries = {};

    // Función para cargar series por ID
    function cargarSeriesID(series) {
        console.log('Cargando series por ID:', series);
        //posturasSeries.innerHTML = '<option value="">Seleccione una serie</option>';
        series.forEach(serie => {
            diccionarioSeries[serie.id] = serie; // Guardar la serie en el diccionario
            const option = document.createElement('option');
            option.value = serie.id;
            option.textContent = serie.nombre;
            posturasSeries.appendChild(option);
        });
    }

    // Evento para manejar el cambio de serie seleccionada
    posturasSeries.addEventListener('change', (e) => {
        const selectedSerieID = e.target.value;
        console.log('Serie seleccionada:', selectedSerieID);
        crearSerieNo.checked = true; //
        crearSerieSi.checked = false; // Asegurarse de que "Sí" esté desmarcado 
        detalleSerie.innerHTML = ""; // Limpiar el contenido del detalle de la serie
        //detalleSerie.style.display = "none"; // Ocultar el detalle de la serie si no hay selección
            
        

        
        
        if (selectedSerieID) {
            const selectedSerie = diccionarioSeries[selectedSerieID];
            console.log('Detalles de la serie seleccionada:', selectedSerie);
            detalleSerie.style.display = "block"; // Mostrar el detalle de la serie
            detalleSerie.innerHTML = `
                <h3>Detalles de la Serie</h3>
                <p><strong>Nombre:</strong> ${selectedSerie.nombre}</p>
                <p><strong>Número de sesiones:</strong> ${selectedSerie.numero_sesiones || 'No disponible'}</p>
                <p><strong>Posturas:</strong></p>               
            `;

            posturasDeLaSerie = cargarPosturasSeries(selectedSerieID); //arreglo de diccionario de posturas de la serie seleccionada
            console.log('Posturas de la serie seleccionada:', posturasDeLaSerie);
        }


        
    }); 


    





  

})();





