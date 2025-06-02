<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


require_once __DIR__ . '/../config/connect.php'; // Asegúrate de que este archivo define $pdo

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nombre'], $input['correo'], $input['contrasena'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit;
}

$nombre = $input['nombre'];
$email = $input['correo'];
$contrasena = password_hash($input['contrasena'], PASSWORD_DEFAULT);

try {
    // Verifica si el correo ya está registrado
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM instructor WHERE correo = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['error' => 'El correo ya está registrado', 'ok' => false]);
        exit;
    }

    // Inserta nuevo instructor
    $stmt = $pdo->prepare("INSERT INTO instructor (nombre, correo, contrasena) VALUES (?, ?, ?)");
    $stmt->execute([$nombre, $email, $contrasena]);

    echo json_encode(['ok' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error en la base de datos',
        'message' => $e->getMessage(), // Muestra el error real para depurar
        'ok' => false
    ]);
}
