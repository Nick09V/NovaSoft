<?php
require_once '../../config/connect.php';
header('Content-Type: application/json');

// Obtener el cuerpo de la petición
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['serieID']) || !isset($input['pacienteID'])) {
    echo json_encode(['error' => 'Datos incompletos para asociar la serie al paciente.']);
    exit;
}

$serieID = intval($input['serieID']);
$pacienteID = intval($input['pacienteID']);

// Validar que la serie y el paciente existan
try {
    //$pdo = conectar();
    //Verificar existencia de paciente
    /*$stmt = $pdo->prepare('SELECT id FROM paciente WHERE id = ?');
    $stmt->execute([$pacienteID]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'El paciente no existe.']);
        exit;
    }
    // Verificar existencia de serie
    $stmt = $pdo->prepare('SELECT id FROM serie WHERE id = ?');
    $stmt->execute([$serieID]);
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'La serie no existe.']);
        exit;
    }*/
    // Verificar si ya existe la asignación
    $stmt = $pdo->prepare('SELECT id FROM asignacion_serie WHERE paciente_id = ? AND serie_id = ?');
    $stmt->execute([$pacienteID, $serieID]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['error' => 'La serie ya está asociada a este paciente.']);
        exit;
    }
    // Insertar la asignación
    $stmt = $pdo->prepare('INSERT INTO asignacion_serie (paciente_id, serie_id) VALUES (?, ?)');
    if ($stmt->execute([$pacienteID, $serieID])) {
        echo json_encode(['ok' => true, 'message' => 'Serie asociada correctamente al paciente.']);
    } else {
        echo json_encode(['error' => 'No se pudo asociar la serie al paciente.']);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error de base de datos: ' . $e->getMessage()]);
}

