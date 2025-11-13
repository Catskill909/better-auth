// Check if user is logged in
const token = localStorage.getItem('authToken');

if (!token) {
    window.location.href = '/signin.html';
}

// Fetch user session
async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/get-session', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            displayUserInfo(data);
        } else {
            // Session invalid, redirect to sign in
            localStorage.removeItem('authToken');
            window.location.href = '/signin.html';
        }
    } catch (error) {
        console.error('Error fetching session:', error);
        document.getElementById('userInfo').innerHTML = `
            <p style="color: #e74c3c;">❌ Error loading user information</p>
        `;
    }
}

function displayUserInfo(data) {
    const userInfoDiv = document.getElementById('userInfo');

    const verificationBadge = data.user.emailVerified
        ? '<span style="color: #28a745;">✅ Verified</span>'
        : '<span style="color: #dc3545;">❌ Not Verified</span>';

    const resendButton = !data.user.emailVerified
        ? '<button id="resendVerificationBtn" class="btn btn-secondary" style="margin-top: 10px;">Resend Verification Email</button>'
        : '';

    const adminLink = data.user.role === 'admin'
        ? '<p><a href="/admin.html" class="btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; display: inline-block; margin-top: 10px;">🔐 Admin Dashboard</a></p>'
        : '';

    userInfoDiv.innerHTML = `
        <h2>Welcome back!</h2>
        <p><strong>Name:</strong> ${data.user.name}</p>
        <p><strong>Email:</strong> ${data.user.email}</p>
        <p><strong>Role:</strong> ${data.user.role || 'user'}</p>
        <p><strong>Email Verified:</strong> ${verificationBadge}</p>
        <p><strong>User ID:</strong> ${data.user.id}</p>
        <p><strong>Account Created:</strong> ${new Date(data.user.createdAt).toLocaleDateString()}</p>
        ${adminLink}
        ${resendButton}
    `;

    // Add event listener for resend verification button
    if (!data.user.emailVerified) {
        const resendBtn = document.getElementById('resendVerificationBtn');
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                resendBtn.disabled = true;
                resendBtn.textContent = 'Sending...';

                try {
                    const response = await fetch('/api/auth/send-verification-email', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: data.user.email }),
                    });

                    if (response.ok) {
                        resendBtn.textContent = '✅ Email Sent!';
                        resendBtn.style.background = '#28a745';
                        alert('Verification email sent! Please check your inbox.');
                    } else {
                        resendBtn.disabled = false;
                        resendBtn.textContent = 'Resend Verification Email';
                        alert('Failed to send verification email. Please try again.');
                    }
                } catch (error) {
                    console.error('Error sending verification email:', error);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Verification Email';
                    alert('Network error. Please try again.');
                }
            });
        }
    }
}

// Sign out functionality
document.getElementById('signoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/api/auth/sign-out', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    } catch (error) {
        console.error('Sign out error:', error);
    }

    // Clear token and redirect
    localStorage.removeItem('authToken');
    window.location.href = '/index.html';
});

// Load user info on page load
loadUserInfo();
