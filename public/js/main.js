// Variable global que guarda el rol actual
let rolActual = null;

//Función para guardar la información del usuario en localStorage
function actualizarSidebarConUsuario() {
  const nombre = localStorage.getItem('nombre') || 'Usuario';
  const correo = localStorage.getItem('correo') || 'correo@example.com';
  const nombreElem = document.querySelector('.sidebar-user h3');
  const correoElem = document.querySelector('.sidebar-user span');

  if (nombreElem) nombreElem.textContent = nombre;
  if (correoElem) correoElem.textContent = correo;
}
//Función para cerrar sesión
function cerrarSesion() {
  console.log('Cerrando sesión...');
  localStorage.clear(); // Elimina nombre, correo, rol, etc.

  // Oculta paneles
  document.getElementById('dashboard-content-instructor').style.display = 'none';
  document.getElementById('dashboard-content').style.display = 'none';
  const loginContainer = document.getElementById('containerLogin');
  loginContainer.style.display = 'block';

  // Limpia contenido dinámico
  document.getElementById('contenido').innerHTML = '';

  //Redirige al login
  window.location.href = window.location.origin + "/NovaSoft/public/";
}




document.addEventListener('DOMContentLoaded', () => {
  actualizarSidebarConUsuario();
  document.addEventListener('click', function(e) {
    if (e.target.closest('#btn-cerrar-sesion')) {
      e.preventDefault();
      cerrarSesion();
    }
  });

  
// Login
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
    localStorage.setItem('nombre' , data.usuario.nombre);
    localStorage.setItem('correo', username);
    localStorage.setItem('rol', rolActual);
    actualizarSidebarConUsuario();
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


// Evento para el botón Inicio
const btnInicio = document.getElementById('btn-inicio');
if (btnInicio) {
  btnInicio.addEventListener('click', function() {
    if (rolActual) {
      cargarContenido(rolActual, 'dashboard');
    }
  });
}

});


//=================================================================================//

// Mostrar menú según rol
function mostrarMenu(rol) {
  const loginContainer = document.getElementById('containerLogin');
  loginContainer.classList.add('fade-out');
  setTimeout(() => {
    loginContainer.style.display = 'none';
    // Mostrar menú y contenido
    if (rol === 'instructor') {
      document.getElementById('dashboard-content-instructor').style.display = 'block';
      document.getElementById('dashboard-content').style.display = 'block';
      actualizarSidebarConUsuario();
      activarEventosMenu('dashboard-content-instructor');
    } else if (rol === 'paciente') {
      document.getElementById('menu-usuario').style.display = 'block';
      actualizarSidebarConUsuario();
      activarEventosMenu('menu-usuario');
    }
  }, 500); // Espera a que termine la transición
}
// Activar evento click en los botones del menú para cargar contenido
  function activarEventosMenu(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) {
    console.warn('No se encontró el menú con id:', menuId);
    return;
  }

  const botones = menu.querySelectorAll('[data-tab]');
  if (!botones.length) {
    console.warn('No se encontraron botones con data-tab en', menuId);
    return;
  }

  botones.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      console.log('Cargando tab:', tab, 'para rol:', rolActual);
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

// Cargar contenido con fetch y mostrarlo en el div principal
async function cargarContenido(rol, tab) {
  const rutas = {
    instructor: {
      dashboard: '/NovaSoft/public/pages/instructor/dashboard.html',
      usuarios: '../pages/usuario/usuarios.html',
      registroPaciente: '/NovaSoft/public/pages/usuario/registrarPaciente.html',
      nuevaSerieTerapeutica: '/NovaSoft/public/pages/instructor/nuevaSerieTerapeutica.html',
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
  },
  paciente: {
    /*usuarios: '/NovaSoft/public/js/usuarios.js',*/
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

// Si se hace click en el enlace de registrar paciente
document.addEventListener('click', function(e) {
  // Para botón o enlace con data-tab="registroPaciente"
  const target = e.target.closest('[data-tab="registroPaciente"]');
  if (target) {
    e.preventDefault();
    cargarContenido(rolActual || 'instructor', 'registroPaciente');
  }
});