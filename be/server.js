require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URI = process.env.FRONTEND_URI || 'http://127.0.0.1:5173';

// Extensive Custom CORS Middleware for Local Development
app.use((req, res, next) => {
    const allowedOrigins = [FRONTEND_URI, 'http://localhost:5173', 'http://127.0.0.1:5173', 'null'];
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Required for cookies
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials, x-gemini-api-key');

    // Chrome Private Network Access Preflight
    if (req.headers['access-control-request-private-network']) {
        res.setHeader('Access-Control-Allow-Private-Network', 'true');
    }

    // Handle Preflight OPTIONS rapidly
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

app.use(express.json());
app.use(cookieParser());

// Initialize Spotify Web API Node
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Helper functions for random strings
const generateRandomString = function (length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

// --- Routes ---

app.get('/auth/login', (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    // Requesting permissions
    const scopes = ['user-read-private', 'user-read-email', 'user-library-read', 'playlist-modify-public', 'playlist-modify-private', 'user-top-read'];

    // Normal login flow without forcing consent dialog
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);
    res.redirect(authorizeURL);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect(FRONTEND_URI + '/#' +
            new URLSearchParams({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);

        try {
            const data = await spotifyApi.authorizationCodeGrant(code);

            const access_token = data.body['access_token'];
            const refresh_token = data.body['refresh_token'];
            const expires_in = data.body['expires_in'];

            // Set cookies
            res.cookie('access_token', access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: expires_in * 1000,
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            });

            res.cookie('refresh_token', refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
            });

            res.redirect(FRONTEND_URI + '/dashboard');

        } catch (error) {
            console.error('Error exchanging code for tokens:', error);
            res.redirect(FRONTEND_URI + '/#' +
                new URLSearchParams({
                    error: 'invalid_token'
                }));
        }
    }
});

// Mount protected API routes
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ success: true, message: 'Logged out successfully' });
});

const apiRoutes = require('./routes/api');
const { requireAuth } = require('./middleware/auth');
app.use('/api', requireAuth, apiRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
