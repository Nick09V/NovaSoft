<?php
/**
 * Verificador de tokens de recuperación de contraseña
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

// Obtener datos de entrada
$input = json_decode(file_get_contents('php://input'), true);
$token = trim($input['token'] ?? '');

// Validar token
if (empty($token)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Token requerido'
    ]);
    exit;
}

try {
    // Verificar si el token existe y es válido
    $stmt = $pdo->prepare("
        SELECT email, user_type, expiry, used 
        FROM password_reset_tokens 
        WHERE token = ? AND used = FALSE
    ");
    $stmt->execute([$token]);
    $tokenData = $stmt->fetch();
    
    if (!$tokenData) {
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
        // Marcar token como usado para limpieza
        $stmt = $pdo->prepare("UPDATE password_reset_tokens SET used = TRUE WHERE token = ?");
        $stmt->execute([$token]);
        
        echo json_encode([
            'status' => 'error',
            'message' => 'El token ha expirado'
        ]);
        exit;
    }
    
    // Token válido
    echo json_encode([
        'status' => 'success',
        'message' => 'Token válido',
        'data' => [
            'email' => $tokenData['email'],
            'user_type' => $tokenData['user_type']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Error verificando token: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error interno del servidor'
    ]);
} catch (Exception $e) {
    error_log("Error general verificando token: " . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al verificar el token'
    ]);
}
?>