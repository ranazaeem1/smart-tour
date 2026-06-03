import { NextResponse } from "next/server";
import { BOOKINGS, COMPANIES, DESTINATIONS, REVIEWS, SAFETY_ZONES, TOURS, formatPKR } from "@/lib/data";
import { fetchSafetyZones, fetchTours } from "@/lib/db";
import { fetchWeather } from "@/lib/weather";

type Role = "user" | "company" | "admin" | string | undefined;

type NormalizedTour = {
  id: string;
  title: string;
  company: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  rating: number;
  category: string;
  difficulty: string;
  safetyScore: number;
  available: boolean;
  highlights: string[];
  included: string[];
};

type SafetyZone = {
  area: string;
  score: number;
  status: string;
};

const locationCoordinates: Record<string, { lat: number; lon: number; city: string }> = {
  "Murree": { lat: 33.907, lon: 73.3943, city: "Murree" },
  "Nathia Gali": { lat: 34.0736, lon: 73.3812, city: "Nathia Gali" },
  "Hunza Valley": { lat: 36.3167, lon: 74.65, city: "Hunza" },
  "Swat Valley": { lat: 35.2227, lon: 72.4258, city: "Swat" },
  "Kalam": { lat: 35.4784, lon: 72.5883, city: "Kalam" },
  "Malam Jabba": { lat: 34.7993, lon: 72.5726, city: "Malam Jabba" },
  "Naran": { lat: 34.9092, lon: 73.6507, city: "Naran" },
  "Kaghan": { lat: 34.7809, lon: 73.5206, city: "Kaghan" },
  "Skardu": { lat: 35.2971, lon: 75.6333, city: "Skardu" },
  "Gilgit": { lat: 35.9208, lon: 74.3144, city: "Gilgit" },
  "Fairy Meadows": { lat: 35.3875, lon: 74.5789, city: "Fairy Meadows" },
  "Attabad Lake": { lat: 36.3257, lon: 74.8669, city: "Hunza" },
  "Khunjerab Pass": { lat: 36.8497, lon: 75.4306, city: "Khunjerab" },
  "Shangrila Resort": { lat: 35.4296, lon: 75.4546, city: "Skardu" },
  "Naltar Valley": { lat: 36.1398, lon: 74.1928, city: "Naltar" },
  "Rakaposhi": { lat: 36.1424, lon: 74.4895, city: "Rakaposhi" },
  "Passu": { lat: 36.4698, lon: 74.8918, city: "Passu" },
  "Shogran": { lat: 34.6392, lon: 73.4616, city: "Shogran" },
  "Babusar Top": { lat: 35.1467, lon: 74.0647, city: "Babusar" },
  "Neelum Valley": { lat: 34.5857, lon: 73.907, city: "Neelum" },
  "Chitral": { lat: 35.8518, lon: 71.7864, city: "Chitral" },
  "Kalash Valley": { lat: 35.6699, lon: 71.7306, city: "Kalash" },
  "Astore": { lat: 35.3574, lon: 74.8563, city: "Astore" },
  "Deosai Plains": { lat: 35.0305, lon: 75.4435, city: "Deosai" },
  "Phander Valley": { lat: 36.1731, lon: 72.9858, city: "Phander" },
};

