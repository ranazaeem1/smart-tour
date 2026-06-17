import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateItineraryRequest = {
  destination?: unknown;
  duration_days?: unknown;
  budget?: unknown;
  preferences?: unknown;
  group_size?: unknown;
  start_date?: unknown;
};

export type GeneratedItineraryDay = {
  day_number: number;
  title: string;
  activities: string[];
  estimated_cost: number;
};

export type GeneratedItineraryResponse = {
  trip_overview: string;
  day_by_day: GeneratedItineraryDay[];
};

const GEMINI_TEXT_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash-lite";
const MAX_DURATION_DAYS = 21;
const MIN_BUDGET = 1_000;

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asPositiveNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function asPreferenceText(value: unknown) {
  if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
  return asText(value);
}

function extractJsonObject(rawText: string) {
  const trimmed = rawText.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const candidate = fenced || trimmed;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Gemini did not return a JSON object.");
  }

  return candidate.slice(firstBrace, lastBrace + 1);
}

function validateItinerary(value: unknown, durationDays: number, budget: number): GeneratedItineraryResponse {
  const data = value as Partial<GeneratedItineraryResponse>;
  if (!data || typeof data.trip_overview !== "string" || !Array.isArray(data.day_by_day)) {
    throw new Error("Gemini response is missing itinerary fields.");
  }

  const days = data.day_by_day.map((day, index) => {
    const item = day as Partial<GeneratedItineraryDay>;
    const activities = Array.isArray(item.activities)
      ? item.activities.map((activity) => String(activity).trim()).filter(Boolean).slice(0, 6)
      : [];

    return {
      day_number: Number(item.day_number || index + 1),
      title: String(item.title || `Day ${index + 1}`).trim(),
      activities: activities.length ? activities : ["Guided sightseeing and local experience"],
      estimated_cost: Math.max(0, Math.round(Number(item.estimated_cost || 0))),
    };
  });

  if (days.length !== durationDays) {
    throw new Error(`Gemini returned ${days.length} days instead of ${durationDays}.`);
  }

  const totalEstimatedCost = days.reduce((sum, day) => sum + day.estimated_cost, 0);
  if (totalEstimatedCost > budget) {
    const ratio = budget / totalEstimatedCost;
    days.forEach((day) => {
      day.estimated_cost = Math.max(0, Math.floor(day.estimated_cost * ratio));
    });
  }

  return {
    trip_overview: data.trip_overview.trim(),
    day_by_day: days,
  };
}

function buildPrompt(input: {
  destination: string;
  durationDays: number;
  budget: number;
  preferences: string;
  groupSize: number | null;
  startDate: string;
}) {
  return `You are SmartTour AI Planner, a professional Pakistani tour guide and itinerary designer.

Rules:
- Return ONLY valid JSON. No markdown, no explanation, no code fences.
- The trip must be for Pakistan tourism and must stay focused on the requested destination.
- Respect the total budget strictly: sum(day_by_day[].estimated_cost) must be less than or equal to ${input.budget}.
- Use PKR numeric values only for estimated_cost.
- Create exactly ${input.durationDays} days.
- Activities must be realistic, safe, and suitable for the destination, season, and preferences.
- Mention local culture, food, sightseeing, transport buffers, and safety-conscious pacing where relevant.
- Do not invent hotels, companies, or guarantees. Keep recommendations practical.

User inputs:
- Destination: ${input.destination}
- Duration days: ${input.durationDays}
- Total budget: PKR ${input.budget}
- Group size: ${input.groupSize || "not specified"}
- Start date: ${input.startDate || "not specified"}
- Preferences: ${input.preferences || "balanced sightseeing, safety, and value"}

JSON schema:
{
  "trip_overview": "short professional overview",
  "day_by_day": [
    {
      "day_number": 1,
      "title": "day title",
      "activities": ["activity 1", "activity 2", "activity 3"],
      "estimated_cost": 10000
    }
  ]
  }`;
}

