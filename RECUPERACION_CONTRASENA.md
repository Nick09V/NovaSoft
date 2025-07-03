# Funcionalidad de Recuperación de Contraseña - NovaSoft

## Descripción
Esta implementación proporciona un sistema completo y seguro para la recuperación de contraseñas en el sistema NovaSoft, permitiendo a instructores y pacientes restablecer sus contraseñas de manera segura.

## Archivos Implementados

### Frontend
1. **`public/pages/auth/recuperar_contrasena.html`**
   - Página principal para solicitar recuperación de contraseña
   - Formulario simple que solo requiere el correo electrónico
   - Validación de formato de email en tiempo real
   - Interfaz responsive y amigable

2. **`public/pages/auth/reset_password.html`**
   - Página para establecer nueva contraseña usando token
   - Validación de fortaleza de contraseña en tiempo real
   - Verificación automática de validez del token
   - Requisitos de seguridad claramente mostrados

3. **`public/js/recuperar_contrasena.js`**
   - Manejo de formulario de solicitud de recuperación
   - Validación de email del lado cliente
   - Comunicación con backend via fetch API
   - Manejo de estados de carga y mensajes de error/éxito

4. **`public/js/reset_password.js`**
   - Manejo de formulario de restablecimiento
   - Validación de fortaleza de contraseña
   - Verificación de tokens
   - Retroalimentación visual para el usuario

### Backend
1. **`src/models/recuperar_contrasena.php`**
   - Endpoint principal para solicitudes de recuperación
   - Búsqueda de usuarios en tablas `instructor` y `paciente`
   - Generación de tokens seguros de recuperación
   - Envío de emails de recuperación
   - Sistema de logging para desarrollo

2. **`src/models/verify_reset_token.php`**
   - Verificación de validez y expiración de tokens
   - Validación de tokens no utilizados
   - Limpieza automática de tokens expirados

3. **`src/models/reset_password.php`**
   - Procesamiento de restablecimiento de contraseña
   - Validación de fortaleza de nueva contraseña
   - Actualización segura en base de datos
   - Marcado de tokens como utilizados

### Base de Datos
Se crea automáticamente la tabla `password_reset_tokens`:
```sql
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    user_type ENUM('instructor', 'paciente') NOT NULL,
    expiry DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email)
);
```

## Flujo de Funcionamiento

### 1. Solicitud de Recuperación
1. Usuario accede a `recuperar_contrasena.html`
2. Ingresa su correo electrónico
3. Sistema busca el email en ambas tablas (`instructor` y `paciente`)
4. Si existe, genera token seguro con expiración de 1 hora
5. Envía email con enlace de recuperación

### 2. Restablecimiento de Contraseña
1. Usuario hace clic en enlace del email
2. Accede a `reset_password.html?token=...`
3. Sistema verifica validez del token
4. Usuario ingresa nueva contraseña con validaciones de seguridad
5. Sistema actualiza contraseña y marca token como usado

## Medidas de Seguridad Implementadas

### Tokens Seguros
- Generación con `random_bytes(32)` y conversión hexadecimal
- Expiración automática en 1 hora
- Un solo uso por token
- Limpieza automática de tokens expirados

### Validación de Contraseñas
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Hash seguro con `password_hash()`

### Protección contra Ataques
- No revela si un email existe en el sistema
- Protección contra timing attacks
- Validación estricta de tokens
- Transacciones de base de datos para consistencia

### Logging y Monitoreo
- Log de emails enviados para desarrollo
- Registro de errores detallado
- Limpieza automática de datos sensibles

## Configuración de Email

### Desarrollo
Actualmente configurado para logging en archivo:
- Los emails se guardan en `src/logs/email_recovery.log`
- No se envían emails reales

### Producción
Para implementar envío real de emails, modificar la función `sendPasswordResetEmail()`:

```php
// Ejemplo con PHPMailer
use PHPMailer\PHPMailer\PHPMailer;

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'tu-email@gmail.com';
$mail->Password = 'tu-password-de-aplicacion';
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;

$mail->setFrom('noreply@novasoft.com', 'NovaSoft');
$mail->addAddress($to);
$mail->isHTML(true);
$mail->Subject = $subject;
$mail->Body = $body;

$mail->send();
```

## Consideraciones de Seguridad vs Requerimientos

### Requerimiento Original (INSEGURO)
El requerimiento solicitaba "enviar la contraseña sin el hash a ese correo", lo cual es una **mala práctica de seguridad** porque:

1. **Violación de principios de seguridad**: Las contraseñas nunca deben transmitirse en texto plano
2. **Problema técnico**: Las contraseñas están hasheadas y no pueden recuperarse
3. **Riesgo de intercepción**: Los emails pueden ser interceptados
4. **Cumplimiento normativo**: Viola regulaciones de protección de datos

### Implementación Actual (SEGURA)
La implementación actual sigue mejores prácticas:

1. **Tokens temporales**: En lugar de contraseñas, se envían tokens únicos
2. **Expiración**: Los tokens tienen vida útil limitada
3. **Un solo uso**: Cada token solo puede usarse una vez
4. **Nueva contraseña**: El usuario debe crear una nueva contraseña segura

### Alternativa para Cumplir Requerimiento Inseguro
Si fuera absolutamente necesario implementar el método inseguro (NO RECOMENDADO), sería necesario:

1. **Modificar sistema de registro**: Almacenar contraseñas en texto plano
2. **Modificar sistema de login**: No usar `password_verify()`
3. **Implementar según comentarios**: Ver código comentado en `recuperar_contrasena.php`

**⚠️ ADVERTENCIA**: Esta implementación tendría serias vulnerabilidades de seguridad.

## Testing

### Pruebas Manuales
1. Abrir `index.html` y hacer clic en "¿Olvidaste tu contraseña?"
2. Ingresar un email válido de instructor o paciente
3. Verificar que se genera el log en `src/logs/email_recovery.log`
4. Copiar el enlace de recuperación y probarlo
5. Establecer nueva contraseña e intentar login

### Casos de Prueba
- [ ] Email válido de instructor
- [ ] Email válido de paciente  
- [ ] Email inválido (formato)
- [ ] Email que no existe en sistema
- [ ] Token válido
- [ ] Token expirado
- [ ] Token ya utilizado
- [ ] Contraseña débil
- [ ] Contraseña fuerte
- [ ] Confirmación de contraseña incorrecta

## Mantenimiento

### Limpieza de Tokens
El sistema limpia automáticamente:
- Tokens expirados al verificar nuevos tokens
- Tokens utilizados después de restablecer contraseña

### Logs
- Revisar regularmente `src/logs/email_recovery.log`
- Implementar rotación de logs en producción
- Configurar alertas para errores frecuentes

## Próximos Pasos

1. **Configurar servicio de email real** (PHPMailer, SendGrid, etc.)
2. **Implementar rate limiting** para prevenir abuso
3. **Añadir autenticación 2FA** como capa adicional
4. **Crear panel de administración** para gestionar tokens
5. **Implementar notificaciones** de cambios de contraseña
6. **Añadir tests automatizados** para todas las funcionalidades

---

**Nota Final**: Esta implementación prioriza la seguridad sobre el requerimiento original inseguro. Para cualquier modificación hacia el método inseguro, consultar los comentarios detallados en el código fuente.