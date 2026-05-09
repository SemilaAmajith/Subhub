
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('loginSection').classList.add('active');
    } else if (tab === 'register') {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('registerSection').classList.add('active');
    } else if (tab === 'forgot') {
        document.getElementById('forgotSection').classList.add('active');
        document.getElementById('forgotStep1').style.display = 'block';
        document.getElementById('forgotStep2').style.display = 'none';
        document.getElementById('forgotStep3').style.display = 'none';
        document.getElementById('forgotForm1').reset();
    }
}

let isPasswordStrong = false;
let isPasswordMatched = false;

function checkPasswordStrength() {
    const pwd = document.getElementById('regPassword').value;
    const seg1 = document.getElementById('seg1');
    const seg2 = document.getElementById('seg2');
    const seg3 = document.getElementById('seg3');
    const seg4 = document.getElementById('seg4');
    const text = document.getElementById('strengthText');
    
    let strength = 0;
    if (pwd.length >= 8) strength++; // Needs to be at least 8 chars
    if (/[A-Z]/.test(pwd)) strength++; // Needs uppercase
    if (/[0-9]/.test(pwd)) strength++; // Needs number
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++; // Needs symbol
    
    // Reset colors
    const defaultColor = 'rgba(255,255,255,0.1)';
    [seg1, seg2, seg3, seg4].forEach(s => s.style.background = defaultColor);
    
    if (pwd.length === 0) {
        text.innerText = "Waiting for input...";
        text.style.color = "var(--text-muted)";
        isPasswordStrong = false;
    } else if (strength <= 2) {
        seg1.style.background = '#ff3366';
        if(strength === 2) seg2.style.background = '#ff3366';
        text.innerText = "Weak (Needs Uppercase, Number & Symbol)";
        text.style.color = '#ff3366';
        isPasswordStrong = false;
    } else if (strength === 3) {
        seg1.style.background = '#ffab00';
        seg2.style.background = '#ffab00';
        seg3.style.background = '#ffab00';
        text.innerText = "Medium (Add more variation)";
        text.style.color = '#ffab00';
        isPasswordStrong = false;
    } else if (strength === 4) {
        seg1.style.background = '#2ed573';
        seg2.style.background = '#2ed573';
        seg3.style.background = '#2ed573';
        seg4.style.background = '#2ed573';
        text.innerText = "Strong (Excellent!)";
        text.style.color = '#2ed573';
        isPasswordStrong = true;
    }
    
    checkPasswordMatch(); // update match if pwd changes
    updateRegisterButton();
}

function checkPasswordMatch() {
    const pwd = document.getElementById('regPassword').value;
    const confirmPwdInput = document.getElementById('regConfirmPassword');
    const confirmPwd = confirmPwdInput.value;
    const errorText = document.getElementById('matchError');
    
    if (confirmPwd.length === 0) {
        confirmPwdInput.classList.remove('input-error', 'input-success');
        errorText.style.display = 'none';
        isPasswordMatched = false;
    } else if (pwd !== confirmPwd) {
        confirmPwdInput.classList.remove('input-success');
        confirmPwdInput.classList.add('input-error');
        errorText.style.display = 'block';
        isPasswordMatched = false;
    } else {
        confirmPwdInput.classList.remove('input-error');
        confirmPwdInput.classList.add('input-success');
        errorText.style.display = 'none';
        isPasswordMatched = true;
    }
    
    updateRegisterButton();
}

function updateRegisterButton() {
    const btn = document.getElementById('registerBtn');
    if (isPasswordStrong && isPasswordMatched) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

function handleRegister(e) {
    e.preventDefault();
    
    if (!isPasswordStrong || !isPasswordMatched) return;
    
    const name = document.getElementById('regName').value;
    const phone = document.getElementById('regPhone').value;
    const email = document.getElementById('regEmail').value;
    const pwd = document.getElementById('regPassword').value;
    
    const btn = document.getElementById('registerBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    btn.disabled = true;
    
    setTimeout(async () => {
        try {
            // Create user in Custom Node.js Backend
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pwd, name, phone })
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || "Registration failed");
            }
            
        } catch(e) {
            console.error("Error creating user:", e);
            alert("Registration failed: " + e.message);
            btn.innerHTML = 'Create Account';
            btn.disabled = false;
            return;
        }
        
        // Send actual Email via EmailJS
        const templateParams = {
            to_email: email,
            to_name: name,
            message: "Welcome to SubHub! Your account has been successfully created. We are excited to have you on board.",
            verification_code: "Welcome!"
        };
        emailjs.send("service_ton7qk8", "template_menv67q", templateParams, "dZwzK6URCLMZlTROJ").catch(err => {
            console.error("EmailJS Error:", err);
            if(err instanceof Error) console.error(err.message);
        });
        
        // Show Popup
        document.getElementById('popupMessage').innerHTML = `We have successfully created your account.<br><br>A confirmation email has been sent to <strong>${email}</strong>.<br>Please check your inbox.`;
        document.getElementById('successPopup').classList.add('show');
        
        btn.innerHTML = 'Create Account';
        btn.disabled = false;
        
    }, 1500);
}

