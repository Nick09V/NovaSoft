<?php
// Conexión a la base de datos (ajusta los valores según tu configuración)
require_once __DIR__ . '/../config/connect.php';
// Se espera que $conn esté definido en connect.php


header('Content-Type: application/json');

// Obtener el JSON recibido
$input = json_decode(file_get_contents('php://input'), true);

echo json_encode('error' -> 'Faltan datos requeridos', 'ok' => true);

?>
