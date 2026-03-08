const { GoogleGenAI } = require('@google/genai');

/**
 * Sends track data to Gemini to get it smartly categorized based on audio features and names.
 * @param {Array} tracksData Array of lean track objects containing names, artists, and audio features. 
 * @returns {Promise<Object>} JSON response mapping category names to arrays of full track URIs.
 */
const generateSmartSort = async (tracksData, customPrompt = "") => {
    try {
        const ai = new GoogleGenAI({}); // Automatically picks up GEMINI_API_KEY from environment 

        const leanPayload = JSON.stringify(tracksData);

        const customInstructions = customPrompt.trim() !== ""
            ? `\n    USER PREFERENCES: The user has specifically requested the following categorization rules:\n    "${customPrompt}"\n    You MUST prioritize organizing the tracks into these exact requested categories where applicable.\n`
            : "";

        // Create the system prompt enforcing a strict JSON schema
        const prompt = `You are an expert music curator AI. Your task is to analyze the provided list of Spotify tracks and their artists.
    Sort these tracks into creative, vibe-based or genre-based categories.
    Use your vast knowledge of these artists and songs to infer the mood and genre since raw audio features are not provided.
    ${customInstructions}
    Rules:
    1. Every single track provided MUST be placed into exactly ONE category.
    2. Try to create between 3 and 6 total categories (unless the USER PREFERENCES dictate otherwise). 
    3. You must respond ONLY with a valid stringified JSON object. 
    4. The structure of the JSON MUST strictly map string keys (the creative category name) to an array of strings (the full Spotify URIs of the tracks). 
    5. CRITICAL: Do NOT invent, hallucinate, or modify the URIs. You MUST use the exact "uri" string exactly as it is provided to you in the Track Data payload.
    
    Example output format (using the exact URIs provided in the input data):
    {
      "Late Night Drive": ["spotify:track:1234567890abcdef", "spotify:track:0987654321fedcba"],
      "Workout Anthems": ["spotify:track:abcde12345fghij", "spotify:track:fghij67890abcde"]
    }
    
    Track Data:
    ${leanPayload}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        const resultText = response.text;

        if (!resultText) {
            throw new Error("AI returned empty response");
        }

        return JSON.parse(resultText);

    } catch (error) {
        console.error("AI Service Error:", error);
        throw new Error("Failed to process tracks via AI");
    }
};

module.exports = {
    generateSmartSort
};
