<?php
// filepath: c:\xampp\htdocs\NovaSoft\test\integration\LoginTest.php

use PHPUnit\Framework\TestCase;

class LoginTest extends TestCase
{
    public function testLoginSinDatos()
    {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/login.php', false, $context);
        $response = json_decode($result, true);

        $this->assertEquals('error', $response['status']);
        $this->assertEquals('Faltan datos', $response['message']);
    }

    public function testLoginCredencialesIncorrectas()
    {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([
                    'username' => 'usuario@inexistente.com',
                    'password' => 'claveincorrecta'
                ]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/login.php', false, $context);
        $response = json_decode($result, true);

        $this->assertEquals('error', $response['status']);
        $this->assertEquals('Credenciales incorrectas', $response['message']);
    }

    public function testLoginCredencialesCorrectas()
    {
        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n",
                'content' => json_encode([
                    'username' => 'jefferson.pistala@epn.edu.ec', // Cambia esto por un usuario real
                    'password' => 'jeff123'           // Cambia esto por la contraseña real
                ]),
            ]
        ];
        $context  = stream_context_create($opts);
        $result = file_get_contents('http://localhost/NovaSoft/src/models/login.php', false, $context);
        $response = json_decode($result, true);

        $this->assertEquals('ok', $response['status']);
        // Puedes agregar más asserts según la respuesta esperada, por ejemplo:
        $this->assertEquals('instructor', $response['rol']);
        // $this->assertEquals('usuario_real', $response['usuario']['nombre']);
    }
}