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
  let cargarPaceintesBoton = document.getElementById('cargarPacientesBoton');
    // para elementos de crear nueva serie
    let tipoTerapia = document.getElementById('tipoTerapia');
    terapiaTrabajada = "";
    let posturasCheckBox = document.getElementById('posturasCheckboxGroup');
    let crearNuevaSerieBoton = document.getElementById('botonCrearNuevaSerie');
    let usuariosInstructor = document.getElementById('usuariosSerie');
    let nuevaSerieNombre = document.getElementById('nuevaSerie');
    let usuariosAsociarSerie = document.getElementById('usuariosSeriePrimero');
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

let terapiaIDSeleccionada = null;


    terapiaSelect.addEventListener('change', (e) => {
        terapiaIDSeleccionada = e.target.value;
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
                mostrarAdvertencia(result.error);
            } else if (result.ok) {
                mostrarAdvertencia(result.message || 'Serie registrada exitosamente');
                console.log('Serie registrada exitosamente');
                formulario.reset();
            } else {
                mostrarAdvertencia('Respuesta inesperada del servidor');
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            mostrarAdvertencia('Ocurrió un error al registrar la serie terapéutica. Inténtalo de nuevo.');
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
                        <input type="number" name="duracionPostura_${postura.id}" min="0" style="width: 60px; margin-left: 8px;" disabled>
                    </div>
                </label>
            `).join('');

            // Delegación de eventos para los checkboxes y los inputs de minutos
            posturasCheckBox.addEventListener('change', (e) => {
                if (e.target && e.target.name === "posturasSeleccionadas") {
                    const id = e.target.value;
                    const inputMinutos = document.querySelector(`input[name="duracionPostura_${id}"]`);
                    if (inputMinutos) {
                        inputMinutos.disabled = !e.target.checked;
                        if (!e.target.checked) inputMinutos.value = '';
                    }
                    console.log('Checkbox de posturas seleccionadas cambiado');
                    extraerDatosParaGuardarPosturas();
                }
                // Si el cambio es en un input de minutos
                if (e.target && e.target.name && e.target.name.startsWith('duracionPostura_')) {
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

    cargarUsuarios(); // Cargar usuarios al seleccionar "Sí" para crear una nueva serie

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


    let numeroSesiones = 0;
    // Evento para el numero de sesiones
    const numeroSesionesInput = document.getElementById('numeroSesiones');
    if (numeroSesionesInput) {
        numeroSesionesInput.addEventListener('keyup', (e) => {
            console.log('Número de sesiones cambiado:', e.target.value);
            numeroSesiones  = parseInt(e.target.value, 10) || 0; // Convertir a número o 0 si no es válido
        });
    }





    function cargarUsuarios() {
        console.log('Cargando usuarios para la serie terapéutica' + tipoTerapia.value);
        fetch('/NovaSoft/src/models/serie/cargarUsuarios.php')
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener usuarios');
                return response.json();
            })
            .then(data => {
                console.log('Pacientes obtenidos:', data);
                
                usuariosInstructor.innerHTML = '<option value="">Seleccione un paciente</option>'; // Limpiar opciones previas
                data.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = `${usuario.nombre} ${usuario.apellido}`;
                    usuariosInstructor.appendChild(option);
                });

            })
            .catch(error => {
                console.error('Error al cargar usuarios:', error);
            });
    }

    let usuarioSeleccionado = null;

    usuariosInstructor.addEventListener('change', (e) => {
        console.log('Usuario seleccionado:', e.target.value);
        usuarioSeleccionado = e.target.value; // Guardar el ID del usuario seleccionado
        // Aquí puedes manejar la lógica adicional al seleccionar un usuario
    });


    let nombreSerieSubir = null;
    nuevaSerieNombre.addEventListener('keyup', (e) => {
        console.log('Nombre de la nueva serie:', e.target.value);
        nombreSerieSubir = e.target.value; // Guardar el nombre de la nueva serie
    }); 



    if (cargarPaceintesBoton) {
        cargarPaceintesBoton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Cargando usuarios para el index');
            cargarUsuariosIndex(); // Cargar usuarios al hacer clic en el botón
        });
    }



    function cargarUsuariosIndex() {
        console.log('Cargando usuarios para el index');
        fetch('/NovaSoft/src/models/serie/cargarUsuarios.php')
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener usuarios');
                return response.json();
            })
            .then(data => {
                console.log('Usuarios obtenidos:', data);
                usuariosAsociarSerie.innerHTML = '<option value="">Seleccione un usuario</option>'; // Limpiar opciones previas
                data.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = `${usuario.nombre} ${usuario.apellido}`;
                    usuariosAsociarSerie.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al cargar usuarios:', error);
            });
    }

    usuariosAsociarSerie.addEventListener('change', (e) => {
        console.log('Usuario seleccionado para asociar serie:', e.target.value);
        usuarioSeleccionadoIndex = e.target.value; // Guardar el ID del usuario seleccionado
        // Aquí puedes manejar la lógica adicional al seleccionar un usuario
    });


    crearNuevaSerieBoton.addEventListener('click', (e) => {
        console.log('Botón de registrar serie terapéutica presionado');
        e.preventDefault();
        // Validaciones antes de enviar
        if (!nombreSerieSubir || nombreSerieSubir.trim() === "") {
            mostrarAdvertencia("Por favor, ingrese el nombre de la serie.");
            return;
        }
        if (!posturasParaGuardar || posturasParaGuardar.length === 0) {
            mostrarAdvertencia("Debe seleccionar al menos una postura para la serie.");
            return;
        }
        // Validar que cada postura tenga minutos asignados
        for (let postura of posturasParaGuardar) {
            if (!postura.minutos || postura.minutos.trim() === "" || isNaN(postura.minutos) || Number(postura.minutos) <= 0) {
                mostrarAdvertencia("Debe ingresar los minutos para cada postura seleccionada.");
                return;
            }
        }
        if (!numeroSesiones || isNaN(numeroSesiones) || numeroSesiones <= 0) {
            mostrarAdvertencia("Por favor, ingrese el número de sesiones (mayor a 0).");
            return;
        }
        if (!tipoTerapia.value || tipoTerapia.value.trim() === "") {
            mostrarAdvertencia("Por favor, seleccione el tipo de terapia.");
            return;
        }
        if (!terapiaIDSeleccionada || terapiaIDSeleccionada.trim() === "") {
            mostrarAdvertencia("Por favor, seleccione la terapia.");
            return;
        }
        if (!usuarioSeleccionado || usuarioSeleccionado.trim() === "") {
            mostrarAdvertencia("Por favor, seleccione un paciente valido.");
            return;
        }

        console.log('Nombre de la nueva serie:', nombreSerieSubir);
        console.log('Datos para guardar posturas:', posturasParaGuardar);
        console.log('Número de sesiones:', numeroSesiones);
        console.log('Tipo de terapia:', tipoTerapia.value);
        console.log('terapia ID:', terapiaIDSeleccionada);
        console.log('Usuario seleccionado:', usuarioSeleccionado);

        fetch('/NovaSoft/src/models/serie/crearSerie.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                nombreSerie: nombreSerieSubir,
                posturas: posturasParaGuardar,
                numeroSesiones: numeroSesiones,
                tipoTerapia: tipoTerapia.value,
                terapiaID: terapiaIDSeleccionada,
                usuarioID: usuarioSeleccionado
            })
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al registrar la serie terapéutica');
            return response.json();
        })
        .then(data => {
            if (data.error) {
                mostrarAdvertencia(data.error);
            } else if (data.ok) {
                mostrarAdvertencia(data.message || 'Serie terapéutica registrada exitosamente');
                console.log('Serie terapéutica registrada exitosamente');
                formulario.reset(); // Limpiar el formulario
                posturasCheckBox.innerHTML = ''; // Limpiar las posturas
                detalleSerie.innerHTML = ''; // Limpiar el detalle de la serie
                posturasParaGuardar = []; // Reiniciar el arreglo de posturas para guardar
                crearSerieNo.checked = true; // Marcar el botón de "No" como seleccionado
                crearSerieSi.checked = false;
            } else {
                mostrarAdvertencia('Respuesta inesperada del servidor');
            }
        })

    });



    botonRegistrar.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Botón de registrar serie terapéutica presionado');
        try {
            console.log("selectedSerieID", selectedSerieID);
        }catch (error) {
            console.error('Error al acceder a selectedSerieID:', error);
            mostrarAdvertencia('Debe seleccionar una serie antes de registrar.');
            return;
        }
        //usuarioSeleccionadoIndex
        console.log('Usuario seleccionado para asociar serie:', usuarioSeleccionadoIndex);
    });



    // --- INICIO: Sistema de advertencias bonitas ---
    function crearContenedorAdvertencias() {
        if (!document.getElementById('contenedorAdvertencias')) {
            const div = document.createElement('div');
            div.id = 'contenedorAdvertencias';
            div.style.position = 'fixed';
            div.style.top = '30px';
            div.style.left = '50%';
            div.style.transform = 'translateX(-50%)';
            div.style.zIndex = '9999';
            div.style.display = 'none';
            document.body.appendChild(div);
        }
    }

    function mostrarAdvertencia(mensaje) {
        crearContenedorAdvertencias();
        const contenedor = document.getElementById('contenedorAdvertencias');
        contenedor.innerHTML = `
            <div style="
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeeba;
                border-radius: 6px;
                padding: 16px 32px;
                font-size: 1.1em;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                margin-bottom: 10px;
                min-width: 280px;
                text-align: center;
                
                
                
                ">
                <strong>Advertencia:</strong> ${mensaje}
            </div>
        `;
        contenedor.style.display = 'block';
        setTimeout(() => {
            contenedor.style.display = 'none';
        }, 3500);
    }
    // --- FIN: Sistema de advertencias bonitas ---



})();
