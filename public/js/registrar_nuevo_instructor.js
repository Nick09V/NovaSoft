document.addEventListener('DOMContentLoaded', () => {
    const botonRegister = document.getElementById('buttonRegisterCrearInstructor');
    botonRegister.disabled = true;
    botonRegister.classList.add('disabled');

    const nombre = document.getElementById('nombre');
    const email = document.getElementById('correo');
    const contrasena = document.getElementById('contrasena');
    const contrasenaDos = document.getElementById('contrasenaDos');

    let CamposLlenos = false;

    function validarCamposLlenos() {
        const texto1 = contrasena.value;
        const texto2 = contrasenaDos.value;

        if (nombre.value === "" || email.value === "" || texto1 === "" || texto2 === "") {
            CamposLlenos = false;
            botonRegister.disabled = true;
            botonRegister.classList.add('disabled');
        } else if (texto1 === texto2) {
            CamposLlenos = true;
            botonRegister.disabled = false;
            botonRegister.classList.remove('disabled');
            contrasenaDos.style.color = 'green';
            contrasenaDos.placeholder = 'Contraseña correcta';
        } else {
            CamposLlenos = false;
            botonRegister.disabled = true;
            botonRegister.classList.add('disabled');
            contrasenaDos.style.color = 'red';
            contrasenaDos.placeholder = 'Contraseñas no coinciden';
        }
    }

    // Validaciones en tiempo real
    nombre.addEventListener('keyup', validarCamposLlenos);
    email.addEventListener('keyup', validarCamposLlenos);
    contrasena.addEventListener('keyup', validarCamposLlenos);
    contrasenaDos.addEventListener('keyup', validarCamposLlenos);

    // Envío del formulario
    const form = document.getElementById('form-register-instructor');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/NovaSoft/src/models/registrar_instructor.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) throw new Error('Error al registrar instructor');
            const result = await res.json();

            if (result.error) {
                alert(result.error);
            } else if (result.ok) {
                alert(result.message || 'Instructor registrado exitosamente');
                window.location.href = '/NovaSoft/public/index.html';
            } else {
                alert('Respuesta inesperada del servidor');
            }

            form.reset();
            botonRegister.disabled = true;
            botonRegister.classList.add('disabled');
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error al registrar instructor');
        }
    });
});
