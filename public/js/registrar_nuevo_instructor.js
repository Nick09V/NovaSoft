document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('form-register-instructor');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Intentando registrar instructor');
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const res = await fetch('../src/models/registrar_instructor.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            });
            
            if (!res.ok) throw new Error('Error al registrar instructor');
            
            const result = await res.json();
            alert(result.message || 'Instructor registrado exitosamente');
            form.reset(); // Limpiar el formulario
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error al registrar instructor');
        }
    });
});