const destinationAliases: Record<string, string[]> = {
  "Hunza Valley": ["hunza", "karimabad", "altit", "baltit", "attabad", "passu", "khunjerab", "rakaposhi"],
  "Skardu": ["skardu", "deosai", "shangrila", "satpara", "k2"],
  "Swat Valley": ["swat", "kalam", "malam jabba", "malamjabba", "mahodand", "mahudand", "mingora"],
  "Naran": ["naran", "kaghan", "saif", "babusar", "shogran", "lulusar"],
  "Murree": ["murree", "nathia", "nathiagali", "nathia gali", "ayubia", "patriata"],
  "Fairy Meadows": ["fairy meadows", "fairymeadows", "nanga parbat", "beyal"],
  "Naltar Valley": ["naltar", "ski"],
  "Chitral": ["chitral", "kalash"],
  "Neelum Valley": ["neelum"],
  "Gilgit": ["gilgit"],
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function hasAny(text: string, words: string[]) {
  return words.some(word => text.includes(word));
}

function detectIntent(message: string) {
  const text = normalize(message);
  if (hasAny(text, ["compare", "comparison", "difference", "better", "best between", "vs", "versus"])) return "compare";
  if (hasAny(text, ["budget", "price", "cost", "pkr", "rs", "rupees", "afford", "cheap", "under", "within"])) return "budget";
  if (hasAny(text, ["recommend", "suggest", "where", "destination", "place", "tour", "package"])) return "recommendation";
  if (hasAny(text, ["safe", "safety", "security", "risk", "route", "sos", "danger"])) return "safety";
  if (hasAny(text, ["weather", "temperature", "rain", "snow", "season"])) return "weather";
  if (hasAny(text, ["company", "operator", "vendor", "revenue", "add tour", "booking manage"])) return "company";
  if (hasAny(text, ["admin", "approve", "users", "platform", "analytics", "moderate"])) return "admin";
  if (hasAny(text, ["book", "booking", "reserve", "cancel", "refund", "payment"])) return "booking";
  return "general";
}

function extractBudget(message: string) {
  const text = normalize(message);
  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*(k|lac|lakh|m|million)?/g)];
  const values = matches.map(match => {
    const value = Number(match[1]);
    const unit = match[2];
    if (unit === "k") return value * 1000;
    if (unit === "lac" || unit === "lakh") return value * 100000;
    if (unit === "m" || unit === "million") return value * 1000000;
    return value;
  });

  return values.filter(value => value >= 1000).sort((a, b) => b - a)[0] || null;
}

function extractGroupSize(message: string) {
  const text = normalize(message);
  const peopleMatch = text.match(/(\d+)\s*(people|persons|person|friends|members|family|log|travellers|travelers)/);
  if (peopleMatch) return Number(peopleMatch[1]);
  return null;
}

function findMentionedDestination(message: string) {
  const text = normalize(message);
  const direct = DESTINATIONS.find(destination => text.includes(normalize(destination)));
  if (direct) return direct;

  return Object.entries(destinationAliases).find(([, aliases]) => aliases.some(alias => text.includes(alias)))?.[0] || null;
}

function normalizeTour(raw: any): NormalizedTour {
  return {
    id: String(raw.id),
    title: raw.title,
    company: raw.company || raw.companies?.name || "Verified Smart Tour operator",
    destination: raw.destination,
    region: raw.region || "Northern Pakistan",
    price: Number(raw.price || 0),
    duration: Number(raw.duration || 0),
    rating: Number(raw.rating || 0),
    category: raw.category || "Travel",
    difficulty: raw.difficulty || "Moderate",
    safetyScore: Number(raw.safetyScore ?? raw.safety_score ?? 82),
    available: raw.available ?? true,
    highlights: raw.highlights || [],
    included: raw.included || [],
  };
}

function normalizeSafety(raw: any): SafetyZone {
  return {
    area: raw.area,
    score: Number(raw.score || 0),
    status: raw.status || "Available",
  };
}

async function getLiveData() {
  const [dbTours, dbSafety] = await Promise.all([
    fetchTours({ admin: false }).catch(() => []),
    fetchSafetyZones().catch(() => []),
  ]);

  const liveTours = dbTours.map(normalizeTour);
  const liveDestinations = new Set(liveTours.map((tour: NormalizedTour) => normalize(tour.destination)));
  const fallbackTours = TOURS
    .map(normalizeTour)
    .filter(tour => !liveDestinations.has(normalize(tour.destination)));

  const tourRows: unknown[] = [...liveTours, ...fallbackTours];
  const safetyRows: unknown[] = dbSafety.length ? dbSafety : SAFETY_ZONES;
  const tours = tourRows.map(normalizeTour).filter((tour: NormalizedTour) => tour.available);
  const safety = safetyRows.map(normalizeSafety);

  return { tours, safety, source: dbTours.length || dbSafety.length ? "live" : "fallback" };
}

