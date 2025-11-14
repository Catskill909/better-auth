// Better Auth Client Setup
const authClient = BetterAuthClient.createAuthClient({
    baseURL: window.location.origin,
    fetchOptions: {
        credentials: 'include'
    }
});
