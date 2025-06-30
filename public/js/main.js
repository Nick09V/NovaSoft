let rolActual = null;

// ========================== Cargar Usuario desde Sesión ==========================
async function cargarUsuarioDesdeSesion() {
  try {
    const res = await fetch('/NovaSoft/src/models/getUsuario.php');
    const data = await res.json();

    if (data.status === 'ok') {
      const nombreElem = document.getElementById('nombre-usuario');
      const correoElem = document.getElementById('correo-usuario');

      if (nombreElem) nombreElem.textContent = data.usuario.nombre;
      if (correoElem) correoElem.textContent = data.usuario.correo;

      rolActual = data.usuario.rol;
    } else {
      console.warn('No hay sesión activa');
    }
  } catch (err) {
    console.error('Error al obtener usuario de sesión:', err);
  }
}

// ========================== Cerrar sesión ==========================
async function cerrarSesion() {
  try {
    const res = await fetch('/NovaSoft/src/models/logout.php');
    const data = await res.json();

    console.log('Respuesta del servidor al cerrar sesión:', data);

    // Limpiar localStorage por compatibilidad
    localStorage.clear();

    // Ocultar paneles
    document.getElementById('dashboard-content-instructor').style.display = 'none';
    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('contenido').innerHTML = '';

    // Mostrar login
    document.getElementById('containerLogin').style.display = 'block';

    // Redirigir si lo deseas
    window.location.href = '/NovaSoft/public/';
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
  }
}

// ========================== Login ==========================
async function login(username, password) {
  try {
    const res = await fetch('../src/models/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'ok') {
      mostrarMensajeError(data.message || 'Credenciales incorrectas');
      return;
    }

    rolActual = data.rol;
    cargarUsuarioDesdeSesion(); // Obtiene los datos reales desde sesión
    mostrarMenu(rolActual);
    cargarContenidoInicial(rolActual);

  } catch (error) {
    console.error('Error en login:', error);
    mostrarMensajeError('Ocurrió un error inesperado. Intenta de nuevo.');
  }
}

function mostrarMensajeError(mensaje) {
  document.getElementById('mensajeError').style.display = 'block';
}

// ========================== Eventos al cargar ==========================
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarioDesdeSesion();

  document.addEventListener('click', function (e) {
    if (e.target.closest('#btn-cerrar-sesion')) {
      e.preventDefault();
      cerrarSesion();
    }
  });

  document.getElementById('form-login').addEventListener('submit', e => {
    e.preventDefault();
    console.log('Formulario de login enviado');
    const username = e.target.username.value;
    const password = e.target.password.value;
    console.log('Datos de login:', { username, password });
    login(username, password).catch(err => alert(err.message));
  });

  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.addEventListener('click', function () {
      if (rolActual=== 'instructor') {
        cargarContenido(rolActual, 'dashboard');
      }else if (rolActual === 'paciente') {
        cargarContenido(rolActual, 'usuarios');
      }
    });
  }
});

// ========================== Menú según rol ==========================
function mostrarMenu(rol) {
  const loginContainer = document.getElementById('containerLogin');
  if (loginContainer) {
    loginContainer.classList.add('fade-out');
    setTimeout(() => {
      loginContainer.style.display = 'none';
      if (rol === 'instructor') {
        document.getElementById('dashboard-content-instructor').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'block';
        activarEventosMenu('dashboard-content-instructor');
      } else if (rol === 'paciente') {
        document.getElementById('dashboard-content').style.display = 'block'; // Mostrar el contenedor principal
        document.getElementById('menu-usuario') && (document.getElementById('menu-usuario').style.display = 'block');
        activarEventosMenu('menu-usuario');
      }
    }, 500);
  } else {
    // Si no existe el loginContainer, solo muestra los paneles según el rol
    if (rol === 'instructor') {
      document.getElementById('dashboard-content-instructor').style.display = 'block';
      document.getElementById('dashboard-content').style.display = 'block';
      activarEventosMenu('dashboard-content-instructor');
    } else if (rol === 'paciente') {
      document.getElementById('menu-usuario') && (document.getElementById('menu-usuario').style.display = 'block');
      document.getElementById('dashboard-content').style.display = 'block';
      activarEventosMenu('menu-usuario');
    }
  }
}

