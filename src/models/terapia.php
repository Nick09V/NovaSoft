<?php
<?php
require_once __DIR__ . '/../config/connect.php';

// Consulta básica
$sql = "SELECT * FROM terapia";
$stmt = $pdo->query($sql); // Ejecuta la consulta y devuelve un statement

$data = $stmt->fetchAll(PDO::FETCH_ASSOC); // Obtiene todas las filas como array asociativo

header('Content-Type: application/json');
echo json_encode($data);
?>