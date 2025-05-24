// Variable global que guarda el rol actual
let rolActual = null;
// Prevenir recarga de la página en formularios (ya está en el submit del login con e.preventDefault())
e.preventDefault();
// Login
async function login(username, password) {
  console.log('Intentando login con:', username, password);
  const res = await fetch('/models/login.php', {
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

  //mostrarMenu(rolActual);
  //cargarContenidoInicial(rolActual);
}

// Mostrar menú según rol
function mostrarMenu(rol) {
  // Opciones:
  // 1. Mostrar menús ya en HTML ocultos y sólo mostrar el correcto
  // 2. Generar menú dinámicamente con JS o traer menú con fetch del backend

  // Ejemplo simple: mostrar menú preexistente
  document.getElementById('login-form').style.display = 'none';

  if (rol === 'admin') {
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
  if (rol === 'admin') {
    cargarContenido(rol, 'dashboard');
  } else if (rol === 'usuario') {
    cargarContenido(rol, 'perfil');
  }
}

// Cargar contenido con fetch y mostrarlo en el div principal
async function cargarContenido(rol, tab) {
  const rutas = {
    admin: {
      dashboard: '/../pages/instructor/dashboard.html',
      usuarios: '/admin/usuarios.html'
    },
    usuario: {
      perfil: '/usuario/perfil.html',
      pedidos: '/usuario/pedidos.html'
    }
  };

  const url = rutas[rol][tab];
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

// Escuchar submit login
document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;
  login(username, password).catch(err => alert(err.message));
});
