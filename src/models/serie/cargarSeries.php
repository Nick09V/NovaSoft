<?php

include_once __DIR__ . '/../../config/connect.php';
session_start();
$creador_id = $_SESSION['id'] ?? null;
// Recibe una variable por GET o POST (ejemplo: 'id')
$id = isset($_REQUEST['id']) ? $_REQUEST['id'] : null;

if ($id === null) {
    echo json_encode(['error' => 'Falta el parámetro id']);
    exit;
}

    try{ 
    $stmt = $pdo->prepare('SELECT * FROM serie WHERE tipo_terapia_id = :id AND creador_id = :creador_id');
    $stmt->execute([
        'id' => $id,  
        'creador_id' => $creador_id]);
    $result = $stmt->fetchAll();

    echo json_encode($result);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>