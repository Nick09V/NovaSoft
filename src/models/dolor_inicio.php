<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/connect.php';

// 1. Validar sesión
$paciente_id = $_SESSION['id'] ?? null;
if (!$paciente_id) {
    echo json_encode(['error' => 'Paciente no autenticado']);
    exit;
}

// 2. Recoger serie_id del frontend
$serie_id = $_GET['serie_id'] ?? null;
if (!$serie_id) {
    echo json_encode(['error' => 'Serie no especificada']);
    exit;
}

// 3. Verificar existencia de asignación
$stmt = $pdo->prepare("
    SELECT a.id AS asignacion_id
    FROM asignacion_serie a
    WHERE a.paciente_id = ?
      AND a.serie_id = ?
    LIMIT 1
");
$stmt->execute([$paciente_id, $serie_id]);
$asig = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$asig) {
    echo json_encode(['error' => 'No se encontró asignación de la serie para este paciente.']);
    exit;
}

// (Opcional) podrías devolver datos de la serie aquí
echo json_encode([
    'ok' => true,
    'asignacion_id' => $asig['asignacion_id']
]);
