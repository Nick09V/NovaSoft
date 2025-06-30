<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

include_once __DIR__ . '/../config/connect.php';

// Obtener datos enviados desde el frontend
$input = json_decode(file_get_contents('php://input'), true);

$sesionId = $input['sesion_id'] ?? null;
$dolorFin = $input['dolor_fin'] ?? null;
$comentario = $input['comentario'] ?? null;
$tiempoReal = $input['tiempo_real'] ?? null;

if (!$sesionId || !$dolorFin) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        UPDATE sesion
        SET 
            dolor_fin = ?,
            comentario = ?,
            tiempo_real_minutos = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $dolorFin,
        $comentario,
        $tiempoReal,
        $sesionId
    ]);

    echo json_encode(['status' => 'ok']);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al actualizar sesión',
        'detalle' => $e->getMessage()
    ]);
}
?>
