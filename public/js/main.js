let rolActual = null;
let usuarioActual = ''; // Para track el email actual
let intervaloBLoqueo = null; // Para el contador regresivo

// ========================== Sistema de Intentos de Login ==========================

function guardarIntentosEnStorage(email, intentos, tiempoBloqueoRestante = 0) {
  const data = {
    email: email,
    intentos: intentos,
    timestamp: Date.now(),
    tiempoBloqueoRestante: tiempoBloqueoRestante
  };
  localStorage.setItem(`login_attempts_${email}`, JSON.stringify(data));
}

function cargarIntentosDeStorage(email) {
  const stored = localStorage.getItem(`login_attempts_${email}`);
  if (!stored) {
    return { intentos: 0, tiempoBloqueoRestante: 0 };
  }
  
  try {
    const data = JSON.parse(stored);
    // Verificar si el bloqueo temporal ha expirado
    if (data.tiempoBloqueoRestante > 0) {
      const tiempoTranscurrido = Math.floor((Date.now() - data.timestamp) / 1000);
      const tiempoRestante = Math.max(0, data.tiempoBloqueoRestante - tiempoTranscurrido);
      return {
        intentos: data.intentos,
        tiempoBloqueoRestante: tiempoRestante
      };
    }
    return { intentos: data.intentos, tiempoBloqueoRestante: 0 };
  } catch (e) {
    console.error('Error parsing login attempts:', e);
    return { intentos: 0, tiempoBloqueoRestante: 0 };
  }
}

function limpiarIntentosDeStorage(email) {
  localStorage.removeItem(`login_attempts_${email}`);
}

function detectarCambioDeEmail() {
  const emailField = document.querySelector('input[name="username"]');
  if (!emailField) return;
  
  const emailActual = emailField.value.trim();
  if (emailActual !== usuarioActual) {
    usuarioActual = emailActual;
    // Cargar estado del nuevo email
    if (emailActual) {
      const estado = cargarIntentosDeStorage(emailActual);
      if (estado.tiempoBloqueoRestante > 0) {
        iniciarBloqueo(estado.tiempoBloqueoRestante);
      }
    }
  }
}

function iniciarBloqueo(segundos) {
  const submitBtn = document.querySelector('.btn[type="submit"]');
  const mensajeError = document.getElementById('mensajeError');
  
  if (!submitBtn) return;
  
  submitBtn.disabled = true;
  
  // Crear o actualizar el mensaje de countdown
  let countdownDiv = document.getElementById('countdown-message');
  if (!countdownDiv) {
    countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdown-message';
    countdownDiv.className = 'countdown-message';
    mensajeError.parentNode.insertBefore(countdownDiv, mensajeError.nextSibling);
  }
  
  function actualizarCountdown() {
    if (segundos <= 0) {
      // Terminar bloqueo
      submitBtn.disabled = false;
      countdownDiv.style.display = 'none';
      if (intervaloBLoqueo) {
        clearInterval(intervaloBLoqueo);
        intervaloBLoqueo = null;
      }
      return;
    }
    
    countdownDiv.style.display = 'block';
    countdownDiv.textContent = `Tu cuenta estará bloqueada por ${segundos} segundos`;
    segundos--;
    
    // Actualizar en localStorage
    if (usuarioActual) {
      const estado = cargarIntentosDeStorage(usuarioActual);
      guardarIntentosEnStorage(usuarioActual, estado.intentos, segundos + 1);
    }
  }
  
  // Iniciar inmediatamente
  actualizarCountdown();
  
  // Continuar cada segundo
  if (intervaloBLoqueo) clearInterval(intervaloBLoqueo);
  intervaloBLoqueo = setInterval(actualizarCountdown, 1000);
}

function determinarTiempoBloqueo(intentos) {
  if (intentos >= 9) {
    return -1; // Bloqueo permanente
  } else if (intentos === 6) {
    return 10; // 10 segundos después del 6to intento (ciclo 2)
  } else if (intentos === 3) {
    return 5; // 5 segundos después del 3er intento (ciclo 1)
  }
  return 0; // Sin bloqueo
}

