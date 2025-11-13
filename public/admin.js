// Admin dashboard functionality
let currentPage = 1;
let limit = 10;
let searchQuery = '';
let currentFilter = 'all';

// Check if user is admin on page load
async function checkAdminAccess() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = '/signin.html';
        return false;
    }

    try {
        const response = await fetch('/api/auth/get-session', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            window.location.href = '/signin.html';
            return false;
        }

        const data = await response.json();
        if (!data.user) {
            window.location.href = '/signin.html';
            return false;
        }

        // Check if user has admin role
        if (data.user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = '/dashboard.html';
            return false;
        }

        // Display admin info in sidebar
        document.getElementById('adminName').textContent = data.user.name || data.user.email;
        document.getElementById('adminEmail').textContent = data.user.email;

        return true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        window.location.href = '/signin.html';
        return false;
    }
}

// Load users from Better Auth admin API
async function loadUsers() {
    const token = localStorage.getItem('authToken');
    document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7" class="loading">Loading users...</td></tr>';

    try {
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: ((currentPage - 1) * limit).toString()
        });

        if (searchQuery) {
            params.append('searchValue', searchQuery);
            params.append('searchField', 'email');
        }

        if (currentFilter !== 'all') {
            if (currentFilter === 'verified') {
                params.append('filterField', 'emailVerified');
                params.append('filterValue', 'true');
            } else if (currentFilter === 'unverified') {
                params.append('filterField', 'emailVerified');
                params.append('filterValue', 'false');
            } else if (currentFilter === 'banned') {
                params.append('filterField', 'banned');
                params.append('filterValue', 'true');
            } else if (currentFilter === 'admin') {
                params.append('filterField', 'role');
                params.append('filterValue', 'admin');
            }
        }

        const response = await fetch(`/api/auth/admin/list-users?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        displayUsers(data.users || []);
        updateStats(data.total || 0);
        updatePagination(data.total || 0);

    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="7">Error loading users</td></tr>';
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No users found</td></tr>';
        return;
    }

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td><span class="badge badge-${user.role === 'admin' ? 'admin' : 'user'}">${user.role || 'user'}</span></td>
            <td><span class="badge badge-${user.emailVerified ? 'verified' : 'unverified'}">${user.emailVerified ? 'Verified' : 'Unverified'}</span></td>
            <td>${user.banned ? '<span class="badge badge-banned">Banned</span>' : '<span class="badge badge-verified">Active</span>'}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-small btn-warning" onclick="toggleBanUser('${user.id}', ${user.banned})">${user.banned ? 'Unban' : 'Ban'}</button>
                <button class="btn btn-small btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
async function updateStats(totalUsers) {
    const token = localStorage.getItem('authToken');

    document.getElementById('totalUsers').textContent = totalUsers;

    try {
        // Fetch verified users count
        const verifiedResponse = await fetch('/api/auth/admin/list-users?filterField=emailVerified&filterValue=true&limit=1000', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const verifiedData = await verifiedResponse.json();
        document.getElementById('verifiedUsers').textContent = verifiedData.total || 0;

        // Fetch banned users count
        const bannedResponse = await fetch('/api/auth/admin/list-users?filterField=banned&filterValue=true&limit=1000', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bannedData = await bannedResponse.json();
        document.getElementById('bannedUsers').textContent = bannedData.total || 0;

        // Fetch admin users count
        const adminResponse = await fetch('/api/auth/admin/list-users?filterField=role&filterValue=admin&limit=1000', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const adminData = await adminResponse.json();
        document.getElementById('adminUsers').textContent = adminData.total || 0;

    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Update pagination
function updatePagination(total) {
    const totalPages = Math.ceil(total / limit);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

// Create new user
async function createUser() {
    const token = localStorage.getItem('authToken');
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;

    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('/api/auth/admin/create-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                email,
                password,
                role
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create user');
        }

        alert('User created successfully');
        closeModal('createUserModal');
        document.getElementById('createUserForm').reset();
        loadUsers();

    } catch (error) {
        console.error('Error creating user:', error);
        alert('Error creating user: ' + error.message);
    }
}

// Edit user
async function editUser(userId) {
    const token = localStorage.getItem('authToken');

    try {
        // Get user details
        const response = await fetch(`/api/auth/admin/list-users?limit=1000`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        const user = data.users.find(u => u.id === userId);

        if (!user) {
            alert('User not found');
            return;
        }

        // Populate edit form
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name || '';
        document.getElementById('editUserEmail').value = user.email;
        document.getElementById('editUserRole').value = user.role || 'user';
        document.getElementById('editUserVerified').checked = user.emailVerified;

        showModal('editUserModal');

    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Error loading user details');
    }
}

// Update user
async function updateUser() {
    const token = localStorage.getItem('authToken');
    const userId = document.getElementById('editUserId').value;
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const role = document.getElementById('editUserRole').value;
    const verified = document.getElementById('editUserVerified').checked;

    try {
        // Update user details
        const updateResponse = await fetch('/api/auth/admin/update-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId,
                data: {
                    name,
                    email,
                    emailVerified: verified
                }
            })
        });

        if (!updateResponse.ok) {
            throw new Error('Failed to update user');
        }

        // Update role if changed
        const roleResponse = await fetch('/api/auth/admin/set-role', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                userId,
                role
            })
        });

        if (!roleResponse.ok) {
            throw new Error('Failed to update role');
        }

        alert('User updated successfully');
        closeModal('editUserModal');
        loadUsers();

    } catch (error) {
        console.error('Error updating user:', error);
        alert('Error updating user: ' + error.message);
    }
}

// Delete user
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }

    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch('/api/auth/admin/remove-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        alert('User deleted successfully');
        loadUsers();

    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
    }
}

// Toggle ban status
async function toggleBanUser(userId, isBanned) {
    const token = localStorage.getItem('authToken');
    const endpoint = isBanned ? '/api/auth/admin/unban-user' : '/api/auth/admin/ban-user';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`Failed to ${isBanned ? 'unban' : 'ban'} user`);
        }

        alert(`User ${isBanned ? 'unbanned' : 'banned'} successfully`);
        loadUsers();

    } catch (error) {
        console.error('Error toggling ban status:', error);
        alert('Error updating ban status: ' + error.message);
    }
}

// Load user sessions
async function loadSessions() {
    const token = localStorage.getItem('authToken');
    const container = document.getElementById('sessionsContainer');
    container.innerHTML = '<p class="loading">Loading sessions...</p>';

    try {
        const response = await fetch('/api/auth/admin/list-sessions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        displaySessions(data.sessions || []);

    } catch (error) {
        console.error('Error loading sessions:', error);
        container.innerHTML = '<p>Error loading sessions</p>';
    }
}

// Display sessions
function displaySessions(sessions) {
    const container = document.getElementById('sessionsContainer');

    if (sessions.length === 0) {
        container.innerHTML = '<p>No active sessions found</p>';
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>User Email</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                    <th>Created At</th>
                    <th>Expires At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${sessions.map(session => `
                    <tr>
                        <td>${session.user?.email || 'N/A'}</td>
                        <td>${session.ipAddress || 'N/A'}</td>
                        <td>${session.userAgent || 'N/A'}</td>
                        <td>${new Date(session.createdAt).toLocaleString()}</td>
                        <td>${new Date(session.expiresAt).toLocaleString()}</td>
                        <td>
                            <button class="btn btn-small btn-danger" onclick="revokeSession('${session.token}')">Revoke</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Revoke session
async function revokeSession(sessionToken) {
    if (!confirm('Are you sure you want to revoke this session?')) {
        return;
    }

    const token = localStorage.getItem('authToken');

    try {
        const response = await fetch('/api/auth/admin/revoke-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionToken })
        });

        if (!response.ok) {
            throw new Error('Failed to revoke session');
        }

        alert('Session revoked successfully');
        loadSessions();

    } catch (error) {
        console.error('Error revoking session:', error);
        alert('Error revoking session: ' + error.message);
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');
    event.target.closest('.nav-item').classList.add('active');

    if (sectionId === 'usersSection') {
        loadUsers();
    } else if (sectionId === 'sessionsSection') {
        loadSessions();
    }
}

// Pagination
function nextPage() {
    currentPage++;
    loadUsers();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadUsers();
    }
}

// Search
function searchUsers() {
    searchQuery = document.getElementById('searchInput').value;
    currentPage = 1;
    loadUsers();
}

// Filter
function filterUsers(filter) {
    currentFilter = filter;
    currentPage = 1;
    loadUsers();
}

// Sign out
function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('authToken');
        window.location.href = '/signin.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    const isAdmin = await checkAdminAccess();
    if (isAdmin) {
        loadUsers();
    }
});
