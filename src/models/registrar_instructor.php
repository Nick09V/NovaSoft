<?php
// Conexión a la base de datos (ajusta los valores según tu configuración)
require_once __DIR__ . '/../config/connect.php';
// Se espera que $conn esté definido en connect.php


#header('Content-Type: application/json');

// Obtener el JSON recibido
//$input = json_decode(file_get_contents('php://input'), true);

$nombre = $_POST['nombre'] ?? '';
$email = $_POST['correo'] ?? '';
$contrasena = isset($_POST['contrasena']) ? password_hash($_POST['contrasena'], PASSWORD_DEFAULT) : '';
$apellido = $_POST['apellido'] ?? '';
$especialidad = $_POST['especialidad'] ?? '';


if (isset($_FILES['licencia']) && $_FILES['licencia']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['licencia']['tmp_name'];
    $fileName = $_FILES['licencia']['name'];
    $fileSize = $_FILES['licencia']['size'];
    $fileType = $_FILES['licencia']['type'];
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Validar que sea PDF
    if ($fileExtension !== 'pdf') {
        echo json_encode(['error' => 'Solo se permiten archivos PDF']);
        exit;
    }


}
// Insertar el nuevo paciente en la base de datos
try{
    
    
    // Comprobar si el correo ya existe
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM instructor WHERE correo = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
       echo json_encode(['error' => 'El correo ya está registrado', 'ok' => false]);
        exit;
    }else {
        // Insertar nuevo instructor
        $stmt = $pdo->prepare("INSERT INTO `instructor`(`nombre`,
        `apellido`,`correo`,`contrasena`,`estado`,`especialidad`)
VALUES
(?,
?,
?,
?,
?,
?);");
        $stmt->execute([$nombre, $apellido, $email, $contrasena, 1, $especialidad ]);
        echo json_encode(['ok' => true]);
    }

    

 
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos', 'ok' => false]);
}
?>

