document.addEventListener('DOMContentLoaded', function() {
    const telefonoInput = document.getElementById('telefono');
    
    telefonoInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});