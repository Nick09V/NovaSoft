<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/connect.php'; 

// Verificar sesión
if (!isset($_SESSION['id'])) {
    echo json_encode(['success' => false, 'message' => 'No se ha iniciado sesión como instructor']);
    exit;
}

$instructorId = $_SESSION['id'];

// Recibir datos del paciente
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos']);
    exit;
}

// Limpiar y normalizar
$nombre     = trim($input['nombre'] ?? '');
$apellido   = trim($input['apellido'] ?? '');
$correo     = strtolower(trim($input['correo'] ?? ''));
$contrasena = trim($input['contrasena'] ?? '');
$telefono   = trim($input['telefono'] ?? '');
$direccion  = trim($input['direccion'] ?? '');
$ciudad     = trim($input['ciudad'] ?? '');

// Validar campos obligatorios
if (empty($nombre) || empty($apellido) || empty($correo) || empty($contrasena)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

try {
    // Validar si el correo ya existe
    $stmt = $pdo->prepare("SELECT id FROM paciente WHERE correo = ?");
    $stmt->execute([$correo]);

    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'El correo ya está registrado.']);
        exit;
    }

    // Insertar paciente si pasó la validación
    $stmt = $pdo->prepare("
        INSERT INTO paciente 
        (nombre, apellido, correo, contrasena, telefono, direccion, ciudad, id_instructor) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $nombre, $apellido, $correo, password_hash($contrasena, PASSWORD_DEFAULT),
        $telefono, $direccion, $ciudad, $instructorId
    ]);

    echo json_encode(['success' => true, 'message' => 'Paciente registrado correctamente']);
    exit;

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar el paciente: ' . $e->getMessage()
    ]);
    exit;
}
