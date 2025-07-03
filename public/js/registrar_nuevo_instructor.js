document.addEventListener('DOMContentLoaded', () => {
    let botonRegister = document.getElementById('buttonRegisterCrearInstructor');
    
    botonRegister.disabled = true; // Deshabilitar el botón al cargar la página
    botonRegister.classList.add('disabled'); // Agregar clase CSS para estilos visuales


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
        try {
            const res = await fetch('/NovaSoft/src/models/registrar_instructor.php', {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Error al registrar instructor');
            const result = await res.json();
            if (result.error) {
                mostrarAdvertencia(result.error);
            } else if (result.ok) {
                mostrarAdvertencia(result.message || 'Instructor registrado exitosamente');
                console.log('Instructor registrado exitosamente');
                window.location.href = '/NovaSoft/public/index.html';
            } else {
                mostrarAdvertencia('Respuesta inesperada del servidor');
            }
            form.reset(); // Limpiar el formulario
        } catch (err) {
            console.error(err);
            mostrarAdvertencia(err.message || 'Error al registrar instructor');
        }
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

});