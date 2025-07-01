# NovaSoft

NovaSoft es una aplicación web diseñada para la gestión de sesiones terapéuticas, pacientes e instructores, orientada principalmente a clínicas de fisioterapia, rehabilitación o centros de salud similares.

## Características principales
- Registro y gestión de pacientes e instructores.
- Administración de series terapéuticas y posturas.
- Paneles de control para instructores y usuarios.
- Historial de sesiones y seguimiento de pacientes.
- Sistema de autenticación y control de usuarios.
- Interfaz web responsiva desarrollada con HTML, CSS y JavaScript.
- Backend en PHP siguiendo el patrón MVC (Model-View-Controller).
- Scripts y documentación para la creación y gestión de la base de datos.
- Pruebas automatizadas con PHPUnit.
- Contenedores y orquestación con Docker para facilitar el despliegue.

## Estructura del proyecto
- `public/`: Archivos públicos, páginas HTML, recursos estáticos (CSS, JS, imágenes).
- `src/`: Código fuente del backend (configuración, controladores, modelos).
- `BDD/`: Documentación y scripts de la base de datos, diagramas entidad-relación.
- `test/`: Pruebas unitarias y de extremo a extremo.
- `docker-compose.yml` y `dockerfile`: Archivos para despliegue con Docker.

## Requisitos
- PHP
- Servidor web (por ejemplo, Apache o Nginx)
- MySQL o MariaDB
- Docker (opcional, para despliegue automatizado)

## Instalación rápida
1. Clona el repositorio.
2. Configura la base de datos usando los scripts en `BDD/`.
3. Ajusta la configuración de conexión en `src/config/connect.php`.
4. (Opcional) Usa Docker para levantar el entorno: `docker-compose up`.
5. Accede a la aplicación desde tu navegador en la ruta configurada.

## Pruebas
- Ejecuta las pruebas unitarias con PHPUnit.
- Pruebas E2E disponibles en `test/e2e/integration/`.

## Licencia
Este proyecto es de uso interno y educativo. Consulta el archivo de licencia si está disponible.
