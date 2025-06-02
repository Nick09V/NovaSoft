(function () {
    const terapiaSelect = document.getElementById('terapia');
    const formulario = document.getElementById('formularioNuevaSerieTerapeutica');
    const botonRegistrar = document.getElementById('botonNuevaSerie');
    const inputBotonSerie = document.getElementById('nombreSerieTerapeutica');

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



})();




