<?php

require '../../../vendor/autoload.php';

use MicrosoftAzure\Storage\Blob\BlobRestProxy;

// Configuración
$accountName = 'novasoftepn';
$accountKey = 'i8Cg5RqFdafyQQIE/IeSEQ5nDm+2m2x70SFpKpWGt31WFcPFqvKN6RI4p+E/5WT1mXtYcJqkDaqq+ASt+eq7uQ==';
$containerName = 'licencias';

// Crear cadena de conexión
$connectionString = "DefaultEndpointsProtocol=https;AccountName=$accountName;AccountKey=$accountKey";

try {
    $blobClient = BlobRestProxy::createBlobService($connectionString);
    // Intentar listar contenedores
    $blobClient->listContainers();
    echo "Conexión exitosa a Azure Blob Storage.";
} catch (Exception $e) {
    echo "Error de conexión: " . $e->getMessage();
}




?>
