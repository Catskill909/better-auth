console.log('Signup script loaded');

const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('Form submitted');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const messageDiv = document.getElementById('message');

        console.log('Form data:', { name, email });

        // Clear previous messages
        messageDiv.className = 'message';
        messageDiv.textContent = '';

        try {
            console.log('Sending request to /api/auth/sign-up/email');
            const response = await fetch('/api/auth/sign-up/email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Account created successfully! Redirecting to dashboard...';

                // Store the session token
                localStorage.setItem('authToken', data.token);

                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            } else {
                messageDiv.className = 'message error';
                messageDiv.textContent = (data.message || 'Sign up failed. Please try again.');
            }
        } catch (error) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please check your connection.';
            console.error('Error:', error);
        }

        return false;
    });
} else {
    console.error('Signup form not found!');
}
