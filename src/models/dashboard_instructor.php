<?php
header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/connect.php';

// Mostrar errores en desarrollo
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No se ha iniciado sesión']);
    exit;
}

$instructorId = $_SESSION['id'];

try {
    // 1. Pacientes activos
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS total_activos 
        FROM paciente 
        WHERE estado = 'activo' AND id_instructor = ?
    ");
    $stmt->execute([$instructorId]);
    $totalActivos = $stmt->fetch()['total_activos'];

    // 2. Pacientes sin serie asignada
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS sin_serie
        FROM paciente p
        LEFT JOIN asignacion_serie a ON p.id = a.paciente_id
        WHERE a.paciente_id IS NULL AND p.id_instructor = ?
    ");
    $stmt->execute([$instructorId]);
    $sinSerie = $stmt->fetch()['sin_serie'];

    // 3. Sesiones completadas hoy (con comentario)
    $stmt = $pdo->prepare("
        SELECT COUNT(*) AS completadas_hoy 
        FROM sesion s
        JOIN asignacion_serie a ON s.asignacion_id = a.id
        JOIN paciente p ON a.paciente_id = p.id
        WHERE DATE(s.fecha) = CURDATE() 
          AND s.comentario IS NOT NULL
          AND p.id_instructor = ?
    ");
    $stmt->execute([$instructorId]);
    $completadasHoy = $stmt->fetch()['completadas_hoy'];

    // 4. Distribución por nivel de dolor final
    $stmt = $pdo->prepare("
        SELECT s.dolor_fin, COUNT(*) as cantidad
        FROM sesion s
        JOIN asignacion_serie a ON s.asignacion_id = a.id
        JOIN paciente p ON a.paciente_id = p.id
        WHERE p.id_instructor = ?
        GROUP BY s.dolor_fin
    ");
    $stmt->execute([$instructorId]);
    $resultadosDolor = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $categorias = ["MÁXIMO", "INTENSO", "MODERADO", "LEVE", "SIN DOLOR"];
    $dolorPorNivel = array_fill_keys($categorias, 0);

    foreach ($resultadosDolor as $fila) {
        $nivel = strtoupper(trim($fila['dolor_fin']));
        if (array_key_exists($nivel, $dolorPorNivel)) {
            $dolorPorNivel[$nivel] = (int)$fila['cantidad'];
        }
    }

    //5. Pacientes sin serie asignada
    $stmt = $pdo->prepare("
        SELECT p.id, p.nombre, p.apellido, p.correo, p.ciudad
        FROM paciente p
        LEFT JOIN asignacion_serie a ON p.id = a.paciente_id
        WHERE a.paciente_id IS NULL AND p.id_instructor = ?
    ");
    $stmt->execute([$instructorId]);
    $pacientesSinSerie = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // 6. Respuesta JSON completa
    echo json_encode([
        'status' => 'ok',
        'pacientes_activos' => $totalActivos,
        'sin_serie' => $sinSerie,
        'completadas_hoy' => $completadasHoy,
        'dolor_por_nivel' => $dolorPorNivel,
        'pacientes_sin_serie' => $pacientesSinSerie
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error en la conexión o consulta: ' . $e->getMessage()
    ]);
}
