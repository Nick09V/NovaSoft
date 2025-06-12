<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/connect.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No has iniciado sesión']);
    exit;
}

$instructorId = $_SESSION['id'];

try {
    $sql = "
        SELECT 
            p.nombre AS paciente,
            MAX(s.fecha) AS fecha,
            MAX(s.tiempo_real_minutos) AS tiempo_real_minutos,
            MAX(s.comentario) AS comentario,
            COUNT(*) AS iniciadas,
            SUM(CASE WHEN s.comentario IS NOT NULL THEN 1 ELSE 0 END) AS terminadas
        FROM sesion s
        JOIN asignacion_serie a ON s.asignacion_id = a.id
        JOIN paciente p ON a.paciente_id = p.id
        WHERE p.id_instructor = ?
        GROUP BY p.id
        ORDER BY fecha DESC
        LIMIT 5
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$instructorId]);
    $datos = $stmt->fetchAll();

    echo json_encode(['status' => 'ok', 'sesiones' => $datos]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
