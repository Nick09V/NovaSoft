
<?php
require_once __DIR__ . '/../config/connect.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;
$terapia_id = $_GET['terapia'] ?? null;

if ($id) {
    $stmt = $pdo->prepare("SELECT * FROM postura WHERE id = ?");
    $stmt->execute([$id]);
    $postura = $stmt->fetch(PDO::FETCH_ASSOC);
    echo $postura ? json_encode($postura) : json_encode(['error' => 'Postura no encontrada']);
} elseif ($terapia_id) {
    $stmt = $pdo->prepare("SELECT p.* FROM postura p JOIN postura_terapia pt ON p.id = pt.postura_id WHERE pt.terapia_id = ?");
    $stmt->execute([$terapia_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    $stmt = $pdo->query("SELECT * FROM postura");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
?>
