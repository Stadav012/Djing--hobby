import { NextResponse } from 'next/server';
import { ChatOllama } from "@langchain/ollama";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

export async function GET() {
    try {
        // Mock trending data (since we don't have a real search API key)
        const trendingTopics = [
            "Amapiano global takeover",
            "Fred again.. boiler room style",
            "Hard techno resurgence 150bpm+",
            "UK Garage revival 2025",
            "Latin Tech House fusion"
        ];

        const model = new ChatOllama({
            baseUrl: "http://localhost:11434",
            model: "gemma3:4b",
            temperature: 0.8,
        });

        const systemPrompt = `You are a Music Trend Analyst. 
    Analyze the provided list of trending music topics.
    For each topic, explain WHY it is trending and what DJs should know about it.
    Return a JSON array of objects with keys: "topic", "analysis", "hypeScore" (1-10).
    Keep explanations punchy and cool.`;

        let trends = [];

        try {
            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Ollama timeout')), 2000)
            );

            const response = await Promise.race([
                model.invoke([
                    new SystemMessage(systemPrompt),
                    new HumanMessage(`Analyze these trends: ${trendingTopics.join(', ')}`),
                ]),
                timeoutPromise
            ]) as any;

            const content = response.content.toString();
            const jsonMatch = content.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                trends = JSON.parse(jsonMatch[0]);
            } else {
                trends = JSON.parse(content);
            }
        } catch (e) {
            console.warn("Ollama failed or timed out, using fallback data:", e);
            // Fallback to mock data
            trends = trendingTopics.map(t => ({
                topic: t,
                analysis: "Global signal detected. High resonance in underground circuits.",
                hypeScore: Math.floor(Math.random() * 3) + 7
            }));
        }

        return NextResponse.json({ trends });

    } catch (error) {
        console.error('Trend API Critical Error:', error);
        // Ultimate fallback
        return NextResponse.json({
            trends: [
                { topic: "System Offline", analysis: "Unable to connect to trend database.", hypeScore: 0 }
            ]
        });
    }
}
