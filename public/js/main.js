// ========================== Variables globales para control de intentos ==========================
let intentosFallidos = 0;
let cuentaBloqueada = false;
let tiempoBloqueo = 0;
let intervalBloqueo = null;
let usuarioActual = '';
let sistemaInicializado = false;

let rolActual = null;

// ========================== Funciones de Persistencia ==========================
function guardarIntentosEnStorage(email, intentos, tiempoBloqueoRestante = 0) {
  const datosIntentos = {
    email: email,
    intentos: intentos,
    timestamp: Date.now(),
    tiempoBloqueoRestante: tiempoBloqueoRestante
  };
  localStorage.setItem('login_attempts_' + email, JSON.stringify(datosIntentos));
  console.log('💾 Guardado en localStorage:', datosIntentos);
}

function cargarIntentosDeStorage(email) {
  const key = 'login_attempts_' + email;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    console.log('📭 No hay datos guardados para:', email);
    return { intentos: 0, tiempoBloqueoRestante: 0 };
  }
  
  try {
    const datos = JSON.parse(stored);
    console.log('📂 Cargado de localStorage:', datos);
    
    // Verificar si los datos son del mismo email
    if (datos.email !== email) {
      console.log('👤 Email diferente, reseteando intentos');
      localStorage.removeItem(key);
      return { intentos: 0, tiempoBloqueoRestante: 0 };
    }
    
    // Verificar si el bloqueo temporal ha expirado
    if (datos.tiempoBloqueoRestante > 0) {
      const tiempoTranscurrido = Math.floor((Date.now() - datos.timestamp) / 1000);
      const tiempoRestante = Math.max(0, datos.tiempoBloqueoRestante - tiempoTranscurrido);
      
      if (tiempoRestante > 0) {
        console.log('⏰ Cuenta aún bloqueada, tiempo restante:', tiempoRestante);
        return { intentos: datos.intentos, tiempoBloqueoRestante: tiempoRestante };
      } else {
        console.log('✅ Tiempo de bloqueo expirado');
        return { intentos: datos.intentos, tiempoBloqueoRestante: 0 };
      }
    }
    
    return { intentos: datos.intentos, tiempoBloqueoRestante: 0 };
    
  } catch (e) {
    console.error('❌ Error al parsear datos guardados:', e);
    localStorage.removeItem(key);
    return { intentos: 0, tiempoBloqueoRestante: 0 };
  }
}

function limpiarIntentosDeStorage(email) {
  const key = 'login_attempts_' + email;
  localStorage.removeItem(key);
  console.log('🗑️ Limpiados intentos para:', email);
}

// ========================== Inicialización Mejorada ==========================
function inicializarSistemaIntentos() {
  if (sistemaInicializado) {
    console.log('⚠️ Sistema ya inicializado, saltando...');
    return;
  }
  
  console.log('🚀 Inicializando sistema de intentos...');
  
  const inputEmail = document.querySelector('input[name="username"]');
  if (!inputEmail) {
    console.error('❌ Input de email no encontrado');
    return;
  }
  
  // Marcar como inicializado
  sistemaInicializado = true;
  
  // Configurar event listeners
  configurarEventListeners(inputEmail);
  
  // Cargar estado inicial inmediatamente
  const emailInicial = inputEmail.value.trim().toLowerCase();
  if (emailInicial) {
    console.log('📧 Email inicial detectado:', emailInicial);
    usuarioActual = emailInicial;
    cargarEstadoUsuario(emailInicial);
  }
  
  // Verificaciones adicionales con retrasos progresivos
  setTimeout(() => verificarYCargarEstado(inputEmail), 100);
  setTimeout(() => verificarYCargarEstado(inputEmail), 300);
  setTimeout(() => verificarYCargarEstado(inputEmail), 800);
  
  console.log('✅ Sistema de intentos inicializado');
}

function verificarYCargarEstado(inputEmail) {
  const email = inputEmail.value.trim().toLowerCase();
  if (email && email !== usuarioActual) {
    console.log('🔄 Verificación adicional - nuevo email:', email);
    usuarioActual = email;
    cargarEstadoUsuario(email);
  } else if (email && usuarioActual === email && intentosFallidos === 0) {
    // Forzar recarga si no se han cargado intentos
    console.log('🔄 Forzando recarga de estado para:', email);
    cargarEstadoUsuario(email);
  }
}

