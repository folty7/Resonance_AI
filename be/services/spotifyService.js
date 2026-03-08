// Service for handling Spotify API interactions

/**
 * Fetch a user's most recently saved tracks.
 * @param {SpotifyWebApi} spotifyApi The authenticated SpotifyWebApi instance.
 * @param {number} limit Maximum number of tracks to fetch (max 50 per request).
 * @returns {Promise<Array>} Array of track objects.
 */
const getSavedTracks = async (spotifyApi, limit = 50) => {
    try {
        let allItems = [];
        for (let offset = 0; offset < limit; offset += 50) {
            const currentLimit = Math.min(50, limit - offset);
            const data = await spotifyApi.getMySavedTracks({ limit: currentLimit, offset });
            allItems = allItems.concat(data.body.items);

            // If Spotify returned fewer items than requested, we've reached the end
            if (data.body.items.length < currentLimit) break;
        }

        // Map tracks to a simpler format
        return allItems.map(item => ({
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map(a => a.name).join(', '),
            uri: item.track.uri
        }));
    } catch (error) {
        console.error('Error fetching saved tracks:', error);
        throw new Error('Failed to fetch saved tracks from Spotify');
    }
};



/**
 * Creates grouped playlists on Spotify and adds tracks.
 * @param {SpotifyWebApi} spotifyApi The authenticated SpotifyWebApi instance.
 * @param {Object} categorizedPlaylists Object where keys are playlist names and values are arrays of track URIs.
 */
const createGroupedPlaylists = async (spotifyApi, categorizedPlaylists) => {
    try {
        const results = [];

        // Iterate through each category
        for (const [playlistName, trackUris] of Object.entries(categorizedPlaylists)) {
            if (!trackUris || trackUris.length === 0) continue;

            // Create the playlist
            const playlistResponse = await spotifyApi.createPlaylist(playlistName, {
                description: `Created by Smart Sort AI - Vibes: ${playlistName}`,
                public: false
            });

            const playlistId = playlistResponse.body.id;
            const playlistUrl = playlistResponse.body.external_urls.spotify;

            // Add tracks to the newly created playlist (max 100 per request, assuming < 100 for now)
            await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

            results.push({ name: playlistName, id: playlistId, url: playlistUrl });
        }

        return results;
    } catch (error) {
        console.error('Error creating grouped playlists:', error);
        throw new Error('Failed to create playlists on Spotify');
    }
};

module.exports = {
    getSavedTracks,
    createGroupedPlaylists
};
