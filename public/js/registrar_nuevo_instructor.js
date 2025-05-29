document.addEventListener('DOMContentLoaded', () => {
    let botonRegister = document.getElementById('buttonRegisterCrearInstructor');
        
    let texto1 = "";
    let texto2 = "";
    let texto3 = "";
    let texto4 = "";
    // Escuchar contraseña del formulario de login
    let nombre= document.getElementById('nombre');
    let email = document.getElementById('correo');
    let CamposLlenos = false;

    let buttonContraseña = document.getElementById('contrasenaDos');
    let buttonContrasena1 = document.getElementById('contrasena');
    
    //console.log('Botón de contraseña:', buttonContraseña);
    //console.log('Texto de la contraseña 1:', textoContrasena1);


    buttonContraseña.addEventListener('keyup', (e) => {
        console.log('Tecla presionada:', e.key);
        texto2 = buttonContraseña.value;
        console.log('Texto de la contraseña 2:', texto2);
        if (texto2 == texto1) {
            validarCamposLlenos(); // Llamar a la función para validar campos llenos
            console.log('La contraseña es correcta');
            buttonContraseña.textContent = 'Contraseña correcta';
            buttonContraseña.style.color = 'green';
            if (CamposLlenos) {
                botonRegister.disabled = false; // Deshabilitar el botón al cargar la página
                botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales
            }
      
        }else{
            CamposLlenos = false;
            console.log('La contraseña es incorrecta');
            buttonContraseña.textContent = 'Contraseña incorrecta';
            buttonContraseña.style.color = 'red';
            botonRegister.disabled = true; // Deshabilitar el botón al cargar la página
            botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales
        }
        
    });



    buttonContrasena1.addEventListener('keyup', (e) => {
        console.log('Tecla presionada:', e.key);
        texto4 = buttonContraseña.value;
        texto3 = buttonContrasena1.value;
        console.log('Texto de la contraseña 2:', texto4);
        if (texto3 == texto4) {
            validarCamposLlenos(); // Llamar a la función para validar campos llenos
            console.log('La contraseña es correcta');
            buttonContraseña.textContent = 'Contraseña correcta';
            buttonContraseña.style.color = 'green';
            if (CamposLlenos) {
                botonRegister.disabled = false; // Deshabilitar el botón al cargar la página
                botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales
            }
      
        }else{
            CamposLlenos = false;
            console.log('La contraseña es incorrecta');
            buttonContraseña.textContent = 'Contraseña incorrecta';
            buttonContraseña.style.color = 'red';
            botonRegister.disabled = true; // Deshabilitar el botón al cargar la página
            botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales
        }
        
    });





    function validarCamposLlenos() {
        if (nombre.value === "" || email.value === "" || texto1 === "" || texto2 === "") {
            CamposLlenos = false;
            console.log('Campos no llenos');
            botonRegister.disabled = true; // Deshabilitar el botón al cargar la página
            botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales
        } else {
            CamposLlenos = true;
            console.log('Campos llenos');
            botonRegister.disabled = false; // Habilitar el botón al cargar la página
            botonRegister.classList.remove('disabled'); // Quitar clase CSS para estilos visuales
        }
    }

    nombre.addEventListener('keyup', (e) => {
            validarCamposLlenos(); // Llamar a la función para validar campos llenos
    });

    email.addEventListener('keyup', (e) => {
        validarCamposLlenos(); // Llamar a la función para validar campos llenos
        
    });

    

    buttonContrasena1.addEventListener('keyup', (e) => {
        texto1 = buttonContrasena1.value;
        console.log('Texto de la contraseña 1:', texto1);

    });







    



    // Escuchar submit del formulario de registro de instructor
    let form = document.getElementById('form-register-instructor');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Intentando registrar instructor');
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        

        try {
            const res = await fetch('/NovaSoft/src/models/registrar_instructor.php', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'}
            });
            
            if (!res.ok) throw new Error('Error al registrar instructor');
                
            const result = await res.json();
            
            if (result.error) {
                alert(result.error);
            } else if (result.ok) {
                alert(result.message || 'Instructor registrado exitosamente');
                console.log('Instructor registrado exitosamente');
                
                // Redirigir a la página de inicio o a otra página
                window.location.href = '/NovaSoft/public/index.html';
                form.reset(); // Limpiar el formulario
            } else {
                alert('Respuesta inesperada del servidor');
            }

            form.reset(); // Limpiar el formulario
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error al registrar instructor');
        }
    });
});