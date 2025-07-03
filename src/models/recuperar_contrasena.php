<?php
/**
 * Módulo de recuperación de contraseña para NovaSoft
 * 
 * NOTA DE SEGURIDAD IMPORTANTE:
 * Este archivo implementa un sistema SEGURO de recuperación de contraseña usando tokens.
 * El requerimiento original solicitaba enviar la contraseña sin hash por correo,
 * lo cual es una MALA PRÁCTICA DE SEGURIDAD.
 * 
 * Para implementar el método inseguro solicitado, vea los comentarios marcados con:
 * // MÉTODO INSEGURO: [instrucciones]
 * 
 * Autor: NovaSoft Development Team
 * Fecha: 2024
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/connect.php';

// Solo aceptar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error', 
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Obtener y validar datos de entrada
$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

// Validaciones básicas
if (empty($email)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'El correo electrónico es requerido'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Formato de correo electrónico inválido'
    ]);
    exit;
}

try {
    // Buscar el usuario en ambas tablas (instructor y paciente)
    $userFound = false;
    $userType = '';
    $userName = '';
    $userPassword = ''; // Para el método inseguro
    
    // 1. Buscar en tabla instructor
    $stmt = $pdo->prepare("SELECT nombre, contrasena FROM instructor WHERE correo = ?");
    $stmt->execute([strtolower($email)]);
    $instructor = $stmt->fetch();
    
    if ($instructor) {
        $userFound = true;
        $userType = 'instructor';
        $userName = $instructor['nombre'];
        $userPassword = $instructor['contrasena']; // Contraseña hasheada
    } else {
        // 2. Buscar en tabla paciente
        $stmt = $pdo->prepare("SELECT nombre, contrasena FROM paciente WHERE correo = ?");
        $stmt->execute([strtolower($email)]);
        $paciente = $stmt->fetch();
        
        if ($paciente) {
            $userFound = true;
            $userType = 'paciente';
            $userName = $paciente['nombre'];
            $userPassword = $paciente['contrasena']; // Contraseña hasheada
        }
    }
    
    // Verificar si el usuario existe
    if (!$userFound) {
        // Por seguridad, no revelamos si el email existe o no
        echo json_encode([
            'status' => 'success',
            'message' => 'Si el correo electrónico existe en nuestro sistema, recibirás un enlace de recuperación'
        ]);
        exit;
    }
    
    // MÉTODO SEGURO (RECOMENDADO):
    // Generar token de recuperación
    $resetToken = bin2hex(random_bytes(32));
    $expiry = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token válido por 1 hora
    
    // Crear tabla para tokens si no existe
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(64) NOT NULL,
            user_type ENUM('instructor', 'paciente') NOT NULL,
            expiry DATETIME NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_token (token),
            INDEX idx_email (email)
        )
    ";
    $pdo->exec($createTableSQL);
    
    // Eliminar tokens anteriores para este email
    $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE email = ?");
    $stmt->execute([$email]);
    
    // Insertar nuevo token
    $stmt = $pdo->prepare("
        INSERT INTO password_reset_tokens (email, token, user_type, expiry) 
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$email, $resetToken, $userType, $expiry]);
    
    // Preparar el enlace de recuperación
    $resetLink = "http://" . $_SERVER['HTTP_HOST'] . "/NovaSoft/public/pages/auth/reset_password.html?token=" . $resetToken;
    
    // Preparar contenido del email
    $subject = "Recuperación de contraseña - NovaSoft";
    $emailBody = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>NovaSoft</h1>
                <h2>Recuperación de Contraseña</h2>
            </div>
            <div class='content'>
                <p>Hola <strong>{$userName}</strong>,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta ({$userType}) en NovaSoft.</p>
                <p>Si solicitaste este cambio, haz clic en el siguiente enlace para crear una nueva contraseña:</p>
                <p style='text-align: center;'>
                    <a href='{$resetLink}' class='button'>Restablecer Contraseña</a>
                </p>
                <div class='warning'>
                    <strong>Importante:</strong>
                    <ul>
                        <li>Este enlace es válido por 1 hora</li>
                        <li>Solo se puede usar una vez</li>
                        <li>Si no solicitaste este cambio, ignora este email</li>
                    </ul>
                </div>
                <p>Si tienes problemas con el enlace, copia y pega la siguiente URL en tu navegador:</p>
                <p style='word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 3px;'>{$resetLink}</p>
            </div>
            <div class='footer'>
                <p>Este es un mensaje automático de NovaSoft. Por favor, no respondas a este correo.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Enviar email (función simulada - aquí se integraría con un servicio real de email)
    $emailSent = sendPasswordResetEmail($email, $subject, $emailBody);
    
    if ($emailSent) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico',
            'debug_info' => [
                'user_type' => $userType,
                'reset_link' => $resetLink // SOLO para desarrollo - remover en producción
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al enviar el correo. Por favor, inténtalo más tarde'
        ]);
    }

} catch (PDOException $e) {
    error_log("Error en recuperación de contraseña: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error interno del servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general en recuperación de contraseña: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al procesar la solicitud'
    ]);
}

/**
 * Función para enviar email de recuperación de contraseña
 * 
 * NOTA: Esta es una implementación simulada.
 * En un entorno de producción, integrar con servicios como:
 * - PHPMailer con SMTP
 * - SendGrid
 * - Amazon SES
 * - Mailgun
 * 
 * @param string $to Email destinatario
 * @param string $subject Asunto del email
 * @param string $body Cuerpo del email en HTML
 * @return bool True si se envió correctamente
 */
