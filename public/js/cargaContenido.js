console.log('Iniciando script para mostrar datos del pacienteeeeeeeeeeeeeee');

// Declarar variables en el ámbito global del script
let spanNombre, spanApellido, spanCorreo, spanDireccion, spanTelefono, spanCiudad, contenedor;

(function () {


    spanNombre = document.getElementById('pacienteNombre');
    spanCorreo = document.getElementById('pacienteCorreo');
    spanApellido = document.getElementById('pacienteApellido');
    spanCiudad = document.getElementById('pacienteCiudad');
    spanDireccion = document.getElementById('pacienteDireccion');
    spanTelefono = document.getElementById('pacienteTelefono');
    contenedor = document.getElementById('contenedorPaciente');

    console.log("Entro al script de carga de datos del paciente");

    if (!contenedor) {
        console.error('Contenedor de datos del paciente no encontrado');
        return;
    }

    cargarDatosPaciente();
    cargarDatosInstructor();
})();

function cargarDatosPaciente() {
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
                spanTelefono.textContent = paciente.telefono;
                spanDireccion.textContent = paciente.direccion;
                spanCiudad.textContent = paciente.ciudad;
                spanApellido.textContent = paciente.apellido;
            } else {
                console.warn('Respuesta inesperada:', data);
                contenedor.innerHTML = '<p>No se pudo cargar la información del paciente.</p>';
            }
        })
        .catch(error => {
            console.error('Error al obtener los datos del paciente:', error);
            contenedor.innerHTML = '<p>Error al cargar los datos del paciente.</p>';
        });
}

function cargarDatosInstructor() {
    const spanInstructorNombre = document.getElementById('instructorNombre');
    const spanInstructorApellido = document.getElementById('instructorApellido');
    const spanInstructorCorreo = document.getElementById('instructorCorreo');
    const spanInstructorEspecialidad = document.getElementById('instructorEspecialidad');
    const linkInstructorUrl = document.getElementById('instructorUrl');

    fetch('/NovaSoft/src/models/obtener_infoInstructor.php')
        .then(res => {
            if (!res.ok) throw new Error('Error en la respuesta');
            return res.json();
        })
        .then(data => {
            if (data.status === 'ok') {
                const d = data.datos;

                spanInstructorNombre.textContent = d.instructor_nombre;
                spanInstructorApellido.textContent = d.instructor_apellido;
                spanInstructorCorreo.textContent = d.instructor_correo;
                spanInstructorEspecialidad.textContent = d.instructor_especialidad;
                linkInstructorUrl.href = d.instructor_url;
                linkInstructorUrl.textContent = d.instructor_url;

            } else {
                console.warn('Error en los datos:', data.message);
            }
        })
        .catch(error => {
            console.error('Error cargando datos:', error);
        });
}
