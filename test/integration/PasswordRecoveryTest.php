<?php
/**
 * Test básico para la funcionalidad de recuperación de contraseña
 * Autor: NovaSoft Development Team
 * Fecha: 2024
 */

require_once __DIR__ . '/../../src/config/connect.php';

class PasswordRecoveryTest {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Test para verificar que se puede generar la tabla de tokens
     */
    public function testCreateTokensTable() {
        try {
            $createTableSQL = "
                CREATE TABLE IF NOT EXISTS password_reset_tokens_test (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(64) NOT NULL,
                    user_type ENUM('instructor', 'paciente') NOT NULL,
                    expiry DATETIME NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_token (token),
                    INDEX idx_email (email)
                )
            ";
            $this->pdo->exec($createTableSQL);
            
            // Verificar que la tabla se creó
            $stmt = $this->pdo->query("SHOW TABLES LIKE 'password_reset_tokens_test'");
            $result = $stmt->fetch();
            
            if ($result) {
                echo "✅ Test: Tabla de tokens creada correctamente\n";
                
                // Limpiar tabla de test
                $this->pdo->exec("DROP TABLE password_reset_tokens_test");
                return true;
            } else {
                echo "❌ Test: Error al crear tabla de tokens\n";
                return false;
            }
        } catch (Exception $e) {
            echo "❌ Test: Error en creación de tabla: " . $e->getMessage() . "\n";
            return false;
        }
    }
    
    /**
     * Test para verificar generación de tokens seguros
     */
    public function testTokenGeneration() {
        $token1 = bin2hex(random_bytes(32));
        $token2 = bin2hex(random_bytes(32));
        
        // Verificar longitud
        if (strlen($token1) === 64 && strlen($token2) === 64) {
            echo "✅ Test: Tokens tienen longitud correcta (64 caracteres)\n";
        } else {
            echo "❌ Test: Tokens no tienen longitud correcta\n";
            return false;
        }
        
        // Verificar que son únicos
        if ($token1 !== $token2) {
            echo "✅ Test: Tokens son únicos\n";
            return true;
        } else {
            echo "❌ Test: Tokens no son únicos\n";
            return false;
        }
    }
    
    /**
     * Test para verificar validación de email
     */
    public function testEmailValidation() {
        $validEmails = [
            'test@example.com',
            'user.name@domain.co.uk',
            'user+tag@domain.com'
        ];
        
        $invalidEmails = [
            'invalid-email',
            '@domain.com',
            'user@',
            'user space@domain.com'
        ];
        
        $allValid = true;
        foreach ($validEmails as $email) {
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo "❌ Test: Email válido rechazado: $email\n";
                $allValid = false;
            }
        }
        
        foreach ($invalidEmails as $email) {
            if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo "❌ Test: Email inválido aceptado: $email\n";
                $allValid = false;
            }
        }
        
        if ($allValid) {
            echo "✅ Test: Validación de email funciona correctamente\n";
            return true;
        }
        
        return false;
    }
    
    /**
     * Test para verificar hash de contraseñas
     */
    public function testPasswordHashing() {
        $password = 'TestPassword123';
        $hash1 = password_hash($password, PASSWORD_DEFAULT);
        $hash2 = password_hash($password, PASSWORD_DEFAULT);
        
        // Verificar que se genera hash
        if ($hash1 && $hash2) {
            echo "✅ Test: Hash de contraseña generado\n";
        } else {
            echo "❌ Test: Error generando hash\n";
            return false;
        }
        
        // Verificar que los hashes son diferentes (sal aleatoria)
        if ($hash1 !== $hash2) {
            echo "✅ Test: Hashes son únicos (sal aleatoria)\n";
        } else {
            echo "❌ Test: Hashes son idénticos\n";
            return false;
        }
        
        // Verificar verificación
        if (password_verify($password, $hash1) && password_verify($password, $hash2)) {
            echo "✅ Test: Verificación de contraseña funciona\n";
            return true;
        } else {
            echo "❌ Test: Error en verificación de contraseña\n";
            return false;
        }
    }
    
    /**
     * Ejecutar todos los tests
     */
    public function runAllTests() {
        echo "=== TESTS DE RECUPERACIÓN DE CONTRASEÑA ===\n\n";
        
        $tests = [
            'testTokenGeneration',
            'testEmailValidation', 
            'testPasswordHashing',
            'testCreateTokensTable'
        ];
        
        $passed = 0;
        $total = count($tests);
        
        foreach ($tests as $test) {
            if ($this->$test()) {
                $passed++;
            }
            echo "\n";
        }
        
        echo "=== RESULTADOS ===\n";
        echo "Tests pasados: $passed/$total\n";
        
        if ($passed === $total) {
            echo "🎉 Todos los tests pasaron!\n";
            return true;
        } else {
            echo "❌ Algunos tests fallaron\n";
            return false;
        }
    }
}

// Ejecutar tests solo si se llama directamente
if (basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'])) {
    try {
        $test = new PasswordRecoveryTest($pdo);
        $test->runAllTests();
    } catch (Exception $e) {
        echo "Error ejecutando tests: " . $e->getMessage() . "\n";
    }
}
?>