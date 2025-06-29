<?php
session_start();
require_once __DIR__ . '/../config/connect.php';

// 1. Validar paciente autenticado
$paciente_id = $_SESSION['id'] ?? null;
if (!$paciente_id) {
    header('Location: login.php');
    exit;
}

// 2. Recuperar datos del formulario
$serie_id     = $_POST['serie_id']     ?? null;
$dolor_inicio = $_POST['dolor_inicio'] ?? null;

if (!$serie_id) {
    die('Error: no se especificó la serie.');
}

if (!$dolor_inicio) {
    die('Error: debe seleccionar nivel de dolor inicial.');
}

try {
    // 3. Buscar la asignación de esa serie para este paciente
    $stmt = $pdo->prepare("
        SELECT id 
        FROM asignacion_serie
        WHERE paciente_id = ?
          AND serie_id    = ?
        LIMIT 1
    ");
    $stmt->execute([$paciente_id, $serie_id]);
    $asig = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$asig) {
        die('No se encontró una asignación de serie para este paciente.');
    }
    $asignacion_id = $asig['id'];

    // 4. Insertar la nueva sesión (dolor_inicio)
    $stmt = $pdo->prepare("
        INSERT INTO sesion 
            (asignacion_id, fecha, dolor_inicio)
        VALUES 
            (?, NOW(), ?)
    ");
    $stmt->execute([$asignacion_id, $dolor_inicio]);

    // 5. Obtener el ID de la sesión creada
    $id_sesion = $pdo->lastInsertId();

    // 6. Redirigir a ejecutar_serie.php con el id de sesión
    header("Location: ejecutar_serie.php?id_sesion={$id_sesion}");
    exit;

} catch (PDOException $e) {
    // En ambiente de desarrollo puedes mostrar $e->getMessage()
    die("Error al crear la sesión: " . $e->getMessage());
}
