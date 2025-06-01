document.addEventListener('DOMContentLoaded', () => {

    let terapiaSelect = document.getElementById('terapia');
    let formulario = document.getElementById('formularioNuevaSerieTerapeutica');
    let botonRegistrar = document.getElementById('botonNuevaSerie');

    formulario.addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar el envío del formulario por defecto

        let terapiaSeleccionada = terapiaSelect.value;
        if (terapiaSeleccionada === '') {
            alert('Por favor, selecciona una terapia.');
            return;
        }

        // Aquí puedes agregar la lógica para enviar los datos al servidor
        console.log('Terapia seleccionada:', terapiaSeleccionada);
        
        // Simulación de envío exitoso
        alert('Serie terapéutica registrada exitosamente para la terapia: ' + terapiaSeleccionada);
        
        // Limpiar el formulario después del registro
        formulario.reset();
    });



});


