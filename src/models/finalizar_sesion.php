<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$sesionId = $data['sesion_id'] ?? null;
$dolorFinal = $data['dolor_final'] ?? null;
$tiempoTotalMinutos = $data['tiempo_total_minutos'] ?? 0;

if (!$sesionId || !$dolorFinal) {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
    exit;
}

// Verificar que el valor de dolor sea válido para el ENUM
$valoresPermitidos = ['SIN DOLOR', 'LEVE', 'MODERADO', 'INTENSO', 'MÁXIMO'];
if (!in_array($dolorFinal, $valoresPermitidos)) {
    echo json_encode(['status' => 'error', 'message' => 'Valor de dolor no válido']);
    exit;
}

include_once __DIR__ . '/../config/connect.php';

try {
    // Actualizar la sesión con el dolor final y tiempo total
    $stmt = $pdo->prepare("
        UPDATE sesion 
        SET dolor_fin = ?, 
            comentario = CONCAT(comentario, ' - Sesión completada'),
            tiempo_real_minutos = ?
        WHERE id = ?
    ");
    
    $stmt->execute([$dolorFinal, $tiempoTotalMinutos, $sesionId]);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'status' => 'ok',
            'message' => 'Sesión finalizada correctamente',
            'sesion_id' => $sesionId,
            'dolor_final' => $dolorFinal,
            'tiempo_total' => $tiempoTotalMinutos
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo actualizar la sesión'
        ]);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos',
        'detalle' => $e->getMessage()
    ]);
}
?>
