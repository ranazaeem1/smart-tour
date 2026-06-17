import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MatchTourRequest = {
  destination?: unknown;
  budget?: unknown;
  preferences?: unknown;
  preferenceText?: unknown;
  duration?: unknown;
  groupSize?: unknown;
  interests?: unknown;
  matchThreshold?: unknown;
  matchCount?: unknown;
};

type MatchedTour = {
  id: string;
  company_id: string;
  title: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  rating: number;
  review_count: number;
  image_url: string | null;
  category: string;
  tags: string[];
  max_group: number;
  difficulty: string;
  highlights: string[];
  included: string[];
  safety_score: number;
  available: boolean;
  active_from: string;
  active_until: string | null;
  featured: boolean;
  created_at: string;
  similarity: number;
};

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const DEFAULT_MATCH_THRESHOLD = 0.62;
const DEFAULT_MATCH_COUNT = 8;
const MAX_MATCH_COUNT = 20;
const DEFAULT_MAX_BUDGET = 1_000_000;

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

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(asText).filter(Boolean).slice(0, 12);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildQueryText(body: MatchTourRequest) {
  const destination = asText(body.destination);
  const preferences = asText(body.preferences) || asText(body.preferenceText);
  const duration = asPositiveNumber(body.duration);
  const groupSize = asPositiveNumber(body.groupSize);
  const interests = asStringList(body.interests);

  return [
    destination ? `Destination or region: ${destination}` : "",
    preferences ? `Traveler preferences: ${preferences}` : "",
    interests.length ? `Interests: ${interests.join(", ")}` : "",
    duration ? `Trip duration: ${duration} days` : "",
    groupSize ? `Group size: ${groupSize} travelers` : "",
    "Recommend semantically relevant Pakistan tourism packages, including similar climates, terrain, activities, safety profile, and travel style.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = serviceRoleKey || anonKey;

  if (!supabaseUrl || !key) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function createQueryEmbedding(queryText: string) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY in the environment.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text: queryText }] },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  } as any);
  const values = result.embedding.values;

  if (!Array.isArray(values) || values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Gemini returned an invalid embedding dimension: ${values?.length ?? 0}.`);
  }

  return values;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as MatchTourRequest;
    const queryText = buildQueryText(body);

    if (queryText.length < 20) {
      return NextResponse.json(
        { error: "Provide a destination, preferences, interests, duration, or group size for semantic matching." },
        { status: 400 }
      );
    }

    const budget = asPositiveNumber(body.budget) ?? DEFAULT_MAX_BUDGET;
    const matchThreshold = clamp(
      typeof body.matchThreshold === "number" ? body.matchThreshold : DEFAULT_MATCH_THRESHOLD,
      0,
      1
    );
    const matchCount = clamp(
      Math.round(asPositiveNumber(body.matchCount) ?? DEFAULT_MATCH_COUNT),
      1,
      MAX_MATCH_COUNT
    );

    const [queryEmbedding, supabase] = await Promise.all([
      createQueryEmbedding(queryText),
      Promise.resolve(getSupabaseServerClient()),
    ]);

    const { data, error } = await (supabase as any).rpc("match_tours", {
      query_embedding: queryEmbedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      max_budget: Math.round(budget),
    });

    if (error) {
      console.error("[match-tour] Supabase RPC error:", error);
      return NextResponse.json(
        { error: "Semantic tour matching is unavailable right now." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      query: queryText,
      budget: Math.round(budget),
      matchThreshold,
      count: Array.isArray(data) ? data.length : 0,
      tours: (data || []) as MatchedTour[],
    });
  } catch (error) {
    console.error("[match-tour] Request failed:", error);
    const message = error instanceof Error ? error.message : "Unable to match tours.";
    const isConfigError = message.includes("API key") || message.includes("configuration");

    return NextResponse.json(
      { error: isConfigError ? message : "Unable to match tours. Please try again." },
      { status: isConfigError ? 500 : 400 }
    );
  }
}
