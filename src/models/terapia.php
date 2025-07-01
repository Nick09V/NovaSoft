<?php
require_once __DIR__ . '/../config/connect.php';

header('Content-Type: application/json');

try {
    $sql = "SELECT * FROM terapia";
    $stmt = $pdo->query($sql);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($data);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>