function mostrarMensajeIntentos(intentos) {
  const mensajeError = document.getElementById('mensajeError');
  const h1 = mensajeError.querySelector('h1');
  
  if (intentos >= 9) {
    h1.textContent = '¡Credenciales Incorrectas! Tu cuenta está bloqueada permanentemente';
  } else if (intentos === 3 || intentos === 6 || intentos === 9) {
    // Después del 3er, 6to, o 9no intento
    h1.textContent = '¡Credenciales Incorrectas! Tienes 0 intentos restantes';
  } else {
    // Calcular intentos restantes en el ciclo actual
    let intentosRestantes;
    if (intentos === 1) {
      intentosRestantes = 2; // 3-1=2
    } else if (intentos === 2) {
      intentosRestantes = 1; // 3-2=1
    } else if (intentos === 4) {
      intentosRestantes = 2; // 6-4=2
    } else if (intentos === 5) {
      intentosRestantes = 1; // 6-5=1
    } else if (intentos === 7) {
      intentosRestantes = 2; // 9-7=2
    } else if (intentos === 8) {
      intentosRestantes = 1; // 9-8=1
    } else {
      intentosRestantes = 0;
    }
    
    const textoIntento = intentosRestantes === 1 ? 'intento restante' : 'intentos restantes';
    h1.textContent = `¡Credenciales Incorrectas! Tienes ${intentosRestantes} ${textoIntento}`;
  }
  
  mensajeError.style.display = 'block';
}

//============================Función para modificar el nombre en el sidebar================00
function renderizarSidebarUsuario(usuario) {
  const nombreElems = [
    document.getElementById('nombre-usuario'),
    document.getElementById('nombre-usuario-paciente')
  ];
  const correoElems = [
    document.getElementById('correo-usuario'),
    document.getElementById('correo-usuario-paciente')
  ];

  nombreElems.forEach(elem => {
    if (elem) elem.textContent = usuario.nombre || 'Usuario';
  });

  correoElems.forEach(elem => {
    if (elem) elem.textContent = usuario.correo || 'correo@desconocido.com';
  });
}



