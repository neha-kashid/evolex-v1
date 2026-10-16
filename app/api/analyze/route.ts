
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const PRIMARY_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash-lite";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from .env.local" },
        { status: 500 }
      );
    }

    const { idea, platform, format, audience, goal } =
      await request.json();

    if (
      typeof idea !== "string" ||
      !idea.trim() ||
      idea.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a content idea of up to 5,000 characters.",
        },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are EVOLEX, an AI content strategist.

Analyze this proposed content:
- Idea: ${idea}
- Platform: ${platform}
- Format: ${format}
- Audience: ${audience || "Not specified"}
- Goal: ${goal}

Give specific, realistic advice. Do not guarantee virality or
invent analytics.

Use these headings:
1. CONTENT VERDICT
2. HOOK STRATEGY — two opening hooks
3. WHAT WORKS — three strengths
4. WHAT TO IMPROVE — three actionable suggestions
5. CONTENT STRUCTURE — beginning, middle, ending
6. EXPERIMENT HYPOTHESIS — one testable hypothesis
7. SUCCESS METRIC — what to measure after publishing
8. NEXT ACTION — one concrete step before publishing
`;

    let result;

    try {
      result = await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents: prompt,
      });
    } catch (primaryError) {
      console.error(
        `Primary Gemini model (${PRIMARY_MODEL}) failed:`,
        primaryError
      );

      if (FALLBACK_MODEL === PRIMARY_MODEL) {
        throw primaryError;
      }

      try {
        console.warn(
          `Trying fallback model (${FALLBACK_MODEL}).`
        );

        result = await ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: prompt,
        });
      } catch (fallbackError) {
        console.error(
          `Fallback Gemini model (${FALLBACK_MODEL}) failed:`,
          fallbackError
        );

        return NextResponse.json(
          {
            error:
              "Both Gemini models failed. Check API quota, model availability, and server logs.",
          },
          { status: 502 }
        );
      }
    }

    const analysis = result.text?.trim();

    if (!analysis) {
      return NextResponse.json(
        {
          error: "Gemini returned an empty response. Try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("EVOLEX Gemini error:", error);

    return NextResponse.json(
      {
        error:
          "Gemini analysis failed. Check the terminal for details.",
      },
      { status: 500 }
    );
  }
}
