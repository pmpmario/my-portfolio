export async function handler(event, context) {
    try {
        const code = event.queryStringParameters?.code;
        if (!code) return { statusCode: 400, body: "Missing code parameter." };

        // Netlify environment variables
        const client_id = process.env.GITHUB_CLIENT_ID;
        const client_secret = process.env.GITHUB_CLIENT_SECRET;

        // Debug logs
        console.log("GitHub OAuth code:", code);
        console.log("Client ID:", client_id);
        console.log("Client Secret set?", client_secret ? "YES" : "NO");

        if (!client_id || !client_secret) {
            return { statusCode: 500, body: "GitHub client ID or secret not set in Netlify env variables." };
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ client_id, client_secret, code })
        });

        const tokenData = await tokenResponse.json();
        console.log("Token response from GitHub:", tokenData);

        const accessToken = tokenData.access_token;
        if (!accessToken) return { statusCode: 400, body: "Failed to get access token." };

        // Get GitHub user info
        const userResponse = await fetch("https://api.github.com/user", {
            headers: { "Authorization": `token ${accessToken}` }
        });
        const userData = await userResponse.json();
        console.log("GitHub user data:", userData);

        // Only allow your GitHub username
        if (userData.login === "pmpmario") {  // <-- replace with your GitHub username
            return {
                statusCode: 302,
                headers: {
                    "Location": `https://pmpmario.github.io/my-portfolio/admin.html?token=${accessToken}`
                },
                body: ""
            };
        } else {
            return { statusCode: 403, body: "Unauthorized: You are not allowed to access this page." };
        }

    } catch (error) {
        console.error("Error in OAuth callback:", error);
        return { statusCode: 500, body: `Server error: ${error.message}` };
    }
}
