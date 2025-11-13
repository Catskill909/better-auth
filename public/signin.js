console.log('Signin script loaded');

const signinForm = document.getElementById('signinForm');

if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');

        console.log('Form data:', { email });

        // Clear previous messages
        messageDiv.className = 'message';
        messageDiv.textContent = '';

        try {
            console.log('Sending request to /api/auth/sign-in/email');
            const response = await fetch('/api/auth/sign-in/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Sign in successful! Redirecting...';

                // Store the session token
                localStorage.setItem('authToken', data.token);

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = (data.message || 'Invalid email or password.');
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please check your connection.';
            console.error('Error:', error);
        }

        return false;
    });
} else {
    console.error('Signin form not found!');
}
