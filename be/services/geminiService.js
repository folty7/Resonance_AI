const { GoogleGenAI } = require('@google/genai');

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

let client = null;
const getClient = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured on the server');
    }
    if (!client) {
        client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return client;
};

const PARAMETER_HINTS = {
    genre: 'primary artist genre(s)',
    year: 'release year or decade (e.g. 1990s, 2010s, 2020s)',
    mood: 'overall mood/energy (e.g. chill, upbeat, melancholic, hype)',
    artist: 'the performing artist',
    popularity: 'Spotify popularity score (0-100 global)',
    language: 'language of the lyrics',
    tempo: 'perceived tempo (slow / medium / fast)'
};

/**
 * Ask Gemini to group tracks into playlists using the selected parameters.
 * @param {Array} tracks Enriched Spotify tracks.
 * @param {string[]} parameters One or more keys from PARAMETER_HINTS.
 * @param {string} [extra] Optional free-text user guidance.
 */
const groupTracksByParameters = async (tracks, parameters, extra = '') => {
    const ai = getClient();

    const usedParams = (parameters || []).filter(p => PARAMETER_HINTS[p]);
    if (usedParams.length === 0) {
        throw new Error('At least one grouping parameter is required');
    }

    const paramSpec = usedParams
        .map(p => `- ${p}: ${PARAMETER_HINTS[p]}`)
        .join('\n');

    const trackSummaries = tracks.map(t => ({
        uri: t.uri,
        name: t.name,
        artists: t.artists,
        genres: t.genres || [],
        year: t.year,
        popularity: t.popularity
    }));

    const prompt = `You are a music curator. Group the following Spotify tracks into playlists using these parameters:\n${paramSpec}\n${extra ? `\nAdditional instructions: ${extra}\n` : ''}
Rules:
- Every track URI must appear in exactly one group.
- Aim for 3-6 well-balanced groups; each with at least 2 tracks when possible.
- Name each playlist concisely (max 40 chars) and write a one-sentence description.
- Base names on the parameters actually used (e.g. "90s Rock", "Chill Indie 2020s").
- If any field is missing or empty (genres, year, mood, tempo, language, etc.), use your knowledge of the track and artist to infer it.

Return ONLY JSON: { "groups": [ { "name": string, "description": string, "uris": string[] } ] }

Tracks:
${JSON.stringify(trackSummaries, null, 2)}`;

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: 'object',
                properties: {
                    groups: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string' },
                                description: { type: 'string' },
                                uris: { type: 'array', items: { type: 'string' } }
                            },
                            required: ['name', 'description', 'uris']
                        }
                    }
                },
                required: ['groups']
            }
        }
    });

    let parsed;
    try {
        const raw = response.text;
        parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!parsed || typeof parsed !== 'object') throw new Error('not an object');
    } catch (err) {
        console.error('Gemini parse failed. Raw response.text:', response.text);
        throw new Error('AI response could not be parsed');
    }

    const validUris = new Set(tracks.map(t => t.uri));
    return (parsed.groups || [])
        .map(g => ({
            name: String(g.name || 'Untitled').slice(0, 100),
            description: String(g.description || '').slice(0, 280),
            uris: (g.uris || []).filter(uri => validUris.has(uri))
        }))
        .filter(g => g.uris.length > 0);
};

module.exports = {
    groupTracksByParameters,
    AVAILABLE_PARAMETERS: Object.keys(PARAMETER_HINTS)
};