function configurarEventListeners(inputEmail) {
  // Remover listeners previos si existen
  const nuevoInput = inputEmail.cloneNode(true);
  inputEmail.parentNode.replaceChild(nuevoInput, inputEmail);
  
  // Event listener para cambios en el input
  nuevoInput.addEventListener('input', function() {
    const nuevoEmail = this.value.trim().toLowerCase();
    console.log('📝 Input change detectado:', nuevoEmail);
    
    if (nuevoEmail !== usuarioActual) {
      if (usuarioActual !== '') {
        console.log('📧 Cambio de email:', usuarioActual, '->', nuevoEmail);
        resetearEstadoActual();
      }
      
      usuarioActual = nuevoEmail;
      if (nuevoEmail.length > 0) {
        cargarEstadoUsuario(nuevoEmail);
      }
    }
  });
  
  // Event listener para foco
  nuevoInput.addEventListener('focus', function() {
    const email = this.value.trim().toLowerCase();
    if (email && email !== usuarioActual) {
      console.log('👁️ Focus - nuevo email:', email);
      usuarioActual = email;
      cargarEstadoUsuario(email);
    }
  });
  
  // Event listener para blur
  nuevoInput.addEventListener('blur', function() {
    const email = this.value.trim().toLowerCase();
    if (email && email !== usuarioActual) {
      console.log('👁️ Blur - verificando email:', email);
      usuarioActual = email;
      cargarEstadoUsuario(email);
    }
  });
}

function resetearEstadoActual() {
  console.log('🔄 Reseteando estado actual');
  intentosFallidos = 0;
  cuentaBloqueada = false;
  if (intervalBloqueo) {
    clearInterval(intervalBloqueo);
    intervalBloqueo = null;
  }
  ocultarMensajeError();
  rehabilitarBoton();
}

function cargarEstadoUsuario(email) {
  if (!email) return;
  
  console.log('👤 Cargando estado para:', email);
  const estado = cargarIntentosDeStorage(email);
  intentosFallidos = estado.intentos;
  
  console.log('📊 Estado cargado:', {
    email,
    intentosFallidos,
    tiempoBloqueoRestante: estado.tiempoBloqueoRestante
  });
  
  if (estado.tiempoBloqueoRestante > 0) {
    console.log('🔒 Iniciando bloqueo residual:', estado.tiempoBloqueoRestante, 'segundos');
    iniciarBloqueo(estado.tiempoBloqueoRestante);
  } else if (intentosFallidos >= 9) {
    console.log('🚫 Cuenta bloqueada permanentemente');
    mostrarMensajeError('Tu cuenta está bloqueada permanentemente. Contacta al administrador.');
    deshabilitarBoton();
  } else if (intentosFallidos > 0) {
    // Calcular y mostrar estado actual
    const cicloActual = Math.floor((intentosFallidos - 1) / 3) + 1;
    const posicionEnCiclo = ((intentosFallidos - 1) % 3) + 1;
    const intentosRestantes = Math.max(0, 3 - posicionEnCiclo);
    
    console.log('📈 Estado actual:', {
      intentosFallidos,
      cicloActual,
      posicionEnCiclo,
      intentosRestantes
    });
    
    mostrarMensajeIntento(intentosRestantes);
  } else {
    console.log('✅ Usuario sin intentos fallidos');
    ocultarMensajeError();
    rehabilitarBoton();
  }
}

// ========================== Funciones de Control de Intentos ==========================
function iniciarBloqueo(segundos) {
  cuentaBloqueada = true;
  tiempoBloqueo = segundos;
  
  console.log('Iniciando bloqueo de', segundos, 'segundos');
  
  // Guardar estado de bloqueo
  if (usuarioActual) {
    guardarIntentosEnStorage(usuarioActual, intentosFallidos, tiempoBloqueo);
  }
  
  deshabilitarBoton();
  
  // Limpiar intervalo previo si existe
  if (intervalBloqueo) {
    clearInterval(intervalBloqueo);
  }
  
  intervalBloqueo = setInterval(() => {
    tiempoBloqueo--;
    mostrarMensajeBloqueo(`Tu cuenta está bloqueada. Tiempo restante: ${tiempoBloqueo} segundos`);
    
    // Actualizar storage con tiempo restante
    if (usuarioActual) {
      guardarIntentosEnStorage(usuarioActual, intentosFallidos, tiempoBloqueo);
    }
    
    if (tiempoBloqueo <= 0) {
      console.log('Bloqueo finalizado');
      clearInterval(intervalBloqueo);
      intervalBloqueo = null;
      cuentaBloqueada = false;
      
      // Actualizar storage sin tiempo de bloqueo
      if (usuarioActual) {
        guardarIntentosEnStorage(usuarioActual, intentosFallidos, 0);
      }
      
      rehabilitarBoton();
      // Mostrar mensaje de intentos restantes si los hay
      if (intentosFallidos > 0 && intentosFallidos < 9) {
        const cicloActual = Math.floor((intentosFallidos - 1) / 3) + 1;
        const posicionEnCiclo = ((intentosFallidos - 1) % 3) + 1;
        const intentosRestantes = Math.max(0, 3 - posicionEnCiclo);
        mostrarMensajeIntento(intentosRestantes);
      } else {
        ocultarMensajeError();
      }
    }
  }, 1000);
}

