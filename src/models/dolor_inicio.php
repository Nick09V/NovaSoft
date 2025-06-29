<?php
session_start();
require_once __DIR__ . '/../config/connect.php';

// 1. Validar paciente autenticado
$paciente_id = $_SESSION['id'] ?? null;
if (!$paciente_id) {
    header('Location: login.php');
    exit;
}

// 2. Recuperar serie_id desde GET
$serie_id = $_GET['serie_id'] ?? null;
if (!$serie_id) {
    die('Error: no se especificó la serie.');
}

// 3. (Opcional) Traer nombre de serie y terapia para mostrar al paciente
$stmt = $pdo->prepare("
    SELECT s.nombre AS serie_nombre,
           t.nombre AS terapia_nombre
    FROM serie s
    JOIN terapia t ON t.id = s.tipo_terapia_id
    WHERE s.id = ?
");
$stmt->execute([$serie_id]);
$info = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$info) {
    die('Serie no encontrada.');
}