<?php
header('Content-Type: application/json');

$usuario = 
    [
        'nombre' => 'Juan Pérez',
        'rol' => 'Administrador'
    ]
;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener datos del POST
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Simulación de verificación (si ambos campos no están vacíos)
    if (!empty($username) && !empty($password)) {
        echo json_encode(['status' => 'ok', 'rol' => 'admin']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>