function deshabilitarBoton() {
  const btnIngresar = document.querySelector('button[type="submit"]');
  if (btnIngresar) {
    btnIngresar.disabled = true;
    btnIngresar.style.opacity = '0.5';
    btnIngresar.style.cursor = 'not-allowed';
  }
}

function rehabilitarBoton() {
  const btnIngresar = document.querySelector('button[type="submit"]');
  if (btnIngresar) {
    btnIngresar.disabled = false;
    btnIngresar.style.opacity = '1';
    btnIngresar.style.cursor = 'pointer';
  }
}

function mostrarMensajeBloqueo(mensaje) {
  const mensajeError = document.getElementById('mensajeError');
  const mensajeH1 = mensajeError.querySelector('h1');
  
  if (mensajeH1) {
    mensajeH1.innerHTML = mensaje;
    mensajeH1.style.color = '#ff6b6b';
    mensajeH1.style.fontWeight = 'bold';
  }
  mensajeError.style.display = 'block';
}

function mostrarMensajeIntento(intentosRestantes) {
  let mensaje = '';
  
  if (intentosRestantes > 0) {
    mensaje = `¡Credenciales Incorrectas!<br><span style="color: #ff9800; font-size: 12px;">Tienes ${intentosRestantes} intento${intentosRestantes > 1 ? 's' : ''} restante${intentosRestantes > 1 ? 's' : ''}</span>`;
  } else {
    mensaje = `¡Credenciales Incorrectas!<br><span style="color: #f44336; font-size: 12px;">Tienes 0 intentos restantes</span>`;
  }
  
  const mensajeError = document.getElementById('mensajeError');
  const mensajeH1 = mensajeError.querySelector('h1');
  
  if (mensajeH1) {
    mensajeH1.innerHTML = mensaje;
  }
  mensajeError.style.display = 'block';
}

