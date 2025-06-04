<?php
session_start();
header('Content-Type: application/json');

// Verifica si hay sesión activa
if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

$correo = $_SESSION['correo'];
echo $correo;
echo "Correo en sesión: " . $_SESSION['correo'];
var_dump($_SESSION['correo']);


// Datos de conexión
$host = 'b0lflvqb9csc4alyandu-mysql.services.clever-cloud.com';
$db = 'b0lflvqb9csc4alyandu';
$user = 'uzefq8lry0rofvv9';
$pass = 'CZVclQlesL8eJd3h3CM9';
$port = '3306';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);

    $stmt = $pdo->prepare("SELECT nombre, correo, edad, genero FROM paciente WHERE correo = ?");
    $stmt->execute([$correo]);
    $paciente = $stmt->fetch();

    if ($paciente) {
        echo json_encode(['status' => 'ok', 'paciente' => $paciente]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
    }

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error al conectar con la base de datos']);
}
?>
