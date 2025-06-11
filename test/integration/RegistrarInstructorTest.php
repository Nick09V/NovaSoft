<?php

use PHPUnit\Framework\TestCase;

class RegistrarInstructorTest extends TestCase
{
    public function testRegistrarInstructorFaltanDatos()
    {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([
                    // Faltan campos requeridos
                    'nombre' => 'Ana'
                ]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/registrar_instructor.php', false, $context);
        $response = json_decode($result, true);

        // Espera un error por datos faltantes o formato incorrecto
        $this->assertFalse($response['ok'] ?? false);
    }

    public function testRegistrarInstructorCorrectoSinLicencia()
    {
        $correoUnico = 'instructor' . uniqid() . '@mail.com';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost/NovaSoft/src/models/registrar_instructor.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);

        $postFields = [
            'nombre' => 'Ana',
            'apellido' => 'García',
            'correo' => $correoUnico,
            'contrasena' => 'ana1234',
            'especialidad' => 'Yoga'
            // No se envía 'licencia'
        ];

        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);

        $result = curl_exec($ch);
        curl_close($ch);

        $response = json_decode($result, true);

        $this->assertTrue($response['ok']);
        $this->assertEquals('Instructor registrado exitosamente', $response['message']);
    }

    public function testRegistrarInstructorCorrectoConLicencia()
    {
        $correoUnico = 'instructor' . uniqid() . '@mail.com';
        $licenciaPath = __DIR__ . '/licencia_prueba.txt'; // Crea un archivo de prueba en la misma carpeta

        // Asegúrate de que el archivo exista
        file_put_contents($licenciaPath, 'Licencia de prueba');

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost/NovaSoft/src/models/registrar_instructor.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);

        $postFields = [
            'nombre' => 'Ana',
            'apellido' => 'García',
            'correo' => $correoUnico,
            'contrasena' => 'ana1234',
            'especialidad' => 'Yoga',
            'licencia' => new CURLFile($licenciaPath)
        ];

        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);

        $result = curl_exec($ch);
        curl_close($ch);

        // Limpia el archivo de prueba
        unlink($licenciaPath);

        $response = json_decode($result, true);

        $this->assertTrue($response['ok']);
        $this->assertEquals('Instructor registrado exitosamente', $response['message']);
    }
}