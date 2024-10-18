document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const roleSelect = document.getElementById('role');
    const loginButton = document.getElementById('loginButton');
    const togglePasswordButton = document.getElementById('togglePassword');
    const messageDiv = document.getElementById('message');

    function validateForm() {
        return usernameInput.value.trim() !== '' &&
               passwordInput.value.trim() !== '' &&
               roleSelect.value !== '';
    }

    function updateLoginButton() {
        loginButton.disabled = !validateForm();
    }

    [usernameInput, passwordInput, roleSelect].forEach(element => {
        element.addEventListener('input', updateLoginButton);
    });

    togglePasswordButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForm()) {
            submitLogin();
        }
    });

    function submitLogin() {
        const username = usernameInput.value;
        const password = passwordInput.value;
        const role = roleSelect.value;

        loginButton.disabled = true;
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

        fetch('https://restapi.tu.ac.th/api/v1/auth/Ad/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Application-Key': 'TUc6bffe8f386c7a993e73d3684665777033d68ebfaa6b37470fb18b2d353e782de083e8f1fb51919c3bf49392105f95c8'
            },
            body: JSON.stringify({ "UserName": username, "PassWord": password, "Role": role })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status) {
                const userType = data.type?.toLowerCase();
                if ((role === 'student' && userType === 'student') || 
                    (role === 'lecturer' && userType === 'employee')) {
                    showSuccessMessage(data, role);
                } else {
                    showErrorMessage(`บทบาทไม่ถูกต้อง คุณเป็น ${userType} แต่เลือกบทบาท ${role}`);
                }
            } else {
                showErrorMessage(data.message || 'การล็อกอินล้มเหลว');
            }
        })
        .catch(error => {
            console.error('Login Error:', error);
            showErrorMessage('เกิดข้อผิดพลาดในการล็อกอิน กรุณาลองใหม่อีกครั้ง');
        })
        .finally(() => {
            loginButton.disabled = false;
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        });
    }

    function showSuccessMessage(data, role) {
        let message = `<h2>${role === 'student' ? 'Student' : 'Lecturer'} Login Successful</h2>`;
        message += `<p><strong>Username:</strong> ${data.username}</p>`;
        message += `<p><strong>Display Name (TH):</strong> ${data.displayname_th}</p>`;
        message += `<p><strong>Display Name (EN):</strong> ${data.displayname_en}</p>`;
        message += `<p><strong>Email:</strong> ${data.email}</p>`;

        if (role === 'student') {
            message += `<p><strong>Status:</strong> ${data.tu_status}</p>`;
            message += `<p><strong>Status ID:</strong> ${data.statusid}</p>`;
            message += `<p><strong>Department:</strong> ${data.department}</p>`;
            message += `<p><strong>Faculty:</strong> ${data.faculty}</p>`;
        } else {
            message += `<p><strong>Work Status:</strong> ${getWorkStatus(data.StatusWork)}</p>`;
            message += `<p><strong>Employee Status:</strong> ${data.StatusEmp}</p>`;
            message += `<p><strong>Department:</strong> ${data.department}</p>`;
            message += `<p><strong>Organization:</strong> ${data.organization}</p>`;
        }

        messageDiv.innerHTML = message;
        messageDiv.className = `success ${role}-info`;
    }

    function showErrorMessage(message) {
        messageDiv.innerHTML = `<p><i class="fas fa-exclamation-circle"></i> ${message}</p>`;
        messageDiv.className = 'error';
    }

    function getWorkStatus(status) {
        switch (status) {
            case '0': return 'ลาออก';
            case '1': return 'ปฏิบัติงาน';
            case '2': return 'ไม่ปฏิบัติงาน';
            default: return 'Unknown';
        }
    }
});