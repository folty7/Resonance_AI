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

        // 1. Get the current user's ID
        const meResponse = await spotifyApi.getMe();
        const userId = meResponse.body.id;
        const accessToken = spotifyApi.getAccessToken();

        console.log(`[Spotify Debug] Fetching /users/${userId}/playlists`);
        console.log(`[Spotify Debug] Token snippet: ${accessToken?.substring(0, 10)}... (Length: ${accessToken?.length})`);

        // Iterate through each category
        for (const [playlistName, trackUris] of Object.entries(categorizedPlaylists)) {
            if (!trackUris || trackUris.length === 0) continue;

            console.log(`[Spotify Debug] Attempting to create playlist: "${playlistName}" for User: ${userId}`);

            // 2. Create the playlist manually to avoid spotify-web-api-node deprecated /me/ route
            const createRes = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: playlistName,
                    description: `Created by Resonance AI - Vibes: ${playlistName}`,
                    public: true
                })
            });

            if (!createRes.ok) {
                const errText = await createRes.text();
                if (createRes.status === 403) {
                    throw new Error(`Insufficient Spotify scope. Please log out and log back in to grant playlist modifying permissions. (Details: ${errText})`);
                }
                throw new Error(`Failed to create playlist: ${errText}`);
            }

            const playlistData = await createRes.json();
            const playlistId = playlistData.id;
            const playlistUrl = playlistData.external_urls.spotify;

            // 3. Add tracks to the newly created playlist
            await spotifyApi.addTracksToPlaylist(playlistId, trackUris);

            results.push({ name: playlistName, id: playlistId, url: playlistUrl });
        }

        return results;
    } catch (error) {
        console.error('Error creating grouped playlists:', error);
        throw error;
    }
};

module.exports = {
    getSavedTracks,
    createGroupedPlaylists
};
