<?php
require_once __DIR__ . '/../config/connect.php';

$sql = "SELECT * FROM posturas";
$stmt = $pdo->query($sql);
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Posturas de Yoga</title>
  <link rel="stylesheet" href="../../css/estilosPosturas.css">
</head>
<body>
  <h1 class="titulo-posturas">Posturas de Yoga</h1>

  <div class="contenedor-posturas">
    <?php foreach ($stmt as $fila): ?>
      <div class="postura">
        <img src="<?php echo $fila['imagen_url']; ?>" alt="Postura">
        <h3><?php echo $fila['nombre_es']; ?></h3>
        <p><strong>Beneficios:</strong> <?php echo $fila['beneficios']; ?></p>
        <p><strong>Instrucciones:</strong> <?php echo $fila['instrucciones']; ?></p>
      </div>
    <?php endforeach; ?>
  </div>
</body>
</html>
