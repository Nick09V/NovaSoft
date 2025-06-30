<?php
header('Content-Type: application/json');
session_start();

if (!isset($_SESSION['correo'])) {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no iniciada']);
    exit;
}

$correo = $_SESSION['correo'];

include_once __DIR__ . '/../config/connect.php';

try {
    // Paso 1: obtener ID del paciente
    $stmt = $pdo->prepare("SELECT id FROM paciente WHERE correo = ?");
    $stmt->execute([$correo]);
    $pacienteId = $stmt->fetchColumn();

    if (!$pacienteId) {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
        exit;
    }

    // Paso 2: buscar la serie asignada
    $stmt = $pdo->prepare("
        SELECT 
            s.id AS serie_id,
            s.nombre AS serie_nombre,
            s.numero_sesiones,
            t.nombre AS terapia_nombre,
            a.id AS asignacion_id
        FROM asignacion_serie a
        JOIN serie s ON a.serie_id = s.id
        LEFT JOIN terapia t ON s.tipo_terapia_id = t.id
        WHERE a.paciente_id = ?
        ORDER BY a.fecha_asignacion DESC
        LIMIT 1
    ");
    $stmt->execute([$pacienteId]);
    $serie = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$serie) {
        echo json_encode(['status' => 'error', 'message' => 'No tienes ninguna serie asignada.']);
        exit;
    }

    // Paso 3: contar sesiones realizadas
    $stmt = $pdo->prepare("
        SELECT COUNT(*) 
        FROM sesion 
        WHERE asignacion_id = ?
    ");
    $stmt->execute([$serie['asignacion_id']]);
    $sesionesRealizadas = $stmt->fetchColumn();

    $serie['sesiones_realizadas'] = $sesionesRealizadas;

    echo json_encode([
        'status' => 'ok',
        'serie' => $serie
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en base de datos',
        'detalle' => $e->getMessage()
    ]);
}
?>


