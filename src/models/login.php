<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/connect.php';

session_start();

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
    $stmt = $pdo->prepare("SELECT nombre, contrasena FROM instructor WHERE correo = ?");
    $stmt->execute([$username]);
    $instructor = $stmt->fetch();

    if ($instructor && password_verify($password, $instructor['contrasena'])) {
        $stmt = $pdo->prepare("SELECT id FROM instructor WHERE correo = ?");
        $stmt->execute([$username]);
        $_SESSION['id'] = $stmt->fetchColumn();
        $_SESSION['correo'] = $username;
        $_SESSION['rol'] = 'instructor';
        $_SESSION['nombre'] = $instructor['nombre'];


        echo json_encode([
            'status' => 'ok',
            'rol' => 'instructor',
            'usuario' => [
                'nombre' => $instructor['nombre'],
                'rol' => 'instructor',
                'correo' => $_SESSION['correo'],
                'session' => $_SESSION['id']
            ]
        ]);
        exit;
    }

    // Buscar en tabla paciente si no se encontró en instructor
    $stmt = $pdo->prepare("SELECT id, nombre, contrasena, estado FROM paciente WHERE correo = ?");
    $stmt->execute([$username]);
    $paciente = $stmt->fetch();

    if ($paciente && password_verify($password, $paciente['contrasena']) && strtolower($paciente['estado']) === 'activo') {

        $_SESSION['id'] = $paciente['id'];
        $_SESSION['correo'] = $username;
        $_SESSION['rol'] = 'paciente';
        $_SESSION['nombre'] = $paciente['nombre'];

        echo json_encode([
            'status' => 'ok',
            'rol' => 'paciente',
            'usuario' => [
                'nombreeeee' => $paciente['nombre'],
                'rol' => 'paciente',
                'correo' => $_SESSION['correo'],
                'session' => $_SESSION['id'],
                'estado' => $paciente['estado']
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Credenciales incorrectas o cuenta inactiva']);
    }

} else {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
}
?>