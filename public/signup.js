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
            console.log('Signing up with Better Auth client');
            const { data, error } = await authClient.signUp.email({
                name,
                email,
                password,
            });

            console.log('Sign up response:', { data, error });

            if (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = error.message || 'Sign up failed. Please try again.';
            } else {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Account created successfully! Redirecting to dashboard...';

                // Redirect to dashboard after 1.5 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1500);
            }
        } catch (err) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please check your connection.';
            console.error('Error:', err);
        }

        return false;
    });
} else {
    console.error('Signup form not found!');
}
