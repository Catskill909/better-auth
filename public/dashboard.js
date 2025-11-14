// Check if user is logged in using Better Auth session
async function checkAuth() {
    try {
        const { data: session, error } = await authClient.getSession();

        if (error || !session) {
            console.log('No active session, redirecting to signin');
            window.location.href = '/signin.html';
            return null;
        }

        return session.user;
    } catch (err) {
        console.error('Auth check error:', err);
        window.location.href = '/signin.html';
        return null;
    }
}

// Avatar upload functionality
let currentUser = null;

async function loadAvatar() {
    // Get user from session
    currentUser = await checkAuth();
    if (!currentUser) return;

    try {
        const response = await fetch('/api/user/me', {
            method: 'GET',
            credentials: 'include', // Include cookies for Better Auth
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data;

            // Display avatar if exists
            const avatarImage = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            const deleteBtn = document.getElementById('deleteAvatarBtn');

            if (data.avatarUrls?.thumbnail) {
                avatarImage.src = data.avatarUrls.thumbnail;
                avatarImage.classList.remove('hidden');
                avatarPlaceholder.classList.add('hidden');
                deleteBtn.classList.remove('hidden');
            } else {
                avatarImage.classList.add('hidden');
                avatarPlaceholder.classList.remove('hidden');
                deleteBtn.classList.add('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading avatar:', error);
    }
}

// Upload avatar button
document.getElementById('uploadAvatarBtn').addEventListener('click', () => {
    document.getElementById('avatarInput').click();
});

// Handle avatar file selection
document.getElementById('avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPG, PNG, GIF, or WebP)', 'Invalid File');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('Image must be smaller than 5MB', 'File Too Large');
        return;
    }

    // Show loading state
    const avatarSection = document.querySelector('.avatar-section');
    avatarSection.classList.add('avatar-uploading');

    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/user/avatar', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            // Update avatar display
            const avatarImage = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            const deleteBtn = document.getElementById('deleteAvatarBtn');

            avatarImage.src = data.avatarThumbnail + '?t=' + Date.now(); // Cache bust
            avatarImage.classList.remove('hidden');
            avatarPlaceholder.classList.add('hidden');
            deleteBtn.classList.remove('hidden');

            showSuccess('Avatar uploaded successfully!', 'Success');
        } else {
            showError(data.error || 'Failed to upload avatar', 'Upload Failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showError('Network error. Please try again.', 'Error');
    } finally {
        avatarSection.classList.remove('avatar-uploading');
        e.target.value = ''; // Reset file input
    }
});

// Delete avatar button
document.getElementById('deleteAvatarBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) {
        return;
    }

    const avatarSection = document.querySelector('.avatar-section');
    avatarSection.classList.add('avatar-uploading');

    try {
        const response = await fetch('/api/user/avatar', {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
            // Update avatar display
            const avatarImage = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            const deleteBtn = document.getElementById('deleteAvatarBtn');

            avatarImage.classList.add('hidden');
            avatarPlaceholder.classList.remove('hidden');
            deleteBtn.classList.add('hidden');

            showSuccess('Avatar deleted successfully!', 'Success');
        } else {
            showError(data.error || 'Failed to delete avatar', 'Delete Failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showError('Network error. Please try again.', 'Error');
    } finally {
        avatarSection.classList.remove('avatar-uploading');
    }
});

// Fetch user session
async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/get-session', {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            displayUserInfo(data);
        } else {
            // Session invalid, redirect to sign in
            window.location.href = '/signin.html';
        }
    } catch (error) {
        console.error('Error fetching session:', error);
        document.getElementById('userInfo').innerHTML = `
            <p class="error-text"><i class="fas fa-exclamation-circle"></i> Error loading user information</p>
        `;
    }
}

function displayUserInfo(data) {
    const userInfoDiv = document.getElementById('userInfo');

    const verificationBadge = data.user.emailVerified
        ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Verified</span>'
        : '<span class="badge badge-error"><i class="fas fa-times-circle"></i> Not Verified</span>';

    const resendButton = !data.user.emailVerified
        ? '<button id="resendVerificationBtn" class="btn btn-secondary" style="margin-top: 10px;"><i class="fas fa-paper-plane"></i> Resend Verification Email</button>'
        : '';

    const adminLink = data.user.role === 'admin'
        ? '<p><a href="/admin.html" class="btn btn-primary" style="text-decoration: none; display: inline-block; margin-top: 10px;"><i class="fas fa-user-shield"></i> Admin Dashboard</a></p>'
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
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ email: data.user.email }),
                    });

                    if (response.ok) {
                        resendBtn.innerHTML = '<i class="fas fa-check"></i> Email Sent!';
                        resendBtn.classList.remove('btn-secondary');
                        resendBtn.classList.add('btn-success');
                        showSuccess('Verification email sent! Please check your inbox.', 'Email Sent');
                    } else {
                        resendBtn.disabled = false;
                        resendBtn.textContent = 'Resend Verification Email';
                        showError('Failed to send verification email. Please try again.', 'Error');
                    }
                } catch (error) {
                    console.error('Error sending verification email:', error);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Verification Email';
                    showError('Network error. Please try again.', 'Error');
                }
            });
        }
    }
}

// Sign out functionality
document.getElementById('signoutBtn').addEventListener('click', async () => {
    try {
        await authClient.signOut();
    } catch (error) {
        console.error('Sign out error:', error);
    }

    // Redirect to home
    window.location.href = '/index.html';
});

// Load user info on page load
loadUserInfo();
loadAvatar();
