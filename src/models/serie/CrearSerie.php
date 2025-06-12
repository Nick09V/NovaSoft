<?php

include_once __DIR__ . '/../../config/connect.php';

session_start();

$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Usar solo $data para obtener los datos enviados por JSON
$nombreSerie = $data['nombreSerie'] ?? null;
$posturas = $data['posturas'] ?? null;
$numeroSesiones = $data['numeroSesiones'] ?? null;
$tipoTerapia = $data['tipoTerapia'] ?? null;
$terapiaID = $data['terapiaID'] ?? null;
$usuarioID = $data['usuarioID'] ?? null;
$id = $data['id'] ?? null;
$creador_id = $_SESSION['id'] ?? null;

if ($usuarioID === null) {
    echo json_encode(['error' => 'Falta el parámetro usuarioID']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO serie (nombre, tipo_terapia_id, numero_sesiones, creador_id, asignada) VALUES (:nombreSerie, :terapiaID, :numeroSesiones, :creador_id, :asignada)');
    $stmt->execute([
        'nombreSerie' => $nombreSerie,
        'numeroSesiones' => $numeroSesiones,
        'creador_id' => $creador_id,
        'terapiaID' => $terapiaID,
        'asignada' => 0 // Asignada inicialmente como 0
    ]);
    $serie_id = $pdo->lastInsertId();
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

try {
    $contador = 0;
    foreach ($posturas as $postura) {
        $contador++;
        $id = $postura['id'];
        $minutos = $postura['minutos'];
        $stmt = $pdo->prepare('INSERT INTO serie_postura (serie_id, postura_id, orden, duracion_min) VALUES (:serie_id, :paciente_id, :orden, :duracion_min)');
        $stmt->execute([
            'serie_id' => $serie_id,
            'paciente_id' => $id,
            'orden' => $contador,
            'duracion_min' => $minutos
        ]);
    }
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

//asignar la serie al paciente
try {
    $fecha_asignacion = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare('INSERT INTO asignacion_serie (paciente_id, serie_id, fecha_asignacion) VALUES (:id, :serie_id , :fecha_asignacion)');
    $stmt->execute([
        'id' => $usuarioID,
        'serie_id' => $serie_id,
        'fecha_asignacion' => $fecha_asignacion
    ]);
    echo json_encode(['ok' => true, 'serie_id' => $serie_id]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
?>