function scoreTour(tour: NormalizedTour, options: { budget: number | null; destination: string | null; message: string; recent: string[] }) {
  const text = normalize(options.message);
  let score = tour.rating * 8 + tour.safetyScore * 0.55;

  if (options.budget) {
    if (tour.price <= options.budget) score += 45;
    else score -= Math.min(45, ((tour.price - options.budget) / options.budget) * 70);
  }

  if (options.destination && normalize(tour.destination).includes(normalize(options.destination).split(" ")[0])) score += 35;
  if (hasAny(text, ["family", "bachy", "kids"]) && normalize(tour.category).includes("family")) score += 25;
  if (hasAny(text, ["adventure", "trek", "camping"]) && hasAny(normalize([tour.category, tour.highlights.join(" ")].join(" ")), ["adventure", "trek", "camping"])) score += 20;
  if (hasAny(text, ["snow", "ski", "winter"]) && hasAny(normalize([tour.title, tour.destination, tour.highlights.join(" ")].join(" ")), ["ski", "snow", "naltar", "malam"])) score += 24;
  if (options.recent.includes(tour.destination)) score -= 60;

  return score;
}

function pickRecommendations(tours: NormalizedTour[], options: { budget: number | null; destination: string | null; message: string; recent: string[] }) {
  const ranked = [...tours]
    .sort((a, b) => scoreTour(b, options) - scoreTour(a, options))
    .slice(0, 8);

  const unseen = ranked.filter(tour => !options.recent.includes(tour.destination));
  const pool = unseen.length >= 3 ? unseen : ranked;
  const offset = Math.floor(Date.now() / 1000) % Math.max(pool.length, 1);

  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 3);
}

function findSafety(destination: string, safety: SafetyZone[]) {
  const needle = normalize(destination).split(" ")[0];
  return safety.find(zone => normalize(zone.area).includes(needle)) || null;
}

async function getWeatherLine(destination: string) {
  const coords = locationCoordinates[destination] || locationCoordinates[Object.keys(locationCoordinates).find(key => normalize(destination).includes(normalize(key).split(" ")[0])) || "Hunza Valley"];
  const weather = await fetchWeather(coords.lat, coords.lon, coords.city);
  return `${destination}: ${weather.temp}C, ${weather.description}, wind ${weather.windSpeedKmh} km/h (${weather.source})`;
}

async function buildComparison(safety: SafetyZone[], tours: NormalizedTour[]) {
  const weatherTargets = ["Hunza Valley", "Skardu", "Swat Valley", "Naran", "Murree"];
  const weatherLines = await Promise.all(weatherTargets.map(getWeatherLine));

  const rows = DESTINATIONS.map(destination => {
    const tour = tours.find(item => normalize(item.destination).includes(normalize(destination).split(" ")[0]));
    const zone = findSafety(destination, safety);
    return `- ${destination}: ${zone ? `${zone.score}/100 ${zone.status}` : "safety live-check pending"}, ${tour ? `from ${formatPKR(tour.price)}, ${tour.duration} days, ${tour.difficulty}` : "custom package required"}`;
  });

  return `Northern Pakistan comparison using current platform data:

${rows.join("\n")}

Live weather sample:
${weatherLines.map(line => `- ${line}`).join("\n")}

Best use:
- Family/value: Naran, Murree, Nathia Gali, Swat
- Premium scenery: Hunza, Skardu, Passu, Attabad Lake
- Adventure/trekking: Fairy Meadows, Deosai, Astore, Skardu
- Winter/snow: Naltar Valley, Malam Jabba

Open [Tours](/user/tours) for packages or [Safety Center](/user/safety) before travel.`;
}

