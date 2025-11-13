console.log('Reset password script loaded');

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
let token = urlParams.get('token');

// Clean the token - remove any callbackURL or other parameters appended to it
if (token && token.includes('?')) {
    token = token.split('?')[0];
}

console.log('Extracted token:', token);

const messageDiv = document.getElementById('message');
const resetPasswordForm = document.getElementById('resetPasswordForm');

if (!token) {
    messageDiv.className = 'message error';
    messageDiv.innerHTML = '<p>❌ No reset token found.</p><p>Please check your email for the reset link.</p>';
    resetPasswordForm.style.display = 'none';
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Clear previous messages
        messageDiv.className = 'message';
        messageDiv.textContent = '';

        // Validate passwords match
        if (password !== confirmPassword) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Passwords do not match';
            return false;
        }

        // Validate password length
        if (password.length < 8) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Password must be at least 8 characters';
            return false;
        }

        try {
            console.log('Sending reset password request');
            const response = await fetch(`/api/auth/reset-password?token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `
                    <p>✅ Password reset successful!</p>
                    <p>Your password has been changed. Redirecting to sign in...</p>
                `;
                resetPasswordForm.reset();

                // Redirect to sign in after 2 seconds
                setTimeout(() => {
                    window.location.href = '/signin.html';
                }, 2000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = '❌ ' + (data.message || 'Failed to reset password. The link may be expired.');
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Network error. Please check your connection.';
            console.error('Error:', error);
        }

        return false;
    });
}