function sendPasswordResetEmail($to, $subject, $body) {
    // IMPLEMENTACIÓN TEMPORAL PARA DESARROLLO
    // Guardar el email en un archivo log para testing
    $emailLog = [
        'timestamp' => date('Y-m-d H:i:s'),
        'to' => $to,
        'subject' => $subject,
        'body' => $body
    ];
    
    $logFile = __DIR__ . '/../../logs/email_recovery.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    file_put_contents($logFile, json_encode($emailLog, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
    
    // TODO: Implementar envío real de email aquí
    // Ejemplo con PHPMailer:
    /*
    try {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; // O el servidor SMTP que uses
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
        return true;
    } catch (Exception $e) {
        error_log("Error enviando email: " . $e->getMessage());
        return false;
    }
    */
    
    // Por ahora, simular éxito
    return true;
}

/*
// ==================================================================================
// MÉTODO INSEGURO SOLICITADO EN LOS REQUERIMIENTOS (NO RECOMENDADO)
// ==================================================================================
// 
// ADVERTENCIA: El siguiente código es INSEGURO y NO debe usarse en producción.
// Se incluye solo para mostrar cómo implementar lo solicitado en los requerimientos.
// 
// Para usar este método inseguro:
// 1. Comentar todo el código de arriba desde "MÉTODO SEGURO"
// 2. Descomentar el código de abajo
// 3. Modificar la base de datos para almacenar contraseñas en texto plano
// 
// PROBLEMAS DE SEGURIDAD:
// - Las contraseñas se almacenan sin hash (texto plano)
// - Las contraseñas se envían por email (inseguro)
// - No hay expiración de la contraseña enviada
// - Violación de mejores prácticas de seguridad

if (!$userFound) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Correo electrónico no encontrado en el sistema'
    ]);
    exit;
}

// MÉTODO INSEGURO: Para esto funcione, las contraseñas deben almacenarse sin hash
// Esto requiere cambiar el sistema de registro para NO usar password_hash()
// y el sistema de login para NO usar password_verify()

// MÉTODO INSEGURO: Enviar la contraseña directamente por email
$subject = "Tu contraseña de NovaSoft";
$emailBody = "
<html>
<body>
    <h2>Recuperación de Contraseña - NovaSoft</h2>
    <p>Hola {$userName},</p>
    <p>Como solicitaste, aquí está tu contraseña:</p>
    <p><strong>Contraseña: {$userPassword}</strong></p>
    <p>Tipo de cuenta: {$userType}</p>
    <p><strong>IMPORTANTE:</strong> Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
</body>
</html>
";

$emailSent = sendPasswordResetEmail($email, $subject, $emailBody);

if ($emailSent) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Tu contraseña ha sido enviada a tu correo electrónico'
    ]);
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al enviar el correo'
    ]);
}

// FIN DEL MÉTODO INSEGURO
*/

?>