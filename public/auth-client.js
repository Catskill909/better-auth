// Better Auth Client Setup
// This file must be loaded from a CDN since better-auth/client is not available in browser directly
// We'll use the fetch API directly instead

const authClient = {
    signIn: {
        social: async ({ provider, callbackURL }) => {
            // For social login, we redirect to Better Auth's social sign-in endpoint
            const url = new URL(`${window.location.origin}/api/auth/sign-in/social`);
            url.searchParams.set('provider', provider);
            if (callbackURL) {
                url.searchParams.set('callbackURL', callbackURL);
            }
            window.location.href = url.toString();
        }
    }
};
