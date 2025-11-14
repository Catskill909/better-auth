console.log('Signin script loaded');

// Use authClient from auth-client.js (already initialized with credentials: 'include')

const signinForm = document.getElementById('signinForm');
const googleSignInBtn = document.getElementById('googleSignIn');

// Google Sign In
if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', async () => {
        try {
            // Use Better Auth client for social login
            await authClient.signIn.social({
                provider: 'google',
                callbackURL: '/dashboard.html'
            });
        } catch (error) {
            console.error('Google sign-in error:', error);
            const messageDiv = document.getElementById('message');
            if (messageDiv) {
                messageDiv.className = 'message error';
                messageDiv.textContent = 'Failed to initiate Google sign-in';
            }
        }
    });
}

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
            console.log('Signing in with Better Auth client');
            const { data, error } = await authClient.signIn.email({
                email,
                password,
            });

            console.log('Sign in response:', { data, error });

            if (error) {
                messageDiv.className = 'message error';
                messageDiv.textContent = error.message || 'Invalid email or password.';
            } else {
                messageDiv.className = 'message success';
                messageDiv.textContent = 'Sign in successful! Redirecting...';

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            }
        } catch (err) {
            messageDiv.className = 'message error';
            messageDiv.textContent = 'Network error. Please check your connection.';
            console.error('Error:', err);
        }

        return false;
    });
} else {
    console.error('Signin form not found!');
}
