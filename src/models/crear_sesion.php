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
$asignacionId = $data['asignacion_id'] ?? null;
$dolorInicialValor = $data['dolor_inicial'] ?? null;

if (!$asignacionId || $dolorInicialValor === null) {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
    exit;
}

// Convertir número a texto
$dolorTexto = convertirDolorANivel($dolorInicialValor);

include_once __DIR__ . '/../config/connect.php';

try {
    $stmt = $pdo->prepare("
        INSERT INTO sesion (asignacion_id, fecha, dolor_inicio, dolor_fin, comentario, tiempo_real_minutos)
        VALUES (?, NOW(), ?, NULL, NULL, NULL)
    ");
    $stmt->execute([$asignacionId, $dolorTexto]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'ok',
        'sesion_id' => $newId
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos',
        'detalle' => $e->getMessage()
    ]);
}

function convertirDolorANivel($valor) {
    if ($valor == 0) {
        return 'SIN DOLOR';
    } elseif ($valor >= 1 && $valor <= 3) {
        return 'LEVE';
    } elseif ($valor >= 4 && $valor <= 6) {
        return 'MODERADO';
    } else {
        return 'SEVERO';
    }
}
