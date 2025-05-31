<?php
require_once __DIR__ . '/../config/connect.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if ($id) {
    // Modo detalle: obtener una sola postura por ID
    $stmt = $pdo->prepare("SELECT * FROM postura WHERE id = ?");
    $stmt->execute([$id]);
    $postura = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($postura) {
        echo json_encode($postura);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Postura no encontrada']);
    }
} else {
    // Modo lista: obtener todas las posturas
    $stmt = $pdo->query("SELECT * FROM postura");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
