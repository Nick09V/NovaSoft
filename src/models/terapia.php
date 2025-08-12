<?php
require_once __DIR__ . '/../config/connect.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM terapia";
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener terapias']);
    exit;
}
?>