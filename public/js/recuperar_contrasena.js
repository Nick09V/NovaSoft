/**
 * JavaScript para manejar la funcionalidad de recuperación de contraseña
 * Autor: NovaSoft Development Team
 * Fecha: 2024
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const recoveryForm = document.getElementById('recovery-form');
    const emailInput = document.getElementById('email');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const recoveryBtn = document.getElementById('recovery-btn');

    /**
     * Muestra un mensaje al usuario
     * @param {string} text - Texto del mensaje
     * @param {string} type - Tipo de mensaje ('success' o 'error')
     */
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos si es de éxito
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Muestra/oculta el indicador de carga
     * @param {boolean} show - Si se debe mostrar el indicador
     */
    function showLoading(show) {
        loadingDiv.style.display = show ? 'block' : 'none';
        recoveryBtn.disabled = show;
        recoveryBtn.textContent = show ? 'Procesando...' : 'Enviar Enlace de Recuperación';
    }

    /**
     * Valida el formato del email
     * @param {string} email - Email a validar
     * @returns {boolean} - True si el email es válido
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Maneja el envío del formulario de recuperación
     * @param {Event} e - Evento del formulario
     */
    async function handleRecoverySubmit(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Validaciones básicas
        if (!email) {
            showMessage('Por favor, ingresa tu correo electrónico.', 'error');
            return;
        }
        
        if (!validateEmail(email)) {
            showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }
        
        // Mostrar loading
        showLoading(true);
        messageDiv.style.display = 'none';
        
        try {
            // Realizar petición al servidor
            const response = await fetch('/NovaSoft/src/models/recuperar_contrasena.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                showMessage(
                    'Se ha enviado un enlace de recuperación a tu correo electrónico. ' +
                    'Por favor, revisa tu bandeja de entrada y la carpeta de spam.',
                    'success'
                );
                
                // Limpiar el formulario
                emailInput.value = '';
                
                // Opcional: redirigir después de un tiempo
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 3000);
                
            } else {
                showMessage(data.message || 'Error al procesar la solicitud.', 'error');
            }
            
        } catch (error) {
            console.error('Error en la solicitud:', error);
            showMessage(
                'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.',
                'error'
            );
        } finally {
            showLoading(false);
        }
    }

    /**
     * Maneja la validación en tiempo real del email
     */
    function handleEmailInput() {
        const email = emailInput.value.trim();
        
        // Remover estilos de error previos
        emailInput.style.borderColor = '';
        
        // Validar solo si hay texto
        if (email.length > 0) {
            if (!validateEmail(email)) {
                emailInput.style.borderColor = '#e74c3c';
            } else {
                emailInput.style.borderColor = '#27ae60';
            }
        }
    }

    // Event listeners
    recoveryForm.addEventListener('submit', handleRecoverySubmit);
    emailInput.addEventListener('input', handleEmailInput);
    
    // Enfocar el campo de email al cargar la página
    emailInput.focus();
    
    console.log('Script de recuperación de contraseña cargado correctamente');
});