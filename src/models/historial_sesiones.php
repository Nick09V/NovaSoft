<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/connect.php';

if (!isset($_SESSION['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No ha iniciado sesión']);
    exit;
}

$instructorId = $_SESSION['id'];

try {
    $stmt = $pdo->prepare("
        SELECT s.fecha, s.dolor_inicio, s.dolor_fin, s.comentario, s.tiempo_real_minutos,
               CONCAT(p.nombre, ' ', p.apellido) AS paciente
        FROM sesion s
        JOIN asignacion_serie a ON s.asignacion_id = a.id
        JOIN paciente p ON a.paciente_id = p.id
        WHERE p.id_instructor = ?
        ORDER BY s.fecha DESC
    ");
    $stmt->execute([$instructorId]);
    $sesiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'ok', 'sesiones' => $sesiones]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
