<?php

include_once __DIR__ . '/../../config/connect.php';


// Recibe una variable por GET o POST (ejemplo: 'id')
$id = isset($_REQUEST['id']) ? $_REQUEST['id'] : null;

if ($id === null) {
    echo json_encode(['error' => 'Falta el parámetro id']);
    exit;
}

    try{ 
    $stmt = $pdo->prepare('SELECT * FROM serie WHERE id = :id');
    $stmt->execute(['id' => $id]);
    $result = $stmt->fetchAll();

    echo json_encode($result);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>