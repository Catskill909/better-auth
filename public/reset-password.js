console.log('Reset password script loaded');

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
let token = urlParams.get('token');

// Clean the token - remove any callbackURL or other parameters appended to it
if (token && token.includes('?')) {
    token = token.split('?')[0];
}

console.log('Extracted token:', token);

const resetPasswordForm = document.getElementById('resetPasswordForm');

if (!token) {
    showError('No reset token found. Please check your email for the reset link.', 'Invalid Link');
    resetPasswordForm.style.display = 'none';
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showError('Passwords do not match', 'Validation Error');
            return false;
        }

        // Validate password length
        if (password.length < 8) {
            showError('Password must be at least 8 characters', 'Validation Error');
            return false;
        }

        try {
            console.log('Sending reset password request');
            console.log('Token:', token);
            console.log('Password length:', password.length);

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword: password,
                    token: token
                }),
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('Response data:', data);
                resetPasswordForm.reset();
                showSuccess('Password reset successful! Your password has been changed. Redirecting to sign in...', 'Success');

                // Redirect to sign in after 2 seconds
                setTimeout(() => {
                    window.location.href = '/signin.html';
                }, 2000);
            } else {
                const data = await response.json().catch(() => ({ message: 'Failed to reset password' }));
                console.log('Error response data:', data);
                showError(data.message || 'Failed to reset password. The link may be expired.', 'Error');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please check your connection.', 'Error');
        }

        return false;
    });
}
