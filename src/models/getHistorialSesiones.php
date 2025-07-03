<?php
session_start();
require_once __DIR__ . '/../config/connect.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No autenticado']);
    exit;
}

$paciente_id = $_SESSION['id'];

$sql = "SELECT 
            s.id AS sesion_id,
            s.fecha AS fecha_inicio,
            s.dolor_inicio,
            s.dolor_fin,
            s.comentario,
            s.tiempo_real_minutos,
            a.fecha_asignacion,
            se.nombre AS nombre_serie
        FROM sesion s
        JOIN asignacion_serie a ON s.asignacion_id = a.id
        JOIN serie se ON a.serie_id = se.id
        WHERE a.paciente_id = ?
        ORDER BY s.fecha DESC";

$stmt = $pdo->prepare($sql);
$stmt->execute([$paciente_id]);
$sesiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['status' => 'ok', 'sesiones' => $sesiones]);
?>