import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            boxes,
            truckDimensions,
            scores,
            loadingSequence
        } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
      Act as a Senior Logistics Supervisor. Analyze this truck loading plan and provide a professional summary for the manifest.
      
      **Data:**
      - Truck: ${truckDimensions.width}x${truckDimensions.height}x${truckDimensions.length} ft
      - Total Items: ${boxes.length}
      - Stability Score: ${scores.stability}%
      - Optimization Score: ${scores.optimization}%
      - Safety Score: ${scores.safety}%
      - Heavy Items (>500lbs): ${boxes.filter((b: any) => b.weight > 500).length}
      - Fragile Items: ${boxes.filter((b: any) => b.isFragile).length}

      **Instructions:**
      1. Write a 3-4 sentence "Executive Loading Summary".
      2. Highlight specific strengths (e.g., "Heavy items correctly placed at base").
      3. Flag any risks if scores are below 80%.
      4. Use professional logistics terminology.
      5. Do NOT use markdown. Just plain text.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ summary: text });
    } catch (error) {
        console.error("AI Generation Error:", error);
        return NextResponse.json({ error: `AI Generation Failed: ${error instanceof Error ? error.message : String(error)}` }, { status: 500 });
    }
}
