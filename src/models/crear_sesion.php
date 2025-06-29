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

// 2. Recoger datos del frontend
$serie_id = $_POST['serie_id'] ?? null;
$dolor_inicio = $_POST['dolor_inicio'] ?? null;

if (!$serie_id || !$dolor_inicio) {
    echo json_encode(['error' => 'Faltan datos obligatorios.']);
    exit;
}

try {
    // 3. Buscar asignación
    $stmt = $pdo->prepare("
        SELECT id
        FROM asignacion_serie
        WHERE paciente_id = ?
          AND serie_id = ?
        LIMIT 1
    ");
    $stmt->execute([$paciente_id, $serie_id]);
    $asig = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$asig) {
        echo json_encode(['error' => 'No se encontró asignación de la serie.']);
        exit;
    }
    $asignacion_id = $asig['id'];

    // 4. Insertar nueva sesión
    $stmt = $pdo->prepare("
        INSERT INTO sesion (asignacion_id, fecha, dolor_inicio)
        VALUES (?, NOW(), ?)
    ");
    $stmt->execute([$asignacion_id, $dolor_inicio]);

    $id_sesion = $pdo->lastInsertId();

    echo json_encode([
        'ok' => true,
        'id_sesion' => $id_sesion
    ]);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
