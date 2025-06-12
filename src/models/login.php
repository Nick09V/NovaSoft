<?php
header('Content-Type: application/json');
session_start();

session_start();

// Datos de conexión a Clever Cloud
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
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de conexión a la base de datos']);
    exit;
}

// Solo aceptar método POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $username = $input['username'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
        exit;
    }

    // Buscar en tabla instructor
    $stmt = $pdo->prepare("SELECT id, nombre, correo, contrasena FROM instructor WHERE correo = ?");
    $stmt->execute([$username]);
    $instructor = $stmt->fetch();

    if ($instructor && password_verify($password, $instructor['contrasena'])) {
        // Asignar valores a $_SESSION
        $_SESSION['id'] = $instructor['id'];
        $_SESSION['correo'] = $instructor['correo'];
        $_SESSION['nombre'] = $instructor['nombre'];
        $_SESSION['rol'] = 'instructor';

        echo json_encode([
            'status' => 'ok',
            'rol' => 'instructor',
            'usuario' => [
                'nombre' => $instructor['nombre'],
                'correo' => $instructor['correo'],
                'rol' => 'instructor',
                'session' => session_id()
            ]
        ]);
        exit;
    } else {


        // Buscar en tabla paciente si no se encontró en instructor
    $stmt = $pdo->prepare("SELECT nombre, contrasena FROM paciente WHERE correo = ?");
    $stmt->execute([$username]);
    $paciente = $stmt->fetch();

    if ($paciente && password_verify($password, $paciente['contrasena'])) {

        // Registro de sesión para paciente
        $_SESSION['correo'] = $username;
        $_SESSION['rol'] = 'paciente';

        echo json_encode([
            'status' => 'ok',
            'rol' => 'paciente',
            'usuario' => [
                'nombreeeee' => $paciente['nombre'],
                'rol' => 'paciente',
                'correo' => $_SESSION['correo'] 
            ]
        ]);

       
    }else{
        echo json_encode(['status' => 'error', 'message' => 'Credenciales incorrectas']);
        exit;
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    exit;
}