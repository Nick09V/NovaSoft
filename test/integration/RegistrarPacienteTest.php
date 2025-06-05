<?php

use PHPUnit\Framework\TestCase;

class RegistrarPacienteTest extends TestCase
{
    public function testRegistrarPacienteFaltanDatos()
    {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([
                    // No se envían todos los campos requeridos
                    'nombre' => 'Juan'
                ]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/registrar_paciente.php', false, $context);
        $response = json_decode($result, true);

        $this->assertFalse($response['success']);
        $this->assertEquals('Faltan datos requeridos', $response['message']);
    }

    public function testRegistrarPacienteCorrecto()
    {
        $correoUnico = 'prueba' . uniqid() . '@mail.com';
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([
                    'nombre' => 'Juan',
                    'apellido' => 'Pérez',
                    'correo' => 'juan.peres@gmail.com',
                    'contrasena' => 'juan1234',
                    'telefono' => '0234567890',
                    'direccion' => 'Calle 123',
                    'ciudad' => 'Ciudad'
                ]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/registrar_paciente.php', false, $context);
        $response = json_decode($result, true);

        $this->assertTrue($response['success']);
        $this->assertEquals('Paciente registrado correctamente', $response['message']);
    }
}