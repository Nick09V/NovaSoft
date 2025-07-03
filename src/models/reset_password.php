<?php
/**
 * Procesador de restablecimiento de contraseña
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
$token = trim($input['token'] ?? '');
$newPassword = trim($input['new_password'] ?? '');

// Validaciones básicas
if (empty($token)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token requerido'
    ]);
    exit;
}

if (empty($newPassword)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Nueva contraseña requerida'
    ]);
    exit;
}

// Validar fortaleza de la contraseña
$passwordValidation = validatePasswordStrength($newPassword);
if (!$passwordValidation['valid']) {
    echo json_encode([
        'status' => 'error',
        'message' => $passwordValidation['message']
    ]);
    exit;
}

try {
    // Iniciar transacción
    $pdo->beginTransaction();
    
    // Verificar token y obtener datos del usuario
    $stmt = $pdo->prepare("
        SELECT email, user_type, expiry, used 
        FROM password_reset_tokens 
        WHERE token = ? AND used = FALSE
    ");
    $stmt->execute([$token]);
    $tokenData = $stmt->fetch();
    
    if (!$tokenData) {
        $pdo->rollBack();
        echo json_encode([
            'status' => 'error',
            'message' => 'Token inválido o ya utilizado'
        ]);
        exit;
    }
    
    // Verificar si el token ha expirado
    $now = new DateTime();
    $expiry = new DateTime($tokenData['expiry']);
    
    if ($now > $expiry) {
        $pdo->rollBack();
        echo json_encode([
            'status' => 'error',
            'message' => 'El token ha expirado'
        ]);
        exit;
    }
    
    // Hash de la nueva contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Actualizar contraseña según el tipo de usuario
    if ($tokenData['user_type'] === 'instructor') {
        $stmt = $pdo->prepare("UPDATE instructor SET contrasena = ? WHERE correo = ?");
    } else if ($tokenData['user_type'] === 'paciente') {
        $stmt = $pdo->prepare("UPDATE paciente SET contrasena = ? WHERE correo = ?");
    } else {
        $pdo->rollBack();
        echo json_encode([
            'status' => 'error',
            'message' => 'Tipo de usuario inválido'
        ]);
        exit;
    }
    
    $stmt->execute([$hashedPassword, $tokenData['email']]);
    
    // Verificar que se actualizó correctamente
    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al actualizar la contraseña. Usuario no encontrado.'
        ]);
        exit;
    }
    
    // Marcar token como usado
    $stmt = $pdo->prepare("UPDATE password_reset_tokens SET used = TRUE WHERE token = ?");
    $stmt->execute([$token]);
    
    // Limpiar tokens expirados (mantenimiento)
    $stmt = $pdo->prepare("DELETE FROM password_reset_tokens WHERE expiry < NOW() OR used = TRUE");
    $stmt->execute();
    
    // Confirmar transacción
    $pdo->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Contraseña restablecida exitosamente',
        'data' => [
            'user_type' => $tokenData['user_type'],
            'email' => $tokenData['email']
        ]
    ]);
    
} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Error restableciendo contraseña: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error interno del servidor'
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    error_log("Error general restableciendo contraseña: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al restablecer la contraseña'
    ]);
}

/**
 * Valida la fortaleza de la contraseña
 * @param string $password - Contraseña a validar
 * @return array - Resultado de la validación
 */
function validatePasswordStrength($password) {
    $errors = [];
    
    // Longitud mínima
    if (strlen($password) < 8) {
        $errors[] = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    // Al menos una mayúscula
    if (!preg_match('/[A-Z]/', $password)) {
        $errors[] = 'La contraseña debe contener al menos una letra mayúscula';
    }
    
    // Al menos una minúscula
    if (!preg_match('/[a-z]/', $password)) {
        $errors[] = 'La contraseña debe contener al menos una letra minúscula';
    }
    
    // Al menos un número
    if (!preg_match('/\d/', $password)) {
        $errors[] = 'La contraseña debe contener al menos un número';
    }
    
    // Verificar caracteres especiales (opcional, pero recomendado)
    // if (!preg_match('/[!@#$%^&*(),.?":{}|<>]/', $password)) {
    //     $errors[] = 'La contraseña debe contener al menos un carácter especial';
    // }
    
    if (empty($errors)) {
        return ['valid' => true];
    } else {
        return [
            'valid' => false,
            'message' => implode('. ', $errors)
        ];
    }
}
?>