console.log('Iniciando script para mostrar datos del pacienteeeeeeeeeeeeeee');

(function () {
    const spanNombre = document.getElementById('pacienteNombre');
    const spanCorreo = document.getElementById('pacienteCorreo');
    const spanEdad = document.getElementById('pacienteEdad');
    const spanGenero = document.getElementById('pacienteGenero');
    const contenedor = document.getElementById('contenedorPaciente');

    console.log("Entro al script de carga de datos del paciente");
    //console.log(spanCorreo, spanEdad, spanGenero, contenedor);

    if (!contenedor) {
        console.error('Contenedor de datos del paciente no encontrado');
        return;
    }

    // Cargar los datos del paciente desde PHP
    fetch('/NovaSoft/src/models/obtener_paciente.php')
    
        .then(response => {
            if (!response.ok) throw new Error('No se pudo obtener los datos del paciente');
            return response.json();
        })
        .then(data => {
            if (data.status === 'ok' && data.paciente) {
                const paciente = data.paciente;
                console.log('Datos del paciente obtenidos:', paciente);

                spanNombre.textContent = paciente.nombre;
                spanCorreo.textContent = paciente.correo;
                spanEdad.textContent = paciente.telefono;
                spanGenero.textContent = paciente.direccion;
            } else {
                console.warn('Respuesta inesperada:', data);
                contenedor.innerHTML = '<p>No se pudo cargar la información del pacienteeeeee.</p>';
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos del paciente:', error);
            contenedor.innerHTML = '<p>Error al cargar los datos del paciente.</p>';
        });

})();
