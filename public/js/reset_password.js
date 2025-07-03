/**
 * JavaScript para manejar el restablecimiento de contraseña
 * Autor: NovaSoft Development Team
 * Fecha: 2024
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const resetForm = document.getElementById('reset-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const messageDiv = document.getElementById('message');
    const loadingDiv = document.getElementById('loading');
    const resetBtn = document.getElementById('reset-btn');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const resetFormContainer = document.getElementById('reset-form-container');
    const tokenInvalidContainer = document.getElementById('token-invalid-container');
    
    // Elementos de requisitos
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-upper');
    const reqLower = document.getElementById('req-lower');
    const reqNumber = document.getElementById('req-number');
    
    // Obtener token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Verificar si hay token
    if (!token) {
        showTokenInvalid();
        return;
    }
    
    // Verificar validez del token al cargar la página
    verifyToken();

    /**
     * Verifica si el token es válido
     */
    async function verifyToken() {
        try {
            const response = await fetch('/NovaSoft/src/models/verify_reset_token.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token
                })
            });
            
            const data = await response.json();
            
            if (data.status !== 'success') {
                showTokenInvalid();
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            showTokenInvalid();
        }
    }

    /**
     * Muestra la pantalla de token inválido
     */
    function showTokenInvalid() {
        resetFormContainer.style.display = 'none';
        tokenInvalidContainer.style.display = 'block';
    }

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
        resetBtn.disabled = show;
        resetBtn.textContent = show ? 'Procesando...' : 'Restablecer Contraseña';
    }

    /**
     * Evalúa la fortaleza de la contraseña
     * @param {string} password - Contraseña a evaluar
     * @returns {object} - Objeto con la evaluación
     */
    function evaluatePasswordStrength(password) {
        const checks = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /\d/.test(password)
        };
        
        const score = Object.values(checks).filter(Boolean).length;
        
        let strength = 'weak';
        let text = 'Débil';
        
        if (score === 4) {
            strength = 'strong';
            text = 'Fuerte';
        } else if (score >= 3) {
            strength = 'medium';
            text = 'Media';
        }
        
        return { strength, text, checks };
    }

    /**
     * Actualiza los indicadores de requisitos
     * @param {object} checks - Resultados de las verificaciones
     */
    function updateRequirements(checks) {
        reqLength.className = checks.length ? 'requirement-met' : '';
        reqUpper.className = checks.upper ? 'requirement-met' : '';
        reqLower.className = checks.lower ? 'requirement-met' : '';
        reqNumber.className = checks.number ? 'requirement-met' : '';
    }

    /**
     * Maneja la entrada de la nueva contraseña
     */
    function handlePasswordInput() {
        const password = newPasswordInput.value;
        const evaluation = evaluatePasswordStrength(password);
        
        // Actualizar indicador de fortaleza
        passwordStrengthDiv.textContent = `Fortaleza: ${evaluation.text}`;
        passwordStrengthDiv.className = `password-strength strength-${evaluation.strength}`;
        
        // Actualizar requisitos
        updateRequirements(evaluation.checks);
        
        // Validar confirmación si ya hay texto
        if (confirmPasswordInput.value) {
            handleConfirmPasswordInput();
        }
    }

    /**
     * Maneja la entrada de confirmar contraseña
     */
    function handleConfirmPasswordInput() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                confirmPasswordInput.style.borderColor = '#27ae60';
            } else {
                confirmPasswordInput.style.borderColor = '#e74c3c';
            }
        } else {
            confirmPasswordInput.style.borderColor = '';
        }
    }

    /**
     * Valida el formulario
     * @returns {object} - Resultado de la validación
     */
    function validateForm() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!password) {
            return { valid: false, message: 'La nueva contraseña es requerida' };
        }
        
        const evaluation = evaluatePasswordStrength(password);
        const allRequirementsMet = Object.values(evaluation.checks).every(Boolean);
        
        if (!allRequirementsMet) {
            return { valid: false, message: 'La contraseña no cumple con todos los requisitos' };
        }
        
        if (password !== confirmPassword) {
            return { valid: false, message: 'Las contraseñas no coinciden' };
        }
        
        return { valid: true };
    }

    /**
     * Maneja el envío del formulario
     * @param {Event} e - Evento del formulario
     */
    async function handleResetSubmit(e) {
        e.preventDefault();
        
        const validation = validateForm();
        if (!validation.valid) {
            showMessage(validation.message, 'error');
            return;
        }
        
        const password = newPasswordInput.value;
        
        // Mostrar loading
        showLoading(true);
        messageDiv.style.display = 'none';
        
        try {
            const response = await fetch('/NovaSoft/src/models/reset_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    new_password: password
                })
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                showMessage(
                    'Tu contraseña ha sido restablecida exitosamente. Serás redirigido al inicio de sesión.',
                    'success'
                );
                
                // Limpiar formulario
                resetForm.reset();
                passwordStrengthDiv.textContent = '';
                updateRequirements({});
                
                // Redirigir después de un tiempo
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 3000);
                
            } else {
                showMessage(data.message || 'Error al restablecer la contraseña.', 'error');
                
                // Si el token es inválido, mostrar pantalla correspondiente
                if (data.message && data.message.includes('inválido')) {
                    setTimeout(() => {
                        showTokenInvalid();
                    }, 2000);
                }
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

    // Event listeners
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetSubmit);
    }
    
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', handlePasswordInput);
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', handleConfirmPasswordInput);
    }
    
    // Enfocar el campo de nueva contraseña
    if (newPasswordInput && resetFormContainer.style.display !== 'none') {
        newPasswordInput.focus();
    }
    
    console.log('Script de restablecimiento de contraseña cargado correctamente');
});