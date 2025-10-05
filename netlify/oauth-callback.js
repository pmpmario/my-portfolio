import fetch from "node-fetch";

export async function handler(event, context) {
    const code = event.queryStringParameters.code;
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

    // Verify GitHub user
    const userResponse = await fetch("https://api.github.com/user", {
        headers: { "Authorization": `token ${accessToken}` }
    });
    const userData = await userResponse.json();

    // Only allow your GitHub username
    if(userData.login === "YOUR_GITHUB_USERNAME"){
        return {
            statusCode: 302,
            headers: { "Location": `/admin.html?token=${accessToken}` },
            body: ""
        };
    } else {
        return { statusCode: 403, body: "Unauthorized" };
    }
}
