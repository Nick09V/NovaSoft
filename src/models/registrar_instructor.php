<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');
require_once __DIR__ . '/../config/connect.php';
require '../../../vendor/autoload.php';
use MicrosoftAzure\Storage\Blob\BlobRestProxy;

$nombre = $_POST['nombre'] ?? '';
$email = $_POST['correo'] ?? '';
$contrasena = isset($_POST['contrasena']) ? password_hash($_POST['contrasena'], PASSWORD_DEFAULT) : '';
$apellido = $_POST['apellido'] ?? '';
$especialidad = $_POST['especialidad'] ?? '';
$licenciaUrl = null;

// Subida de licencia a Azure Blob
if (isset($_FILES['licencia']) && $_FILES['licencia']['error'] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES['licencia']['tmp_name'];
    $fileName = $_FILES['licencia']['name'];
    $accountName = 'novasoftepn';
    $accountKey = 'i8Cg5RqFdafyQQIE/IeSEQ5nDm+2m2x70SFpKpWGt31WFcPFqvKN6RI4p+E/5WT1mXtYcJqkDaqq+ASt+eq7uQ==';
    $containerName = 'licencias';
    $connectionString = "DefaultEndpointsProtocol=https;AccountName=$accountName;AccountKey=$accountKey";
    try {
        $blobClient = BlobRestProxy::createBlobService($connectionString);
        $content = fopen($fileTmpPath, "r");
        $blobClient->createBlockBlob($containerName, $fileName, $content);
        $licenciaUrl = "https://$accountName.blob.core.windows.net/$containerName/$fileName";
    } catch (Exception $e) {
        echo json_encode(['error' => 'Error al subir la licencia: ' . $e->getMessage(), 'ok' => false]);
        exit;
    }
}

try {
    // Comprobar si el correo ya existe
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM instructor WHERE correo = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['error' => 'El correo ya está registrado', 'ok' => false]);
        exit;
    } else {
        // Insertar nuevo instructor
        $stmt = $pdo->prepare("INSERT INTO `instructor`
            (`nombre`, `apellido`, `correo`, `contrasena`, `estado`, `especialidad`, `url`)
            VALUES (?, ?, ?, ?, ?, ?, ?);");
        $stmt->execute([
            $nombre,
            $apellido,
            $email,
            $contrasena,
            1,
            $especialidad,
            $licenciaUrl
        ]);
        echo json_encode(['ok' => true, 'message' => 'Instructor registrado exitosamente']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error en la base de datos', 'ok' => false]);
}
?>