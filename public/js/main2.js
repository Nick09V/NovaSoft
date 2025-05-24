document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('form-login');
    function login (){
        console.log('Login');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('entro al login del main 2');
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            console.log(data);
            const res = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (res.status === 200) {
                console.log('Login exitoso');
            } else {
                console.log('Error en el login');
            }
        });
    }


    // Llamar a la función de login al cargar la página
    



    login();
});