// ========================== Cargar Usuario desde Sesión ==========================
async function cargarUsuarioDesdeSesion() {
  try {
    const res = await fetch('/NovaSoft/src/models/getUsuario.php');
    const data = await res.json();

    if (data.status === 'ok') {
      renderizarSidebarUsuario(data.usuario);
      console.log('🔧 Ejecutando renderizarSidebarUsuario con:', data.usuario); 
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
    // Verificar si está bloqueado
    const estado = cargarIntentosDeStorage(username);
    
    if (estado.tiempoBloqueoRestante > 0) {
      iniciarBloqueo(estado.tiempoBloqueoRestante);
      return;
    }
    
    if (estado.intentos >= 9) {
      mostrarMensajeIntentos(estado.intentos);
      return;
    }
    
    const res = await fetch('../src/models/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'ok') {
      // Incrementar intentos fallidos
      const nuevosIntentos = estado.intentos + 1;
      
      // Mostrar mensaje con intentos restantes
      mostrarMensajeIntentos(nuevosIntentos);
      
      // Determinar si necesita bloqueo
      const tiempoBloqueo = determinarTiempoBloqueo(nuevosIntentos);
      
      if (tiempoBloqueo === -1) {
        // Bloqueo permanente
        guardarIntentosEnStorage(username, nuevosIntentos, 0);
      } else if (tiempoBloqueo > 0) {
        // Bloqueo temporal
        guardarIntentosEnStorage(username, nuevosIntentos, tiempoBloqueo);
        iniciarBloqueo(tiempoBloqueo);
      } else {
        // Sin bloqueo, solo guardar intentos
        guardarIntentosEnStorage(username, nuevosIntentos, 0);
      }
      
      return;
    }

    // Login exitoso - limpiar intentos
    limpiarIntentosDeStorage(username);
    document.getElementById('mensajeError').style.display = 'none';
    const countdownDiv = document.getElementById('countdown-message');
    if (countdownDiv) countdownDiv.style.display = 'none';
    
    rolActual = data.rol;
    cargarUsuarioDesdeSesion(); // Obtiene los datos reales desde sesión
    mostrarMenu(rolActual);
    cargarContenidoInicial(rolActual);

  } catch (error) {
    console.error('Error en login:', error);
    
    // Even if backend fails, track attempts for invalid credentials
    const estado = cargarIntentosDeStorage(username);
    const nuevosIntentos = estado.intentos + 1;
    
    // Mostrar mensaje con intentos restantes
    mostrarMensajeIntentos(nuevosIntentos);
    
    // Determinar si necesita bloqueo
    const tiempoBloqueo = determinarTiempoBloqueo(nuevosIntentos);
    
    if (tiempoBloqueo === -1) {
      // Bloqueo permanente
      guardarIntentosEnStorage(username, nuevosIntentos, 0);
    } else if (tiempoBloqueo > 0) {
      // Bloqueo temporal
      guardarIntentosEnStorage(username, nuevosIntentos, tiempoBloqueo);
      iniciarBloqueo(tiempoBloqueo);
    } else {
      // Sin bloqueo, solo guardar intentos
      guardarIntentosEnStorage(username, nuevosIntentos, 0);
    }
  }
}

function mostrarMensajeError(mensaje) {
  document.getElementById('mensajeError').style.display = 'block';
}

// ========================== Eventos al cargar ==========================
document.addEventListener('DOMContentLoaded', () => {
  cargarUsuarioDesdeSesion();

  // Configurar detección de cambio de email
  const emailField = document.querySelector('input[name="username"]');
  if (emailField) {
    // Cargar estado inicial si hay email pre-llenado
    usuarioActual = emailField.value.trim();
    if (usuarioActual) {
      const estado = cargarIntentosDeStorage(usuarioActual);
      if (estado.tiempoBloqueoRestante > 0) {
        iniciarBloqueo(estado.tiempoBloqueoRestante);
      } else if (estado.intentos >= 9) {
        mostrarMensajeIntentos(estado.intentos);
      }
    }
    
    // Event listeners para cambios de email
    emailField.addEventListener('input', detectarCambioDeEmail);
    emailField.addEventListener('focus', detectarCambioDeEmail);
    emailField.addEventListener('blur', detectarCambioDeEmail);
    
    // Verificación múltiple para asegurar carga del estado
    setTimeout(detectarCambioDeEmail, 100);
    setTimeout(detectarCambioDeEmail, 500);
  }

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
    
    // Verificar estado antes de enviar
    const estado = cargarIntentosDeStorage(username);
    if (estado.tiempoBloqueoRestante > 0 || estado.intentos >= 9) {
      // Evitar submit si está bloqueado
      return;
    }
    
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
        document.getElementById('dashboard-content').style.display = 'block';
        const menuUsuario = document.getElementById('menu-usuario');
        if (menuUsuario) {
          menuUsuario.style.display = 'block';
          activarEventosMenu('menu-usuario');
        }
      }

      cargarUsuarioDesdeSesion(); // ✅ Aquí solo una vez
    }, 500);
  } else {
    if (rol === 'instructor') {
      document.getElementById('dashboard-content-instructor').style.display = 'block';
      document.getElementById('dashboard-content').style.display = 'block';
      activarEventosMenu('dashboard-content-instructor');
    } else if (rol === 'paciente') {
      const menuUsuario = document.getElementById('menu-usuario');
      if (menuUsuario) {
        menuUsuario.style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'block';
        activarEventosMenu('menu-usuario');
      }
    }

    cargarUsuarioDesdeSesion(); // ✅ También si no hay login container
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
      editarPaciente: '/NovaSoft/public/pages/instructor/editarPaciente.html',
      verSeries: '/NovaSoft/public/pages/posturas/posturas.html',

    },
    paciente: {
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
      Rutina: '/NovaSoft/public/pages/usuario/rutina.html',
      DolorInicial: '/NovaSoft/public/pages/usuario/dolor_inicial.html',
      EjecutarRutina: '/NovaSoft/public/pages/usuario/ejecutar_rutina.html',
      DolorFinal: '/NovaSoft/public/pages/usuario/dolor_final.html',
      Sesion: '/NovaSoft/public/pages/usuario/historial_sesiones.html',
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
      editarPaciente: '/NovaSoft/public/js/editar_paciente.js',
      verSeries : '/NovaSoft/public/js/cargar_posturas.js',
    },
    paciente: {
      usuarios: '/NovaSoft/public/js/cargaContenido.js',
      Rutina: '/NovaSoft/public/js/cargarInfoRutina.js',
      DolorInicial: '/NovaSoft/public/js/cargarDolorInicial.js',
      EjecutarRutina: '/NovaSoft/public/js/ejecutarRutina.js',
      DolorFinal: '/NovaSoft/public/js/cargarDolorFinal.js',
      Sesion: '/NovaSoft/public/js/cargarHistorialSesiones.js',
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
          cargarUsuarioDesdeSesion();
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
