<?php
session_start();
header('Content-Type: application/json');

// Verifica si la sesión contiene el correo
if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

#echo json_encode(['status' => 'ok','correo' => $_SESSION['correo']]);

$correo = $_SESSION['correo'];

// Incluye archivo que contiene la conexión $pdo
include_once __DIR__ . '/../config/connect.php';

try {
    $stmt = $pdo->prepare("SELECT nombre, correo, telefono, direccion FROM paciente WHERE correo = ?");
    $stmt->execute([$correo]);
    $paciente = $stmt->fetch();

    if ($paciente) {
        echo json_encode(['status' => 'ok', 'paciente' => $paciente]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al conectar con la base de datos',
        'detalle' => $e->getMessage()
    ]);
}
?>
