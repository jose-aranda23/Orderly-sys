document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasena');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('span:not(.btn-spinner)');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    
    const alertBox = document.getElementById('loginAlert');
    const alertMessage = document.getElementById('loginAlertMessage');

    const showAlert = (message, type = 'danger') => {
        alertMessage.textContent = message;
        alertBox.className = `alert alert-${type}`;
        alertBox.classList.remove('hidden');
    };

    const hideAlert = () => {
        alertBox.classList.add('hidden');
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'Verificando...';
            btnSpinner.classList.remove('hidden');
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'Acceder';
            btnSpinner.classList.add('hidden');
        }
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideAlert();
        
        const correo = correoInput.value.trim();
        const contrasena = contrasenaInput.value;

        if (!correo || !contrasena) {
            showAlert('Por favor complete todos los campos.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/v1/usuarios/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ correo, contrasena })
            });

            const data = await response.json();

            if (!response.ok) {
                // Determine if it was locked or just wrong password (handled by backend message)
                showAlert(data.message || 'Error al autenticar.');
            } else {
                // Success
                localStorage.setItem('token', data.data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                
                // Add success visual feedback
                alertBox.className = 'alert alert-success';
                alertBox.innerHTML = '<span class="alert-icon">✅</span> Acceso concedido. Redirigiendo...';
                alertBox.classList.remove('hidden');
                
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 800);
            }
        } catch (error) {
            showAlert('Error de conexión con el servidor.');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    });

    // Optional: add subtle interaction to inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', hideAlert);
    });
});