function goToLogin() {
    document.getElementById('successPopup').classList.remove('show');
    switchAuthTab('login');
    document.getElementById('registerForm').reset();
    isPasswordStrong = false;
    isPasswordMatched = false;
    
    // reset UI elements manually since reset() doesn't trigger oninput
    const segs = [document.getElementById('seg1'), document.getElementById('seg2'), document.getElementById('seg3'), document.getElementById('seg4')];
    segs.forEach(s => s.style.background = 'rgba(255,255,255,0.1)');
    document.getElementById('strengthText').innerText = "Waiting for input...";
    document.getElementById('strengthText').style.color = "var(--text-muted)";
    
    const confirmInput = document.getElementById('regConfirmPassword');
    confirmInput.classList.remove('input-error', 'input-success');
    document.getElementById('matchError').style.display = 'none';
    
    updateRegisterButton();
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pwd = document.getElementById('loginPassword').value;
    const btn = document.getElementById('loginBtn');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    
    setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: pwd })
            });
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('subhub_user', email);
                window.location.href = 'index.html';
            } else {
                throw new Error(data.message || "Invalid credentials");
            }
        } catch(e) {
            console.error("Login Error:", e);
            alert("Login Failed: " + e.message);
            btn.innerHTML = 'Sign In';
        }
    }, 1000);
}

let generatedCode = '';
let resetUserEmail = '';

function handleForgotStep1(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.toLowerCase();
    const btn = document.getElementById('forgotBtn1');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    
    setTimeout(async () => {
        let users = [];
        try {
            users = await SubHubDB.getUsers();
        } catch (e) {}
        
        let user = users.find(u => u.email.toLowerCase() === email);
        
        if (user || email === 'admin@subhub.com') {
            resetUserEmail = email;
            // Generate 4-digit code
            generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
            
            // Send actual Email via EmailJS
            const templateParams = {
                to_email: email,
                to_name: user ? user.name : "Admin",
                message: `Your SubHub password reset verification code is: ${generatedCode}. Please enter this 4-digit code to reset your password.`,
                verification_code: generatedCode
            };
            
            emailjs.send("service_ton7qk8", "template_menv67q", templateParams, "dZwzK6URCLMZlTROJ")
                .then(() => {
                    document.getElementById('forgotStep1').style.display = 'none';
                    document.getElementById('forgotStep2').style.display = 'block';
                    document.getElementById('forgotForm2').reset();
                    btn.innerHTML = 'Send Code';
                    btn.disabled = false;
                })
                .catch((err) => {
                    let errMsg = err.text ? err.text : (err.message ? err.message : JSON.stringify(err));
                    alert("EmailJS Error: " + errMsg + "\nPlease check F12 Console for details.");
                    console.error("EmailJS Error details:", err);
                    btn.innerHTML = 'Send Code';
                    btn.disabled = false;
                });
        } else {
            alert("No account found with that email address.");
            btn.innerHTML = 'Send Code';
            btn.disabled = false;
        }
    }, 1000);
}

function handleForgotStep2(e) {
    e.preventDefault();
    const code = document.getElementById('forgotCode').value;
    const btn = document.getElementById('forgotBtn2');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    btn.disabled = true;
    
    setTimeout(() => {
        if (code === generatedCode) {
            document.getElementById('forgotStep2').style.display = 'none';
            document.getElementById('forgotStep3').style.display = 'block';
            document.getElementById('forgotForm3').reset();
            checkResetPasswordMatch();
        } else {
            alert("Invalid verification code. Please try again.");
            document.getElementById('forgotCode').value = '';
        }
        btn.innerHTML = 'Verify Code';
        btn.disabled = false;
    }, 1000);
}

let isResetPasswordMatched = false;

function checkResetPasswordMatch() {
    const pwd = document.getElementById('resetPassword').value;
    const confirmPwdInput = document.getElementById('resetConfirmPassword');
    const confirmPwd = confirmPwdInput.value;
    const errorText = document.getElementById('resetMatchError');
    const btn = document.getElementById('forgotBtn3');
    
    if (confirmPwd.length === 0) {
        confirmPwdInput.classList.remove('input-error', 'input-success');
        errorText.style.display = 'none';
        isResetPasswordMatched = false;
    } else if (pwd !== confirmPwd) {
        confirmPwdInput.classList.remove('input-success');
        confirmPwdInput.classList.add('input-error');
        errorText.style.display = 'block';
        isResetPasswordMatched = false;
    } else {
        confirmPwdInput.classList.remove('input-error');
        confirmPwdInput.classList.add('input-success');
        errorText.style.display = 'none';
        isResetPasswordMatched = true;
    }
    
    // Check if new password meets basic length (could reuse checkPasswordStrength logic if needed)
    if (isResetPasswordMatched && pwd.length >= 8) {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

function handleForgotStep3(e) {
    e.preventDefault();
    if (!isResetPasswordMatched) return;
    
    const pwd = document.getElementById('resetPassword').value;
    const btn = document.getElementById('forgotBtn3');
    
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    btn.disabled = true;
    
    setTimeout(async () => {
        // Save back to DB via API
        try {
            const response = await fetch(`${API_BASE}/auth/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetUserEmail, newPassword: pwd })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
        } catch (e) {
            console.error("Error resetting password:", e);
            alert("Password Reset Failed: " + e.message);
            btn.innerHTML = 'Reset Password';
            btn.disabled = false;
            return;
        }
        
        // Show Success Popup
        document.getElementById('popupMessage').innerHTML = `You have successfully changed the password.<br><br>You can now login with your new credentials.`;
        document.getElementById('successPopup').classList.add('show');
        
        btn.innerHTML = 'Reset Password';
        btn.disabled = false;
    }, 1500);
}

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
