document.addEventListener('DOMContentLoaded', function() {
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }
    //Envío del formulario de registro de paciente por Fetch API
    const form = document.getElementById('registro-paciente');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.telefono = data.telefono.replace(/[^0-9]/g, ''); // Asegurarse de que el teléfono solo contenga números

        try {
            const response = await fetch('/NovaSoft/src/models/registrar_paciente.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            console.log(result); 
            alert(result.message || 'Paciente registrado exitosamente');
            if (result.success) form.reset(); // Limpiar el formulario si el registro fue exitoso
        } catch (error) {
            alert('Error al registrar el paciente');
            console.error('Error:', error);
        }
        
    });
});