function activarEventosMenu(menuId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  const botones = menu.querySelectorAll('[data-tab]');
  botones.forEach(btn => {
    btn.onclick = () => {
      const tab = btn.getAttribute('data-tab');
      cargarContenido(rolActual, tab);
    };
  });
}

function cargarContenidoInicial(rol) {
  if (rol === 'instructor') {
    cargarContenido(rol, 'dashboard');
  } else if (rol === 'paciente') {
    cargarContenido(rol, 'usuarios');
  }
}

// ========================== Cargar contenido según el rol ==========================
async function cargarContenido(rol, tab) {
  const rutas = {
    instructor: {
      dashboard: '/NovaSoft/public/pages/instructor/dashboard.html',
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
      registroPaciente: '/NovaSoft/public/pages/usuario/registrarPaciente.html',
      nuevaSerieTerapeutica: '/NovaSoft/public/pages/instructor/nuevaSerieTerapeutica.html',
      historialSesiones: '/NovaSoft/public/pages/instructor/historialSesiones.html',
      verPacientes: '/NovaSoft/public/pages/instructor/verPacientes.html',
    },
    paciente: {
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
      Rutina: '/NovaSoft/public/pages/usuario/rutina.html',
      DolorInicial: '/NovaSoft/public/pages/usuario/dolor_inicial.html',
    }
  };

  const jsRutas = {
    instructor: {
      dashboard: '/NovaSoft/public/js/dashboard.js',
      usuarios: '/NovaSoft/public/js/usuarios.js',
      registroPaciente: '/NovaSoft/public/js/registrar_nuevo_paciente.js',
      nuevaSerieTerapeutica: '/NovaSoft/public/js/nueva_serie.js',
      historialSesiones: '/NovaSoft/public/js/historial_sesiones.js',
      verPacientes: '/NovaSoft/public/js/ver_pacientes.js',
    },
    paciente: {
      usuarios: '/NovaSoft/public/js/cargaContenido.js',
      Rutina: '/NovaSoft/public/js/cargarInfoRutina.js',
      DolorInicial: '/NovaSoft/public/js/cargarDolorInicial.js',
    }
  };

  const jsUrl = jsRutas[rol][tab];
  const url = rutas[rol][tab];

  if (!url) {
    document.getElementById('contenido').innerHTML = '<p>Página no encontrada</p>';
    return;
  }

  try {
    // Limpiar scripts anteriores
    //limpiarScriptsPrevios();
    
    // Cargar HTML
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar la página');
    const html = await res.text();
    document.getElementById('contenido').innerHTML = html;

    if (jsUrl) {
      const scriptId = 'script-' + tab;
      const existingScript = document.getElementById(scriptId);

      if (existingScript) {
        existingScript.remove(); // elimina el anterior para que se recargue
      }

      const script = document.createElement('script');
      script.src = jsUrl;
      script.id = scriptId;
      script.async = false; // importante: que espere a que se cargue el HTML
      
      script.onload = () => {
        if (rol === 'paciente' && tab === 'usuarios') {
          window.cargarDatosPaciente?.();
          window.cargarDatosInstructor?.();
        }
      };


      document.body.appendChild(script);
    }
  } catch (e) {
    document.getElementById('contenido').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}

// Evento para el botón "Registrar Paciente"
document.addEventListener('click', function (e) {
  const target = e.target.closest('[data-tab="registroPaciente"]');
  if (target) {
    e.preventDefault();
    cargarContenido(rolActual || 'instructor', 'registroPaciente');
  }
});
