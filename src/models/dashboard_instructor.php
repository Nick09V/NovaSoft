<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/connect.php';

try {
    // Total pacientes activos
    $stmt = $pdo->query("SELECT COUNT(*) AS total_activos FROM paciente WHERE estado = 'activo' AND id IS NOT NULL");
    $totalActivos = $stmt->fetch()['total_activos'];

    // Pacientes sin serie asignada (ajustado para evitar problemas con NULLs)
    $stmt = $pdo->query("
        SELECT COUNT(*) AS sin_serie
        FROM paciente p
        LEFT JOIN asignacion_serie a ON p.id = a.paciente_id
        WHERE a.paciente_id IS NULL AND p.id IS NOT NULL
    ");
    $sinSerie = $stmt->fetch()['sin_serie'];

    // Sesiones completadas hoy (por fecha)
    $stmt = $pdo->query("SELECT COUNT(*) AS completadas_hoy FROM sesion WHERE fecha = CURDATE()");
    $completadasHoy = $stmt->fetch()['completadas_hoy'];

    echo json_encode([
        'status' => 'ok',
        'pacientes_activos' => $totalActivos,
        'sin_serie' => $sinSerie,
        'completadas_hoy' => $completadasHoy
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la conexión o consulta: ' . $e->getMessage()
    ]);
}
