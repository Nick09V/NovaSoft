<?php
// Conexión a la base de datos (ajusta los valores según tu configuración)
require_once __DIR__ . '/../config/connect.php';
// Se espera que $conn esté definido en connect.php


header('Content-Type: application/json');

// Obtener el JSON recibido
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nombre'], $input['correo'], $input['contrasena'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan datos requeridos']);
    exit;
}

$nombre = $input['nombre'];
$correo = $input['correo'];
$contrasena = password_hash($input['contrasena'], PASSWORD_DEFAULT);
$confContrasena = $input['contrasena'];

try {
    #$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    #$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Comprobar si el correo ya existe
    #$stmt = $pdo->prepare("SELECT COUNT(*) FROM instructores WHERE correo = ?");
    #$stmt->execute([$correo]);
    #if ($stmt->fetchColumn() > 0) {
     #   echo json_encode(['error' => 'El correo ya está registrado']);
      #  exit;
    #}

    // Insertar nuevo instructor
    #$stmt = $pdo->prepare("INSERT INTO instructores (nombre, correo, contrasena) VALUES (?, ?, ?)");
    #$stmt->execute([$nombre, $correo, $contrasena]);

    echo json_encode(['success' => 'Instructor registrado correctamente']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos']);
}
?>

