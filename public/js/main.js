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
  document.getElementById('mensajeError').style.display = 'block';
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
  const loginContainer = document.getElementById('containerLogin');
  loginContainer.classList.add('fade-out');
  setTimeout(() => {
    loginContainer.style.display = 'none';
    // Mostrar menú y contenido
    if (rol === 'instructor') {
      document.getElementById('menu-admin').style.display = 'flex';
      activarEventosMenu('menu-admin');
    } else if (rol === 'paciente') {
      document.getElementById('menu-usuario').style.display = 'block';
      activarEventosMenu('menu-usuario');
    }
  }, 500); // Espera a que termine la transición
}

// Activar evento click en los botones del menú para cargar contenido
function activarEventosMenu(menuId) {
  const menu = document.getElementById(menuId);
  menu.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      console.log('Cargando tab:', tab , 'para rol:', rolActual);
      cargarContenido(rolActual, tab);
    };
  });
}

// Cargar contenido inicial (ej: dashboard) según rol
function cargarContenidoInicial(rol) {
  if (rol === 'instructor') {
    cargarContenido(rol, 'dashboard');
  } else if (rol === 'paciente') {
    console.log('ingresooooooooooooo al paciente');
    cargarContenido(rol, 'usuarios');
  }
}

// Función para limpiar scripts anteriores
function limpiarScriptsPrevios() {
  const scriptsAnteriores = document.querySelectorAll('script[data-dynamic="true"]');
  scriptsAnteriores.forEach(script => script.remove());
}

// Función para cargar JS dinámicamente
function cargarJS(jsUrl) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = jsUrl;
    script.setAttribute('data-dynamic', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.body.appendChild(script);
  });
}

// Cargar contenido con fetch y mostrarlo en el div principal
async function cargarContenido(rol, tab) {
  const rutas = {
    instructor: {
      dashboard: '/NovaSoft/public/pages/instructor/dashboard.html',
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
      registroPaciente: '/NovaSoft/public/pages/usuario/registrarPaciente.html',
      nuevaSerieTerapeutica: '/NovaSoft/public/pages/instructor/nuevaSerieTerapeutica.html',
      posturas: '/NovaSoft/public/pages/posturas/posturas.html'
    },
    paciente: {
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
    }
  };

  const jsRutas = {
    instructor: {
      dashboard: '/NovaSoft/public/js/dashboard.js',
      usuarios: '/NovaSoft/public/js/usuarios.js',
      registroPaciente: '/NovaSoft/public/js/registrar_nuevo_paciente.js',
      nuevaSerieTerapeutica: '/NovaSoft/public/js/nueva_serie.js',
      posturas: '/NovaSoft/public/js/cargar_posturas.js'
    },
    paciente: {
      /*usuarios: '/NovaSoft/public/js/usuarios.js',*/
    }
  };

  const url = rutas[rol][tab];
  const jsUrl = jsRutas[rol][tab];
  
  console.log('Cargando contenido de:', url);
  
  if (!url) {
    document.getElementById('contenido').innerHTML = '<p>Página no encontrada</p>';
    return;
  }

  try {
    // Limpiar scripts anteriores
    limpiarScriptsPrevios();
    
    // Cargar HTML
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar la página');
    const html = await res.text();
    document.getElementById('contenido').innerHTML = html;

    // Cargar JS específico de la página
    if (jsUrl) {
      try {
        console.log('Intentando cargar script:', jsUrl);
        await cargarJS(jsUrl);
        console.log('Script cargado exitosamente:', jsUrl);
      } catch (error) {
        console.error('Error al cargar el script:', jsUrl, error);
      }
    } else {
      console.log('No hay script asociado para esta página:', tab);
    }

  } catch (e) {
    document.getElementById('contenido').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}