<?php
header('Content-Type: application/json');

$usuario = 
    [
        'nombre' => 'Juan Pérez',
        'rol' => 'instructor'
    ]
;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
// Obtener datos del POST como JSON
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    // Simulación de verificación (si ambos campos no están vacíos)
    if (!empty($username) && !empty($password)) {
        echo json_encode(['status' => 'ok', 'rol' => 'instructor', 'usuario' => $usuario]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>