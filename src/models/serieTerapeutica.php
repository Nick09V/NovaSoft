<?php
require_once __DIR__ . '/../config/connect.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nombreSerieTerapeutica'], $input['terapia'])) {
    echo json_encode(['error' => 'Faltan datos requeridos', 'ok' => false]);
    exit;
}

// Aquí iría tu lógica para guardar en la base de datos...

echo json_encode(['ok' => true, 'message' => 'Serie registrada exitosamente']);
?>