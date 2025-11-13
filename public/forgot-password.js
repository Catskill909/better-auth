console.log('Forgot password script loaded');

const forgotPasswordForm = document.getElementById('forgotPasswordForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const email = document.getElementById('email').value;
        const messageDiv = document.getElementById('message');

        console.log('Email:', email);

        // Clear previous messages
        messageDiv.className = 'message';
        messageDiv.textContent = '';

        try {
            console.log('Sending request to /api/auth/forget-password');
            const response = await fetch('/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.innerHTML = `
                    <p>✅ Password reset email sent!</p>
                    <p>Check your inbox at <strong>${email}</strong> for the reset link.</p>
                    <p>The link will expire in 1 hour.</p>
                `;
                forgotPasswordForm.reset();
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = '❌ ' + (data.message || 'Failed to send reset email. Please try again.');
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = '❌ Network error. Please check your connection.';
            console.error('Error:', error);
        }

        return false;
    });
} else {
    console.error('Forgot password form not found!');
}
