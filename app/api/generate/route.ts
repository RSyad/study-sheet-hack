import { NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Priority list of models: if #1 has high demand (503), it automatically tries #2, then #3!
const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash-lite",
];

const studySheetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "Main topic title (short and punchy, max 6 words)",
    },
    subject: {
      type: Type.STRING,
      description: "Academic subject (e.g., Physics, Economics, Computer Science)",
    },
    coreConcepts: {
      type: Type.ARRAY,
      description: "3 to 4 key concepts or definitions for fast revision",
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING, description: "Main term (for Blue Ink heading)" },
          definition: { type: Type.STRING, description: "Concise explanation under 15 words" },
          keyword: { type: Type.STRING, description: "1-3 crucial emphasis words or formula (for Red Ink)" },
        },
        required: ["term", "definition", "keyword"],
      },
    },
    processFlow: {
      type: Type.ARRAY,
      description: "3 to 5 sequential steps showing how the concept works or is applied",
      items: { type: Type.STRING },
    },
    mermaidDiagram: {
      type: Type.STRING,
      description:
        'Valid Mermaid.js flowchart string starting with "graph TD;" using simple node IDs (A, B, C) and double quotes around labels, e.g., A["Step 1"] --> B["Step 2"]',
    },
    mnemonic: {
      type: Type.STRING,
      description: "A catchy acronym, rhyme, or memory trick to remember the key points",
    },
  },
  required: ["title", "subject", "coreConcepts", "processFlow", "mermaidDiagram", "mnemonic"],
};

export async function POST(req: Request) {
  try {
    const { notes } = await req.json();

    if (!notes || notes.trim().length === 0) {
      return NextResponse.json({ error: "Please provide study notes." }, { status: 400 });
    }

    let lastError: any = null;

    // Loop through our models until one succeeds
    for (const modelName of FALLBACK_MODELS) {
      try {
        console.log(`Attempting generation with ${modelName}...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: `Convert the following messy lecture notes or topic into a structured, exam-focused visual study cheat-sheet:\n\n${notes}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: studySheetSchema,
          },
        });

        const structuredData = JSON.parse(response.text || "{}");
        console.log(`✅ Success with ${modelName}!`);
        return NextResponse.json(structuredData);
      } catch (err: any) {
        console.warn(`⚠️ ${modelName} failed (${err?.status || err?.message}). Trying next fallback model...`);
        lastError = err;
      }
    }

    // If all 3 models fail, return the last error
    throw lastError;
  } catch (error: any) {
    console.error("All models failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate cheat sheet" },
      { status: 500 }
    );
  }
}
