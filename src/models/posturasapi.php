<?php
require_once __DIR__ . '/../config/connect.php';
header('Content-Type: application/json');

$sql = "SELECT * FROM postura";
$stmt = $pdo->query($sql);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
