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

// Recibir datos actualizados del paciente
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos']);
    exit;
}

// Obtener y limpiar datos
$pacienteId = $input['id'] ?? null;
$nombre     = trim($input['nombre'] ?? '');
$apellido   = trim($input['apellido'] ?? '');
$correo     = strtolower(trim($input['correo'] ?? ''));
$telefono   = trim($input['telefono'] ?? '');
$direccion  = trim($input['direccion'] ?? '');
$ciudad     = trim($input['ciudad'] ?? '');
$estado     = $input['estado'] ?? 'activo'; // ← AGREGAR esta línea

// Debug logs
error_log("Datos recibidos: " . json_encode($input));
error_log("Estado recibido: " . $estado);

// Validar campos obligatorios - QUITAR telefono de requeridos
if (!$pacienteId || empty($nombre) || empty($apellido) || empty($correo) || empty($direccion) || empty($ciudad)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

try {
    // Verificar que el paciente pertenece al instructor
    $stmt = $pdo->prepare("SELECT id FROM paciente WHERE id = ? AND id_instructor = ?");
    $stmt->execute([$pacienteId, $instructorId]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Paciente no encontrado o no tienes permisos']);
        exit;
    }

    // Verificar si el correo ya existe para otro paciente
    $stmt = $pdo->prepare("SELECT id FROM paciente WHERE correo = ? AND id != ?");
    $stmt->execute([$correo, $pacienteId]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado para otro paciente']);
        exit;
    }

    // ⭐ CORREGIR: Actualizar datos del paciente INCLUYENDO EL ESTADO
    $stmt = $pdo->prepare("
        UPDATE paciente 
        SET nombre = ?, apellido = ?, correo = ?, telefono = ?, direccion = ?, ciudad = ?, estado = ?
        WHERE id = ? AND id_instructor = ?
    ");
    $stmt->execute([$nombre, $apellido, $correo, $telefono, $direccion, $ciudad, $estado, $pacienteId, $instructorId]);

    // Debug de la actualización
    error_log("Filas afectadas: " . $stmt->rowCount());
    error_log("Estado actualizado a: " . $estado);

    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true, 
            'message' => 'Paciente actualizado correctamente',
            'debug' => [
                'estado_actualizado' => $estado,
                'filas_afectadas' => $stmt->rowCount()
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'No se realizaron cambios']);
    }

} catch (PDOException $e) {
    error_log("Error PDO: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar el paciente: ' . $e->getMessage()
    ]);
}
?>