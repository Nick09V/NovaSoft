<?php
header('Content-Type: application/json');
include_once __DIR__ . '/../config/connect.php'; // Ajusta el path si es necesario

$paciente_id = 4; // puedes obtener esto dinámicamente si lo deseas (por sesión u otro método)

try {
    $stmt = $pdo->prepare("
        SELECT MAX(fecha) AS ultima_fecha 
        FROM sesion 
        LEFT JOIN asignacion_serie ON asignacion_serie.id = sesion.asignacion_id 
        WHERE asignacion_serie.paciente_id = ?
    ");
    $stmt->execute([$paciente_id]);
    $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($resultado) {
        echo json_encode(['status' => 'ok', 'ultima_fecha' => $resultado['ultima_fecha']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se encontró la fecha']);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al ejecutar la consulta',
        'detalle' => $e->getMessage()
    ]);
}
?>
