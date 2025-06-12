<?php

include_once __DIR__ . '/../../config/connect.php';

session_start();
// Recibe una variable por GET o POST (ejemplo: 'id')
$id = $_SESSION['id'] ?? null;

if ($id === null) {
    echo json_encode(['error' => 'Falta el parámetro id']);
    exit;
}

    try{ 
    $stmt = $pdo->prepare('SELECT * FROM paciente WHERE id_instructor = :id');
    $stmt->execute(['id' => $id]);
    $result = $stmt->fetchAll();

    echo json_encode($result);

} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>