function buildFallbackItinerary(input: {
  destination: string;
  durationDays: number;
  budget: number;
  preferences: string;
}): GeneratedItineraryResponse {
  const perDayBudget = Math.max(0, Math.floor(input.budget / input.durationDays));
  const destinationBase = input.destination.split(/[,&]/)[0].trim() || input.destination;
  const preferenceText = input.preferences || "balanced sightseeing, safety, and value";

  return {
    trip_overview: `A practical ${input.durationDays}-day ${input.destination} itinerary focused on ${preferenceText}. This fallback plan keeps the total estimate within PKR ${input.budget} while Gemini is temporarily unavailable.`,
    day_by_day: Array.from({ length: input.durationDays }, (_, index) => {
      const dayNumber = index + 1;
      const isFirst = dayNumber === 1;
      const isLast = dayNumber === input.durationDays;

      return {
        day_number: dayNumber,
        title: isFirst
          ? `Arrival and orientation in ${destinationBase}`
          : isLast
            ? `Final local experience and safe return`
            : `${destinationBase} exploration day ${dayNumber}`,
        activities: isFirst
          ? [
              "Arrive, check route conditions, and confirm local transport.",
              "Light sightseeing near the main town or valley center.",
              "Review safety plan, emergency contacts, and next-day schedule.",
            ]
          : isLast
            ? [
                "Short morning visit to a nearby viewpoint or cultural stop.",
                "Pack, verify return transport, and keep buffer time for mountain roads.",
                "Depart with meal and rest stops planned around weather conditions.",
              ]
            : [
                `Explore key natural and cultural highlights around ${destinationBase}.`,
                "Include photography, local food, and guided stops based on traveler preferences.",
                "Return before late evening and reassess weather before the next day.",
              ],
        estimated_cost: perDayBudget,
      };
    }),
  };
}

export async function POST(request: Request) {
  let fallbackBody: GenerateItineraryRequest | null = null;

  try {
    const body = (await request.json()) as GenerateItineraryRequest;
    fallbackBody = body;
    const destination = asText(body.destination);
    const durationDays = Math.min(Math.round(asPositiveNumber(body.duration_days) || 0), MAX_DURATION_DAYS);
    const budget = Math.round(asPositiveNumber(body.budget) || 0);
    const preferences = asPreferenceText(body.preferences);
    const groupSize = asPositiveNumber(body.group_size);
    const startDate = asText(body.start_date);

    if (!destination) {
      return NextResponse.json({ error: "Destination is required." }, { status: 400 });
    }

    if (!durationDays) {
      return NextResponse.json({ error: "duration_days must be a positive number." }, { status: 400 });
    }

    if (budget < MIN_BUDGET) {
      return NextResponse.json({ error: "Budget is too low for itinerary generation." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_TEXT_MODEL,
      generationConfig: {
        temperature: 0.45,
        topP: 0.9,
        maxOutputTokens: 2200,
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(buildPrompt({
      destination,
      durationDays,
      budget,
      preferences,
      groupSize,
      startDate,
    }));

    const text = result.response.text();
    const parsed = JSON.parse(extractJsonObject(text));
    const itinerary = validateItinerary(parsed, durationDays, budget);

    return NextResponse.json({
      source: "gemini",
      model: GEMINI_TEXT_MODEL,
      destination,
      duration_days: durationDays,
      budget,
      itinerary,
    });
  } catch (error) {
    console.error("[generate-itinerary] failed:", error);
    const message = error instanceof Error ? error.message : "Unable to generate itinerary.";
    const rateLimited = /429|resource_exhausted|rate limit|too many requests/i.test(message);

    try {
      const body = fallbackBody;
      if (!body) throw new Error("Request body unavailable for fallback.");
      const destination = asText(body.destination) || "Northern Pakistan";
      const durationDays = Math.min(Math.round(asPositiveNumber(body.duration_days) || 3), MAX_DURATION_DAYS);
      const budget = Math.round(asPositiveNumber(body.budget) || 45_000);
      const preferences = asPreferenceText(body.preferences);

      return NextResponse.json({
        source: "fallback",
        reason: rateLimited ? "Gemini rate limit reached." : "Gemini itinerary generation failed.",
        model: null,
        destination,
        duration_days: durationDays,
        budget,
        itinerary: buildFallbackItinerary({ destination, durationDays, budget, preferences }),
      });
    } catch {
      return NextResponse.json(
        { error: rateLimited ? "Gemini rate limit reached. Please try again shortly." : "Unable to generate itinerary. Please try again." },
        { status: rateLimited ? 429 : 502 }
      );
    }
  }
}
