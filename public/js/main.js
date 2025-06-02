// Variable global que guarda el rol actual
let rolActual = null;
document.addEventListener('DOMContentLoaded', () => {

// Login
// Ricardo Villarreal
async function login(username, password) {
  console.log('Intentando login con:', username, password);

  try {
    const res = await fetch('../src/models/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json(); // Siempre intenta leer la respuesta

     // ✅ Imprimir en consola el mensaje y estatus
    console.log('Respuesta del servidor:', data);
    console.log('Status:', data.status);
    console.log('Mensaje:', data.message || 'Sin mensaje');

    if (!res.ok || data.status !== 'ok') {
      // Mostrar mensaje en pantalla si hay error
      mostrarMensajeError(data.message || 'Credenciales incorrectas');
      return; // No continuar con login
    }

    // Si el login fue exitoso
    console.log('Login exitoso');
    rolActual = data.rol;
    console.log('Rol del usuario:', rolActual);

    mostrarMenu(rolActual);
    cargarContenidoInicial(rolActual);

  } catch (error) {
    // Error de red o JSON
    console.error('Error en login:', error);
    mostrarMensajeError('Ocurrió un error inesperado. Intenta de nuevo.');
  }
}

function mostrarMensajeError(mensaje) {
  let errorDiv = document.getElementById('mensaje-error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'mensaje-error';
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '10px';
    document.getElementById('form-login').appendChild(errorDiv);
  }
  errorDiv.textContent = mensaje;
}




// Escuchar submit login
document.getElementById('form-login').addEventListener('submit', e => {
  e.preventDefault();
  console.log('Intentando login');
  const username = e.target.username.value;
  const password = e.target.password.value;
  login(username, password).catch(err => alert(err.message));
});



});


// Mostrar menú según rol
function mostrarMenu(rol) {
  console.log('Rol del usuario:', rol + ' - Mostrando menú correspondiente');
  // Opciones:
  // 1. Mostrar menús ya en HTML ocultos y sólo mostrar el correcto
  // 2. Generar menú dinámicamente con JS o traer menú con fetch del backend

  // Ejemplo simple: mostrar menú preexistente
  //document.getElementById('form-login').style.display = 'none';
  //document.getElementById('containerInicial').style.display = 'none';
  //document.getElementById('login').style.display = 'block';

  document.getElementById('form-login').style.display = 'none';
  document.getElementById('registrarInstructor').style.display = 'none';

  document.getElementById('textoLogin').style.display = 'block';
  if (rol === 'instructor') {
    document.getElementById('menu-admin').style.display = 'block';
    activarEventosMenu('menu-admin');
  } else if (rol === 'paciente') {
    document.getElementById('menu-usuario').style.display = 'block';
    activarEventosMenu('menu-usuario');
  }
}

// Activar evento click en los botones del menú para cargar contenido
function activarEventosMenu(menuId) {
  const menu = document.getElementById(menuId);
  menu.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      cargarContenido(rolActual, tab);
    };
  });
}

// Cargar contenido inicial (ej: dashboard) según rol
function cargarContenidoInicial(rol) {
  if (rol === 'instructor') {
    cargarContenido(rol, 'dashboard');
  } else if (rol === 'usuario') {
    cargarContenido(rol, 'perfil');
  }
}

// Cargar contenido con fetch y mostrarlo en el div principal
async function cargarContenido(rol, tab) {
  const rutas = {
    instructor: {
      dashboard: '/NovaSoft/public/pages/instructor/dashboard.html',
      usuarios: '../pages/usuario/usuarios.html',
      registroPaciente: '/NovaSoft/public/pages/usuario/registrarPaciente.html',
      nuevaSerieTerapeutica: '/NovaSoft/public/pages/instructor/nuevaSerieTerapeutica.html',
    },
    usuario: {
      perfil: '/usuario/perfil.html',
      pedidos: '/usuario/pedidos.html'
    }
  };


  const jsRutas = {
  instructor: {
    dashboard: '/NovaSoft/public/js/dashboard.js',
    usuarios: '/NovaSoft/public/js/usuarios.js',
    registroPaciente: '/NovaSoft/public/js/registrar_paciente.js',
    nuevaSerieTerapeutica: '/NovaSoft/public/js/nueva_serie.js',
  },
  usuario: {
    perfil: '/NovaSoft/public/js/perfil.js',
    pedidos: '/NovaSoft/public/js/pedidos.js'
  }
};
  const jsUrl = jsRutas[rol][tab];
  const url = rutas[rol][tab];
  console.log('Cargando contenido de:', url);
  if (!url) {
    document.getElementById('contenido').innerHTML = '<p>Página no encontrada</p>';
    return;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar la página');
    const html = await res.text();
    document.getElementById('contenido').innerHTML = html;

    // Cargar JS específico de la página
    console.log('Intentando Cargar script:', jsUrl);
    if (jsUrl) {
      
      const script = document.createElement('script');
      script.src = jsUrl;
      script.async = true;
      document.body.appendChild(script);
      console.log('Se ha cargado el script en:', jsUrl);
    }else {
      console.log('No hay script asociado para esta página:', tab);
    }

    
  } catch (e) {
    document.getElementById('contenido').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}