function ocultarMensajeError() {
  const mensajeError = document.getElementById('mensajeError');
  if (mensajeError) {
    mensajeError.style.display = 'none';
  }
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

    // MODIFICADO: No limpiar TODO el localStorage, solo los datos de login attempts
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith('login_attempts_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

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

// ========================== Login con Control de Intentos Mejorado ==========================
async function login(username, password) {
  const email = username.trim().toLowerCase();
  
  // Asegurar que el usuario actual esté sincronizado
  if (email !== usuarioActual) {
    console.log(' Sincronizando usuario antes del login:', email);
    usuarioActual = email;
    cargarEstadoUsuario(email);
  }
  
  // Verificar si la cuenta está bloqueada
  if (cuentaBloqueada) {
    mostrarMensajeBloqueo(`Tu cuenta está bloqueada. Tiempo restante: ${tiempoBloqueo} segundos`);
    return;
  }

  // Verificar bloqueo permanente
  if (intentosFallidos >= 9) {
    mostrarMensajeError('Tu cuenta está bloqueada permanentemente. Contacta al administrador.');
    return;
  }

  try {
    const res = await fetch('../src/models/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    
    if (!res.ok || data.status !== 'ok') {
      // Incrementar intentos fallidos
      intentosFallidos++;
      
      console.log(' Login fallido. Intentos totales:', intentosFallidos, 'para email:', email);
      
      // Guardar inmediatamente en storage
      guardarIntentosEnStorage(email, intentosFallidos, 0);
      
      const cicloActual = Math.floor((intentosFallidos - 1) / 3) + 1;
      const posicionEnCiclo = ((intentosFallidos - 1) % 3) + 1;
      const intentosRestantes = 3 - posicionEnCiclo;
      
      console.log(' Ciclo:', cicloActual, 'Posición en ciclo:', posicionEnCiclo, 'Restantes:', intentosRestantes);
      
      if (intentosFallidos >= 9) {
        // 9 intentos fallidos = cuenta bloqueada permanentemente
        mostrarMensajeError('Tu cuenta está bloqueada permanentemente. Contacta al administrador.');
        deshabilitarBoton();
        guardarIntentosEnStorage(email, 9, 0); // Mantener en 9
      } else if (posicionEnCiclo === 3) {
        // Fin de ciclo - activar bloqueo
        mostrarMensajeIntento(0);
        
        let tiempoBloqueoSegundos;
        if (cicloActual === 1) {
          tiempoBloqueoSegundos = 5; // Primer ciclo: 5 segundos
        } else if (cicloActual === 2) {
          tiempoBloqueoSegundos = 10; // Segundo ciclo: 10 segundos
        } else {
          tiempoBloqueoSegundos = 15; // Tercer ciclo: 15 segundos
        }
        
        setTimeout(() => {
          iniciarBloqueo(tiempoBloqueoSegundos);
        }, 2000);
      } else {
        // Mostrar intentos restantes en el ciclo actual
        mostrarMensajeIntento(intentosRestantes);
      }
      
      return;
    }

    // Login exitoso - limpiar todo
    console.log(' Login exitoso para:', email);
    limpiarIntentosDeStorage(email);
    intentosFallidos = 0;
    cuentaBloqueada = false;
    if (intervalBloqueo) {
      clearInterval(intervalBloqueo);
      intervalBloqueo = null;
    }
    ocultarMensajeError();
    rehabilitarBoton();

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
  const mensajeError = document.getElementById('mensajeError');
  const mensajeH1 = mensajeError.querySelector('h1');
  
  if (mensajeH1) {
    mensajeH1.innerHTML = mensaje;
    mensajeH1.style.color = 'red';
  }
  mensajeError.style.display = 'block';
}

// ========================== Eventos al cargar Mejorados ==========================
document.addEventListener('DOMContentLoaded', () => {
  console.log(' DOM Content Loaded - Inicializando sistema');
  
  // Inicializar inmediatamente
  inicializarSistemaIntentos();
  
  // Verificaciones adicionales para asegurar inicialización
  setTimeout(() => {
    if (!sistemaInicializado) {
      console.log(' Sistema no inicializado, reintentando...');
      inicializarSistemaIntentos();
    }
  }, 200);
  
  cargarUsuarioDesdeSesion();

  document.addEventListener('click', function (e) {
    if (e.target.closest('#btn-cerrar-sesion')) {
      e.preventDefault();
      cerrarSesion();
    }
  });

  // Configurar form submit con verificación adicional
  const form = document.getElementById('form-login');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      console.log(' Formulario de login enviado');
      
      const username = e.target.username.value;
      const password = e.target.password.value;
      
      if (!username.trim()) {
        mostrarMensajeError('Por favor ingresa tu email');
        return;
      }
      
      // Verificar si la cuenta está bloqueada antes de procesar
      if (cuentaBloqueada) {
        mostrarMensajeBloqueo(`Tu cuenta está bloqueada. Tiempo restante: ${tiempoBloqueo} segundos`);
        return;
      }
      
      console.log(' Intentando login para:', username);
      login(username, password).catch(err => console.error('Error en login:', err));
    });
  }

  const btnInicio = document.getElementById('btn-inicio');
  if (btnInicio) {
    btnInicio.addEventListener('click', function () {
      if (rolActual === 'instructor') {
        cargarContenido(rolActual, 'dashboard');
      } else if (rolActual === 'paciente') {
        cargarContenido(rolActual, 'usuarios');
      }
    });
  }
});

// ========================== Inicialización adicional al cargar ventana ==========================
window.addEventListener('load', () => {
  console.log(' Window Load - Verificación final');
  
  // Verificación final después de que todo esté cargado
  setTimeout(() => {
    if (!sistemaInicializado) {
      console.log(' Inicialización final fallback');
      inicializarSistemaIntentos();
    } else {
      // Re-verificar estado actual
      const inputEmail = document.querySelector('input[name="username"]');
      if (inputEmail && inputEmail.value.trim()) {
        const email = inputEmail.value.trim().toLowerCase();
        if (email !== usuarioActual || (usuarioActual && intentosFallidos === 0)) {
          console.log('🔄 Re-verificación final del estado');
          usuarioActual = email;
          cargarEstadoUsuario(email);
        }
      }
    }
  }, 500);
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

      cargarUsuarioDesdeSesion(); //  Aquí solo una vez
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

    cargarUsuarioDesdeSesion(); //  También si no hay login container
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
      verSeries: '/NovaSoft/public/pages/posturas/posturas.html'
    },
    paciente: {
      usuarios: '/NovaSoft/public/pages/usuario/usuarios.html',
      Rutina: '/NovaSoft/public/pages/usuario/rutina.html',
      DolorInicial: '/NovaSoft/public/pages/usuario/dolor_inicial.html',
      EjecutarRutina: '/NovaSoft/public/pages/usuario/ejecutar_rutina.html',
      DolorFinal: '/NovaSoft/public/pages/usuario/dolor_final.html',
      Sesion: '/NovaSoft/public/pages/usuario/historial_sesiones.html'
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
      verSeries: '/NovaSoft/public/js/cargar_posturas.js'
    },
    paciente: {
      usuarios: '/NovaSoft/public/js/cargaContenido.js',
      Rutina: '/NovaSoft/public/js/cargarInfoRutina.js',
      DolorInicial: '/NovaSoft/public/js/cargarDolorInicial.js',
      EjecutarRutina: '/NovaSoft/public/js/ejecutarRutina.js',
      DolorFinal: '/NovaSoft/public/js/cargarDolorFinal.js',
      Sesion: '/NovaSoft/public/js/cargarHistorialSesiones.js'
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