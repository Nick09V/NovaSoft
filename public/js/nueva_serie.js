(function () {
    const terapiaSelect = document.getElementById('terapia');
    const formulario = document.getElementById('formularioNuevaSerieTerapeutica');
    const botonRegistrar = document.getElementById('botonNuevaSerie');
    const inputBotonSerie = document.getElementById('nombreSerieTerapeutica');

    
    if (terapiaSelect) {
        fetch('/NovaSoft/src/models/terapias.php')
            .then(response => {
                if (!response.ok) throw new Error('Error al obtener terapias');
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    terapiaSelect.innerHTML = '<option value="">Seleccione una terapia</option>';
                    data.forEach(terapia => {
                        const option = document.createElement('option');
                        option.value = terapia.id || terapia.nombre;
                        option.textContent = terapia.nombre;
                        terapiaSelect.appendChild(option);
                    });
                } else {
                    console.error('Formato de datos inesperado:', data);
                }
            })
            .catch(error => {
                console.error('Error al cargar terapias:', error);
            });
    }


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




