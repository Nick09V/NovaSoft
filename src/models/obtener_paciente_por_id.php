<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/connect.php';

// Verificar sesión de instructor
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'message' => 'No se ha iniciado sesión como instructor']);
    exit;
}

$instructorId = $_SESSION['id'];

// Obtener ID del paciente
$pacienteId = $_GET['id'] ?? null;

if (!$pacienteId) {
    echo json_encode(['success' => false, 'message' => 'ID de paciente no proporcionado']);
    exit;
}

try {
    // Obtener datos del paciente, asegurándose de que pertenece al instructor
    $stmt = $pdo->prepare("
        SELECT id, nombre, apellido, correo, telefono, direccion, ciudad, estado
        FROM paciente 
        WHERE id = ? AND id_instructor = ?
    ");
    $stmt->execute([$pacienteId, $instructorId]);
    $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($paciente) {
        echo json_encode(['success' => true, 'paciente' => $paciente]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Paciente no encontrado o no tienes permisos']);
    }

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener datos del paciente: ' . $e->getMessage()
    ]);
}
?>