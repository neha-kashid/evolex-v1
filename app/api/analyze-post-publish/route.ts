import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.6-flash";

function isYouTubeUrl(url: URL) {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  return host === "youtube.com" || host === "m.youtube.com" ||
    host === "youtu.be" || host === "youtube-nocookie.com";
}

function isYouTubeVideoUrl(url: URL) {
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (host === "youtu.be") return url.pathname.length > 1;
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    return url.pathname === "/watch"
      ? Boolean(url.searchParams.get("v"))
      : /^\/(shorts|live|embed)\/[^/]+/.test(url.pathname);
  }
  return false;
}

function isTransientGeminiError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /429|RESOURCE_EXHAUSTED|rate.?limit|503|UNAVAILABLE|500|INTERNAL|502|504|overloaded|temporar|ECONNRESET|ETIMEDOUT|fetch failed/i.test(message);
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateWithFallback<T>(run: (model: string) => Promise<T>): Promise<T> {
  let primaryError: unknown;
  try {
    return await run(PRIMARY_MODEL);
  } catch (error) {
    primaryError = error;
    console.error(`Gemini primary model (${PRIMARY_MODEL}) failed:`, error);
  }

  // Retry the primary model once for transient service or rate-limit failures.
  if (isTransientGeminiError(primaryError)) {
    await wait(400);
    try {
      return await run(PRIMARY_MODEL);
    } catch (error) {
      primaryError = error;
      console.error(`Gemini primary retry (${PRIMARY_MODEL}) failed:`, error);
    }
  }

  if (FALLBACK_MODEL === PRIMARY_MODEL) throw primaryError;

  try {
    console.warn(`Trying Gemini fallback model (${FALLBACK_MODEL}).`);
    return await run(FALLBACK_MODEL);
  } catch (fallbackError) {
    console.error(`Gemini fallback model (${FALLBACK_MODEL}) failed:`, fallbackError);
    throw fallbackError;
  }
}

const prompt = `You are EVOLEX, an evidence-conscious content strategist. Analyze only content you actually receive in this request.

Return a clear, useful report with these headings:
1. CONTENT OVERVIEW
2. HOOK ANALYSIS — assess the opening only if the video content was available and inspected; otherwise say it could not be inspected.
3. CONTENT ANALYSIS — structure, storytelling, clarity, pacing, and visual communication, only where observable.
4. WHAT WENT WELL — specific observations, not generic praise.
5. WHAT COULD IMPROVE — actionable edits or tests.
6. PERFORMANCE INSIGHTS — do not invent views, likes, comments, shares, saves, retention, watch time, demographics, or follower changes. State that private/account analytics were not retrieved unless actual metrics were supplied.
7. NEXT CONTENT EXPERIMENT — change one primary variable.
8. SUCCESS METRIC — suggest measurable metrics the creator can check in platform analytics.

Be transparent about limitations. Do not claim direct metric retrieval from a URL. A public video may be analyzable without providing private creator analytics. If content could not be inspected, clearly state that and do not pretend otherwise.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is missing from the server environment." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const video = formData.get("video");
    const postUrlValue = formData.get("postUrl");
    const postUrl = typeof postUrlValue === "string" ? postUrlValue.trim() : "";
    const videoFile = video instanceof File && video.size > 0 ? video : null;

    if (!videoFile && !postUrl) {
      return NextResponse.json(
        { error: "Upload a video or provide a public video URL." },
        { status: 400 },
      );
    }
    if (videoFile && videoFile.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        { error: "For this first version, please use a video smaller than 20 MB." },
        { status: 413 },
      );
    }
    if (videoFile && !ALLOWED_VIDEO_TYPES.has(videoFile.type)) {
      return NextResponse.json({ error: "Use an MP4, WebM, or MOV video." }, { status: 400 });
    }

    let parsedUrl: URL | null = null;
    if (postUrl) {
      try {
        parsedUrl = new URL(postUrl);
        if (parsedUrl.protocol !== "https:") throw new Error("invalid protocol");
      } catch {
        return NextResponse.json(
          { error: "Please provide a valid public HTTPS post or video URL." },
          { status: 400 },
        );
      }
    }

    // Native URL video input is limited here to public YouTube videos.
    if (!videoFile && parsedUrl && !isYouTubeUrl(parsedUrl)) {
      return NextResponse.json(
        {
          error:
            "EVOLEX can currently analyze a public YouTube video directly from its URL. Instagram, TikTok, and profile links do not expose video data to this endpoint; please upload the specific video file instead. Private platform analytics are never retrieved from a link alone.",
        },
        { status: 400 },
      );
    }
    if (!videoFile && parsedUrl && !isYouTubeVideoUrl(parsedUrl)) {
      return NextResponse.json(
        {
          error:
            "Please provide a direct public YouTube video, Short, or livestream URL—not a channel/profile URL. For profile analysis, choose a specific video or upload its file.",
        },
        { status: 400 },
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    let analysis: string;

    if (!videoFile && parsedUrl) {
      const youtubeUrl = parsedUrl.toString();
      analysis = await generateWithFallback(async (model) => {
        const result = await ai.interactions.create({
          model,
          input: [
            { type: "text", text: `${prompt}\n\nAnalyze this public YouTube video URL: ${youtubeUrl}` },
            { type: "video", uri: youtubeUrl },
          ],
        });
        const text = result.output_text?.trim() || "";
        if (!text) throw new Error(`Gemini model ${model} returned an empty analysis.`);
        return text;
      });
    } else {
      const contents: Array<
        { text: string } | { inlineData: { mimeType: string; data: string } }
      > = [
        {
          text: `${prompt}\n\nPublic post URL supplied for reference only: ${postUrl || "Not provided"}. Analyze the attached video file, not the URL. Do not claim to have opened the URL.`,
        },
      ];

      if (videoFile) {
        const bytes = Buffer.from(await videoFile.arrayBuffer());
        contents.push({
          inlineData: { mimeType: videoFile.type, data: bytes.toString("base64") },
        });
      }

      analysis = await generateWithFallback(async (model) => {
        const result = await ai.models.generateContent({ model, contents });
        const text = result.text?.trim() || "";
        if (!text) throw new Error(`Gemini model ${model} returned an empty analysis.`);
        return text;
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("EVOLEX post-publish analysis error:", error);
    const message = error instanceof Error ? error.message : "";
    if (/429|RESOURCE_EXHAUSTED|rate.?limit|high demand|503|UNAVAILABLE/i.test(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini is experiencing high demand or is temporarily unavailable. Both configured models were unable to complete the analysis. Retry later or use the sample analysis.",
        },
        { status: 429 },
      );
    }
    return NextResponse.json(
      {
        error:
          "Post-publish AI analysis failed. Check the server logs and try again. If both models are unavailable, use the sample analysis.",
      },
      { status: 502 },
    );
  }
}
