<?php
header('Content-Type: application/json');
session_start();

if (isset($_SESSION['id'])) {
    echo json_encode([
        'status' => 'ok',
        'usuario' => [
            'id' => $_SESSION['id'],
            'nombre' => $_SESSION['nombre'] ?? '',
            'correo' => $_SESSION['correo'] ?? '',
            'rol' => $_SESSION['rol'] ?? ''
        ]
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No hay sesión activa']);
}
