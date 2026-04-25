const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');
const geminiService = require('../services/geminiService');

// @route   GET /api/tracks
// @desc    Fetch saved tracks (default 1000, capped at 5000 server-side),
//          enriched with genres + album art.
router.get('/tracks', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 1000;
        const tracks = await spotifyService.getSavedTracks(req.spotifyApi, limit);
        const enriched = await spotifyService.enrichTracksWithGenres(req.spotifyApi, tracks);
        res.json({ success: true, count: enriched.length, data: enriched });
    } catch (error) {
        console.error('Tracks error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @route   GET /api/sort/parameters
// @desc    Available grouping parameters for the UI (genre, year, mood, ...)
router.get('/sort/parameters', (_req, res) => {
    res.json({ success: true, parameters: geminiService.AVAILABLE_PARAMETERS });
});

// @route   POST /api/sort
// @desc    Group the supplied tracks into playlists via Gemini. Honors the
//          x-gemini-api-key header when present (per-user key from Settings),
//          otherwise falls back to the server-configured key.
router.post('/sort', async (req, res) => {
    try {
        const { tracks, parameters, extra } = req.body;
        const userApiKey = req.header('x-gemini-api-key') || null;

        if (!Array.isArray(tracks) || tracks.length === 0) {
            return res.status(400).json({ error: 'tracks array is required' });
        }
        if (!Array.isArray(parameters) || parameters.length === 0) {
            return res.status(400).json({ error: 'parameters must be a non-empty array (e.g. ["genre", "year"])' });
        }

        const groups = await geminiService.groupTracksByParameters(tracks, parameters, extra, userApiKey);
        res.json({ success: true, groups });
    } catch (error) {
        console.error('Sort error:', error);
        res.status(500).json({ error: error.message || 'Failed to sort tracks' });
    }
});

// @route   POST /api/playlists
// @desc    Create playlists on Spotify. Accepts a single { playlistName, uris } or
//          { groups: [{ name, uris }] } for bulk creation.
router.post('/playlists', async (req, res) => {
    try {
        const { playlistName, uris, groups } = req.body;

        let categorizedPlaylists;
        if (Array.isArray(groups) && groups.length > 0) {
            categorizedPlaylists = Object.fromEntries(
                groups
                    .filter(g => g && g.name && Array.isArray(g.uris) && g.uris.length > 0)
                    .map(g => [g.name, g.uris])
            );
            if (Object.keys(categorizedPlaylists).length === 0) {
                return res.status(400).json({ error: 'groups must contain at least one playlist with uris' });
            }
        } else if (playlistName && Array.isArray(uris)) {
            categorizedPlaylists = { [playlistName]: uris };
        } else {
            return res.status(400).json({ error: 'Invalid payload. Expected playlistName+uris, or groups array.' });
        }

        console.log("Creating playlist(s) on Spotify...");
        const results = await spotifyService.createGroupedPlaylists(req.spotifyApi, categorizedPlaylists);

        res.json({ success: true, created_playlists: results });

    } catch (error) {
        console.error("Playlist Creation Error:", error);
        res.status(500).json({ error: error.message || "Failed to create playlists" });
    }
});

module.exports = router;
