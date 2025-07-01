<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$asignacionId = $data['asignacion_id'] ?? null;
$dolorInicialValor = $data['dolor_inicial'] ?? null;

if (!$asignacionId || $dolorInicialValor === null) {
    echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
    exit;
}

// El valor ya viene como texto desde el frontend (SIN DOLOR, LEVE, MODERADO, etc.)
$dolorTexto = $dolorInicialValor;

include_once __DIR__ . '/../config/connect.php';

try {
    // Verificar que el valor de dolor sea válido para el ENUM
    $valoresPermitidos = ['SIN DOLOR', 'LEVE', 'MODERADO', 'INTENSO', 'MÁXIMO'];
    if (!in_array($dolorTexto, $valoresPermitidos)) {
        throw new Exception("Valor de dolor no válido: " . $dolorTexto);
    }

    // NUEVA VALIDACIÓN: Verificar que no se exceda el número máximo de sesiones
    $stmt = $pdo->prepare("
        SELECT 
            s.numero_sesiones,
            (SELECT COUNT(*) FROM sesion WHERE asignacion_id = ?) as sesiones_realizadas
        FROM asignacion_serie a
        JOIN serie s ON a.serie_id = s.id
        WHERE a.id = ?
    ");
    $stmt->execute([$asignacionId, $asignacionId]);
    $validacion = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$validacion) {
        throw new Exception("Asignación no encontrada");
    }

    if ($validacion['sesiones_realizadas'] >= $validacion['numero_sesiones']) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Has completado todas las sesiones disponibles para esta serie (' . $validacion['numero_sesiones'] . ' sesiones)',
            'sesiones_completadas' => true
        ]);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO sesion (asignacion_id, dolor_inicio, comentario)
        VALUES (?, ?, 'Sesión iniciada')
    ");
    $stmt->execute([$asignacionId, $dolorTexto]);

    $newId = $pdo->lastInsertId();

    echo json_encode([
        'status' => 'ok',
        'sesion_id' => $newId
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos',
        'detalle' => $e->getMessage()
    ]);
}
?>