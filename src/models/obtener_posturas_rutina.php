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

if (!$asignacionId) {
    echo json_encode(['status' => 'error', 'message' => 'ID de asignación requerido']);
    exit;
}

$correo = $_SESSION['correo'];

include_once __DIR__ . '/../config/connect.php';

try {
    // Paso 1: Obtener ID del paciente desde el correo de la sesión
    $stmt = $pdo->prepare("SELECT id FROM paciente WHERE correo = ?");
    $stmt->execute([$correo]);
    $pacienteId = $stmt->fetchColumn();

    if (!$pacienteId) {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
        exit;
    }

    // Paso 2: Obtener las posturas de la serie usando la consulta optimizada
    $stmt = $pdo->prepare("
        SELECT 
            s.id AS serie_id,
            s.nombre AS serie_nombre,
            s.numero_sesiones,
            sp.orden,
            sp.duracion_min,
            p.nombre_es,
            p.nombre_sanskrito,
            p.foto_url,
            p.video_url,
            p.instrucciones,
            p.beneficios,
            p.modificaciones,
            p.precauciones
        FROM paciente pa
        JOIN asignacion_serie a ON a.paciente_id = pa.id
        JOIN serie s ON s.id = a.serie_id
        JOIN serie_postura sp ON sp.serie_id = s.id
        JOIN postura p ON p.id = sp.postura_id
        WHERE pa.id = ?
        ORDER BY sp.orden ASC
    ");
    $stmt->execute([$pacienteId]);
    $posturas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($posturas)) {
        echo json_encode(['status' => 'error', 'message' => 'No se encontraron posturas para esta serie']);
        exit;
    }

    // Paso 3: Formatear datos para el frontend
    $posturasFormateadas = [];
    foreach ($posturas as $postura) {
        $posturasFormateadas[] = [
            'nombre_es' => $postura['nombre_es'],
            'nombre_sanskrito' => $postura['nombre_sanskrito'],
            'foto_url' => $postura['foto_url'],
            'video_url' => $postura['video_url'],
            'instrucciones' => $postura['instrucciones'],
            'beneficios' => $postura['beneficios'],
            'modificaciones' => $postura['modificaciones'],
            'precauciones' => $postura['precauciones'],
            'orden' => $postura['orden'],
            'duracion_segundos' => ($postura['duracion_min'] ?? 1) * 60, // Convertir minutos a segundos
            'serie_nombre' => $postura['serie_nombre']
        ];
    }

    echo json_encode([
        'status' => 'ok',
        'posturas' => $posturasFormateadas,
        'total_posturas' => count($posturasFormateadas),
        'serie_info' => [
            'id' => $posturas[0]['serie_id'],
            'nombre' => $posturas[0]['serie_nombre'],
            'numero_sesiones' => $posturas[0]['numero_sesiones']
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la base de datos',
        'detalle' => $e->getMessage()
    ]);
}
?>
