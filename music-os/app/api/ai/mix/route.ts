import { NextResponse } from 'next/server';
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
    try {
        const { track, folderTracks } = await req.json();

        if (!track || !folderTracks) {
            return NextResponse.json({ error: 'Missing track or folder data' }, { status: 400 });
        }

        const model = new ChatOllama({
            baseUrl: "http://localhost:11434",
            model: "gemma3:4b",
            temperature: 0.7,
        });

        const systemPrompt = `You are a world-class DJ and Music Theory expert. 
    Your task is to analyze a target track and recommend the best mixing options from a provided list of candidate tracks.
    
    Use the Camelot Wheel for harmonic mixing:
    - Same Key (e.g., 8A -> 8A)
    - +/- 1 Hour (e.g., 8A -> 7A or 9A)
    - Relative Major/Minor (e.g., 8A -> 8B)
    
    Also consider BPM compatibility (usually +/- 5-10% range).
    
    Provide a concise, professional explanation for your top 3 recommendations.
    Format your response as a JSON array of objects with keys: "fileName", "reason", "compatibilityScore" (1-100).
    ONLY return the JSON array, no other text.`;

        const userPrompt = `Target Track:
    Title: ${track.title || track.fileName}
    BPM: ${track.bpm || 'Unknown'}
    Key: ${track.key || 'Unknown'}
    Genre: ${track.genre?.join(', ') || 'Unknown'}

    Candidate Tracks:
    ${folderTracks.map((t: any) => `- ${t.fileName} (BPM: ${t.bpm}, Key: ${t.key})`).join('\n')}
    
    Recommend the best mixes.`;

        const response = await model.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(userPrompt),
        ]);

        // Attempt to parse JSON from the response
        let recommendations = [];
        try {
            const content = response.content.toString();
            // Extract JSON if wrapped in code blocks
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            } else {
                recommendations = JSON.parse(content);
            }
        } catch (e) {
            console.error("Failed to parse LLM response:", response.content);
            return NextResponse.json({ error: 'Failed to parse AI recommendation', raw: response.content }, { status: 500 });
        }

        return NextResponse.json({ recommendations });

    } catch (error) {
        console.error('AI API Error:', error);
        return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
    }
}
