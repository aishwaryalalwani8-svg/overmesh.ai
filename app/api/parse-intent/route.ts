import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requirement = body.requirement;

    if (!requirement) {
      return NextResponse.json(
        { error: "Requirement is required." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",

      contents: `
You are the AI intent parser for OverMesh AI,
a shared merchant capacity and fulfilment platform.

Analyze the following customer requirement:

"${requirement}"

Extract:

- product
- quantity
- budget in Indian Rupees
- deadlineHours
- city
- additionalRequirements

Important rules:

1. Return ONLY valid JSON.
2. Do not include markdown.
3. If a value is unknown, use null.
4. Convert:
   - tomorrow = 24 hours
   - 2 days = 48 hours
   - 3 days = 72 hours
5. quantity must be a number.
6. budget must be a number.
7. deadlineHours must be a number.
8. Product name should be short and clean.

Return exactly this structure:

{
  "product": "string or null",
  "quantity": 0,
  "budget": 0,
  "deadlineHours": 0,
  "city": "string or null",
  "additionalRequirements": "string or null"
}
      `,

      config: {
        responseMimeType: "application/json",
      },
    });

    if (!response.text) {
      throw new Error("AI returned an empty response.");
    }

    const parsed = JSON.parse(response.text);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error("Gemini intent parsing error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI could not analyze the requirement.",
      },
      { status: 500 }
    );
  }
}