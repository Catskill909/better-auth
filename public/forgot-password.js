console.log('Forgot password script loaded');

const forgotPasswordForm = document.getElementById('forgotPasswordForm');

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const email = document.getElementById('email').value;

        console.log('Email:', email);

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
                // Hide the form
                forgotPasswordForm.style.display = 'none';

                // Show success state in the page
                const cardContent = document.querySelector('.auth-card');
                cardContent.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <div style="margin-bottom: 30px;">
                            <i class="fas fa-envelope-open-text" style="font-size: 64px; color: var(--success);"></i>
                        </div>
                        <h2 style="margin-bottom: 20px;">Check Your Email</h2>
                        <p style="color: var(--text-secondary); margin-bottom: 15px; line-height: 1.6;">
                            We've sent a password reset link to:
                        </p>
                        <p style="color: var(--accent-primary); font-weight: 600; font-size: 18px; margin-bottom: 25px;">
                            ${email}
                        </p>
                        <div style="background: var(--bg-tertiary); padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid var(--success);">
                            <p style="color: var(--text-secondary); font-size: 14px; margin: 0;">
                                <i class="fas fa-info-circle"></i> The reset link will expire in <strong>1 hour</strong>
                            </p>
                        </div>
                        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 30px;">
                            Didn't receive the email? Check your spam folder or contact support.
                        </p>
                        <a href="/signin.html" class="btn btn-primary">
                            <i class="fas fa-arrow-left"></i> Back to Sign In
                        </a>
                    </div>
                `;
            } else {
                showError(data.message || 'Failed to send reset email. Please try again.', 'Error');
            }
        } catch (error) {
            showError('Network error. Please check your connection.', 'Error');
            console.error('Error:', error);
        }

        return false;
    });
} else {
    console.error('Forgot password form not found!');
}
