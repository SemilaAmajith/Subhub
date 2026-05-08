document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('adminEmail').value.trim();
            const password = document.getElementById('adminPassword').value.trim();
            const btn = adminLoginForm.querySelector('button[type="submit"]');
            
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
            btn.disabled = true;

            // Use custom Node.js Auth API
            fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.role === 'admin') {
                    // Success
                    localStorage.setItem('subhub_admin_logged_in', 'true');
                    window.location.href = 'admin.html';
                } else {
                    alert('Login Failed: ' + (data.message || 'Unauthorized Access'));
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            })
            .catch((error) => {
                alert('Login Error: Server might be down.');
                console.error(error);
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
        });
    }
});

function togglePassword(icon, inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}
