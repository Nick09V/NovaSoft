// Variable global que guarda el rol actual
let rolActual = null;
document.addEventListener('DOMContentLoaded', () => {

// Login
async function login(username, password) {
  console.log('Intentando login con:', username, password);
  const res = await fetch('../src/models/login.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({username, password})
  });

  if (!res.ok) throw new Error('Credenciales incorrectas');
  if(res.ok){
    // Si el login es exitoso, ocultar el formulario de login
    console.log('Login exitoso');
  }

  const data = await res.json();  // Ej: { rol: 'admin' }
  rolActual = data.rol;
  console.log('Rol del usuario:', rolActual);

  mostrarMenu(rolActual);
  cargarContenidoInicial(rolActual);
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
  document.getElementById('form-login').style.display = 'none';
  document.getElementById('containerIncial').style.display = 'none';

  if (rol === 'instructor') {
    document.getElementById('menu-admin').style.display = 'block';
    activarEventosMenu('menu-admin');
  } else if (rol === 'usuario') {
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
      postura: '/NovaSoft/public/pages/posturas/posturas.html',
    },
    usuario: {
      perfil: '/usuario/perfil.html',
      pedidos: '/usuario/pedidos.html'
    }
  };

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
  } catch (e) {
    document.getElementById('contenido').innerHTML = `<p>Error: ${e.message}</p>`;
  }
}



