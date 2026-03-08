const express = require('express');
const router = express.Router();
const spotifyService = require('../services/spotifyService');
const aiService = require('../services/aiService');

// @route   GET /api/tracks
// @desc    Test fetching user saved tracks directly
router.get('/tracks', async (req, res) => {
    try {
        const tracks = await spotifyService.getSavedTracks(req.spotifyApi, 10);
        res.json({ success: true, count: tracks.length, data: tracks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @route   POST /api/smart-sort
// @desc    Fetch library, get features, process via AI, return categories
router.post('/smart-sort', async (req, res) => {
    try {
        const api = req.spotifyApi;
        const { customPrompt } = req.body;

        // 1. Fetch tracks 
        console.log("Fetching tracks from Spotify...");
        const rawTracks = await spotifyService.getSavedTracks(api, 100);

        if (rawTracks.length === 0) {
            return res.status(400).json({ error: "No saved tracks found in library." });
        }

        // 4. Send to Gemini using basic track names and artists
        console.log("Calling Gemini API...");
        const categorizedUris = await aiService.generateSmartSort(rawTracks, customPrompt);

        // 5. Structure the final response for frontend rendering
        // Map the categorized URIs back to the raw track objects so the UI can display titles/artists
        const categorizedData = {};
        for (const [category, trackUris] of Object.entries(categorizedUris)) {
            categorizedData[category] = trackUris.map(uri => {
                return rawTracks.find(t => t.uri === uri) || { uri, name: "Unknown Track", artists: "Unknown" };
            });
        }

        console.log("Categorization complete.");
        res.json({ success: true, categories: categorizedData });

    } catch (error) {
        console.error("Smart Sort Endpoint ERror:", error);
        res.status(500).json({ error: error.message || "Failed to perform smart sort." });
    }
});

// @route   POST /api/playlists
// @desc    Create playlists and add tracks given categorized URIs
router.post('/playlists', async (req, res) => {
    try {
        const mappedUris = req.body; // Expects { "Workout": ["spotify:track:xx", ...], ... }
        if (!mappedUris || typeof mappedUris !== 'object') {
            return res.status(400).json({ error: "Invalid payload. Expected JSON object mapping names to track URIs." });
        }

        // We only need the URIs for the spotify API, not the full rich objects
        // Let's ensure the payload is clean just in case the frontend sends the rich objects back
        const cleanUriMap = {};
        for (const [category, tracks] of Object.entries(mappedUris)) {
            // Check if array elements are strings (URIs) or objects
            if (tracks.length > 0 && typeof tracks[0] === 'object') {
                cleanUriMap[category] = tracks.map(t => t.uri);
            } else {
                cleanUriMap[category] = tracks;
            }
        }

        console.log("Creating playlists on Spotify...");
        const results = await spotifyService.createGroupedPlaylists(req.spotifyApi, cleanUriMap);

        res.json({ success: true, created_playlists: results });

    } catch (error) {
        console.error("Playlist Creation Error:", error);
        res.status(500).json({ error: error.message || "Failed to create playlists" });
    }
});

module.exports = router;
