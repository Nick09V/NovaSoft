

<?php
// src/config/connect.php

#require_once __DIR__ . '/../../vendor/autoload.php';


#$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
#$dotenv->load();

/*
$host = $_ENV['DB_HOST'] ?? 'localhost';
$db   = $_ENV['DB_DATABASE'] ?? 'test';
$user = $_ENV['DB_USERNAME'] ?? 'root';
$pass = $_ENV['DB_PASSWORD'] ?? '';
$port = $_ENV['DB_PORT'] ?? '3306';
*/

$host = 'b0lflvqb9csc4alyandu-mysql.services.clever-cloud.com';
$db   = 'b0lflvqb9csc4alyandu';
$user = 'uzefq8lry0rofvv9';
$pass = 'CZVclQlesL8eJd3h3CM9';
$port = '3306';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
   /* echo "ok";*/
} catch (\PDOException $e) {
    throw new \PDOException($e->getMessage(), (int)$e->getCode());
}