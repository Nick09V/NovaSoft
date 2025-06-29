<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/../../config/connect.php';

// 1. Validar sesión de paciente
$paciente_id = $_SESSION['id'] ?? null;
if (!$paciente_id) {
    echo json_encode(['error' => 'Paciente no autenticado']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            s.id AS serie_id,
            s.nombre AS serie_nombre,
            t.nombre AS terapia_nombre,
            s.numero_sesiones,
            (
                SELECT COUNT(*)
                FROM asignacion_serie a
                JOIN sesion se ON se.asignacion_id = a.id
                WHERE a.paciente_id = ?
                  AND a.serie_id = s.id
            ) AS sesiones_realizadas
        FROM serie s
        JOIN terapia t           ON t.id = s.tipo_terapia_id
        JOIN asignacion_serie a  ON a.serie_id = s.id
        WHERE a.paciente_id = ?
          AND s.asignada = TRUE
        LIMIT 1
    ");
    $stmt->execute([$paciente_id, $paciente_id]);
    $serie = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$serie) {
        echo json_encode(['error' => 'No tienes ninguna serie activa asignada.']);
        exit;
    }

    echo json_encode($serie);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
