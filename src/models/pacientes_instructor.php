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
    $stmt = $pdo->prepare("
        SELECT p.id, p.nombre, p.apellido, p.ciudad, p.estado,
               (SELECT COUNT(*) FROM asignacion_serie a WHERE a.paciente_id = p.id) AS series_asignadas
        FROM paciente p
        WHERE p.id_instructor = ?
        ORDER BY p.nombre ASC
    ");
    $stmt->execute([$instructorId]);
    $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'ok', 'pacientes' => $pacientes]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
