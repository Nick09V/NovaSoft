<?php

header('Content-Type: application/json');
require_once __DIR__ . '/../config/connect.php'; 


//Se recibe los datos del paciente en formato JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!$input){
    echo json_encode(['success' => false, 'message' => 'No se recibieron datos']);
    exit;
}

$nombre = $input['nombre'] ?? '';
$apellido = $input['apellido'] ?? '';
$email = $input['email'] ?? '';
$contraseña = $input['contraseña'] ?? '';
$telefono = $input['telefono'] ?? '';
$direccion = $input['direccion'] ?? '';
$ciudad = $input['ciudad'] ?? '';

// Validar que los campos requeridos no estén vacíos
if (empty($nombre) || empty($apellido) || empty($email) || empty($contraseña)) {
    echo json_encode(['success' => false, 'message' => 'Faltan datos requeridos']);
    exit;
}

// Insertar el nuevo paciente en la base de datos
try{
    $stmt = $pdo->prepare("INSERT INTO paciente (nombre, apellido, email, contraseña, telefono, direccion, ciudad) VALUES (?, ?, ?, ?, ?, ?,?)");
    $stmt->execute([$nombre, $apellido, $email, password_hash($contraseña, PASSWORD_DEFAULT), $telefono, $direccion, $ciudad]);
    echo json_encode(['success' => true, 'message' => 'Paciente registrado correctamente']);
} catch(Exception $e) {
    // Manejo de errores
    echo json_encode(['success' => false, 'message' => 'Error al registrar el paciente: ' . $e->getMessage()]);
}



?>