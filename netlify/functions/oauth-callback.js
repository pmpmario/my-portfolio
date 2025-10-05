export async function handler(event, context) {
    try {
        const code = event.queryStringParameters.code;
        if (!code) return { statusCode: 400, body: "Missing code parameter." };

        // Netlify environment variables
        const client_id = process.env.GITHUB_CLIENT_ID;
        const client_secret = process.env.GITHUB_CLIENT_SECRET;

        // Exchange code for access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: JSON.stringify({ client_id, client_secret, code })
        });
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        if (!accessToken) return { statusCode: 400, body: "Failed to get access token." };

        // Get GitHub user info
        const userResponse = await fetch("https://api.github.com/user", {
            headers: { "Authorization": `token ${accessToken}` }
        });
        const userData = await userResponse.json();

        // Only allow your GitHub username
        if (userData.login === "pmpmario") {  // <-- Replace with your GitHub username
            return {
                statusCode: 302,
                headers: {
                    // Full GitHub Pages admin.html URL
                    "Location": `https://pmpmario.github.io/my-portfolio/admin.html?token=${accessToken}`
                },
                body: ""
            };
        } else {
            return { statusCode: 403, body: "Unauthorized: You are not allowed to access this page." };
        }

    } catch (error) {
        return { statusCode: 500, body: `Server error: ${error.message}` };
    }
}