async function buildRecommendation(message: string, role: Role, recent: string[]) {
  const { tours, safety, source } = await getLiveData();
  const budget = extractBudget(message);
  const groupSize = extractGroupSize(message) || 1;
  const destination = findMentionedDestination(message);
  const picks = pickRecommendations(tours, { budget, destination, message, recent });
  const weatherLines = await Promise.all(picks.map(pick => getWeatherLine(pick.destination)));

  const budgetLine = budget
    ? `I detected your budget as ${formatPKR(budget)}${groupSize > 1 ? ` per person/group query for ${groupSize} people` : ""}.`
    : "No exact budget detected, so I balanced price, rating, safety, and variety.";

  const lines = picks.map((tour, index) => {
    const zone = findSafety(tour.destination, safety);
    const total = budget && groupSize > 1 ? `, estimated ${formatPKR(tour.price * groupSize)} for ${groupSize}` : "";
    const fit = budget ? (tour.price <= budget ? "within budget" : `${formatPKR(tour.price - budget)} above budget`) : "strong match";
    return `- ${tour.title}: ${tour.destination}, ${formatPKR(tour.price)} per person${total}, ${tour.duration} days, ${tour.difficulty}, ${fit}, safety ${zone?.score ?? tour.safetyScore}/100`;
  });

  const roleAdvice = role === "company"
    ? "\nFor operator-side action, use [Company Tours](/company/tours) and [Company Bookings](/company/bookings)."
    : role === "admin"
      ? "\nFor platform review, use [Admin Tours](/admin/tours), [Admin Safety](/admin/safety), and [Admin Analytics](/admin/analytics)."
      : "\nYou can compare packages in [Tours](/user/tours), plan details in [AI Planner](/user/planner), and track cost in [Budget Tracker](/user/budget).";

  return {
    text: `${budgetLine}

Recommended options this time:
${lines.join("\n")}

Live weather for these picks:
${weatherLines.map(line => `- ${line}`).join("\n")}${roleAdvice}

Data mode: ${source === "live" ? "live Supabase/OpenWeather data with AI ranking" : "fallback project data with live/estimated weather"}.`,
    recommendedDestinations: picks.map(pick => pick.destination),
    lastTopic: picks[0]?.destination || destination,
  };
}

async function maybeRewriteWithAi(baseText: string, context: { message: string; role: Role }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { text: baseText, aiUsed: false };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are Zia, the Smart Tour assistant. Rewrite the provided answer in concise Pakistani English/Urdu-friendly tone. Keep all facts, prices, links, and bullets. Do not invent data.",
          },
          {
            role: "user",
            content: `User role: ${context.role || "guest"}\nUser asked: ${context.message}\nAnswer to rewrite:\n${baseText}`,
          },
        ],
        temperature: 0.45,
        max_tokens: 700,
      }),
    });

    if (!response.ok) return { text: baseText, aiUsed: false };
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return { text: typeof text === "string" && text.trim() ? text.trim() : baseText, aiUsed: Boolean(text) };
  } catch {
    return { text: baseText, aiUsed: false };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body.message || "");
    const role = body.role as Role;
    const recent = Array.isArray(body.recentRecommendations) ? body.recentRecommendations.map(String).slice(-6) : [];
    const intent = detectIntent(message);

    let result: { text: string; recommendedDestinations?: string[]; lastTopic?: string | null };

    if (intent === "compare") {
      const { tours, safety } = await getLiveData();
      result = { text: await buildComparison(safety, tours), recommendedDestinations: [] };
    } else if (["recommendation", "budget", "weather", "safety", "general"].includes(intent)) {
      result = await buildRecommendation(message, role, recent);
    } else if (intent === "company") {
      result = {
        text: `Company assistant, based on current Smart Tour workflow:

- Add and manage packages in [Company Tours](/company/tours)
- Confirm reservations in [Company Bookings](/company/bookings)
- Handle traveler questions in [Company Messages](/company/chat/list)
- Track revenue in [Company Revenue](/company/revenue)

Current project snapshot: ${COMPANIES.length} companies, ${TOURS.filter(t => t.available).length} active packages, ${BOOKINGS.length} sample bookings.`,
      };
    } else if (intent === "admin") {
      result = {
        text: `Admin assistant, current platform areas:

- Users: [Admin Users](/admin/users)
- Companies: [Admin Companies](/admin/companies)
- Tours: [Admin Tours](/admin/tours)
- Bookings: [Admin Bookings](/admin/bookings)
- Reviews: [Admin Reviews](/admin/reviews)
- Safety: [Admin Safety](/admin/safety)
- Analytics: [Admin Analytics](/admin/analytics)

Snapshot: ${COMPANIES.length} companies, ${TOURS.length} tours, ${BOOKINGS.length} bookings, ${REVIEWS.length} reviews.`,
      };
    } else {
      result = await buildRecommendation(message, role, recent);
    }

    const ai = await maybeRewriteWithAi(result.text, { message, role });

    return NextResponse.json({
      reply: ai.text,
      intent,
      aiUsed: ai.aiUsed,
      recommendedDestinations: result.recommendedDestinations || [],
      lastTopic: result.lastTopic || null,
    });
  } catch {
    return NextResponse.json(
      { reply: "Sorry, I could not process live data right now. Please try again in a moment.", aiUsed: false },
      { status: 500 }
    );
  }
}
