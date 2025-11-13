console.log('Email verification script loaded');

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const messageDiv = document.getElementById('message');
const actionsDiv = document.getElementById('actions');

if (!token) {
    messageDiv.className = 'message error';
    messageDiv.innerHTML = '<p class="error-text"><i class="fas fa-exclamation-circle"></i> No verification token found.</p><p>Please check your email for the verification link.</p>';
} else {
    // Verify the email
    verifyEmail(token);
}

async function verifyEmail(token) {
    try {
        console.log('Verifying email with token:', token);

        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
            method: 'GET',
        });

        console.log('Response status:', response.status);

        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.innerHTML = `
                <h2><i class="fas fa-check-circle" style="color: var(--success);"></i> Email Verified!</h2>
                <p>Your email has been successfully verified.</p>
                <p>You can now sign in to your account.</p>
            `;
            actionsDiv.style.display = 'block';
        } else {
            const data = await response.json();
            messageDiv.className = 'message error';
            messageDiv.innerHTML = `
                <p class="error-text"><i class="fas fa-times-circle"></i> Verification failed</p>
                <p>${data.message || 'The verification link may be invalid or expired.'}</p>
                <p>Please try signing up again or contact support.</p>
            `;
        }
    } catch (error) {
        console.error('Verification error:', error);
        messageDiv.className = 'message error';
        messageDiv.innerHTML = `
            <p class="error-text"><i class="fas fa-exclamation-circle"></i> Network error</p>
            <p>Unable to verify your email. Please check your connection and try again.</p>
        `;
    }
}
