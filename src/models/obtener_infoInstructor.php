<?php
session_start();
header('Content-Type: application/json');

// Puedes usar $_SESSION['correo'], o si quieres pruebas directas usa un correo fijo:
$correo = $_SESSION['correo'];

include_once __DIR__ . '/../config/connect.php';

try {
    $stmt = $pdo->prepare("
        SELECT 
            p.nombre AS paciente_nombre,
            p.correo AS paciente_correo,
            p.telefono AS paciente_telefono,
            p.direccion AS paciente_direccion,

            i.nombre AS instructor_nombre,
            i.apellido AS instructor_apellido,
            i.correo AS instructor_correo,
            i.especialidad AS instructor_especialidad,
            i.url AS instructor_url
        FROM paciente p
        JOIN instructor i ON p.id_instructor = i.id
        WHERE p.correo = ?
    ");

    $stmt->execute([$correo]);
    $datos = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($datos) {
        echo json_encode(['status' => 'ok', 'datos' => $datos]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Paciente no encontrado']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error en base de datos', 'detalle' => $e->getMessage()]);
}
