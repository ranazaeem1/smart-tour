"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  Circle,
  Compass,
  LifeBuoy,
  MessageSquare,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { BOOKINGS, COMPANIES, REVIEWS, SAFETY_ZONES, TOURS, formatPKR } from "@/lib/data";

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: ReactNode;
}

type Intent =
  | "greeting"
  | "farewell"
  | "booking"
  | "cancel"
  | "budget"
  | "safety"
  | "weather"
  | "destination"
  | "compare"
  | "itinerary"
  | "group"
  | "company"
  | "admin"
  | "review"
  | "auth"
  | "payment"
  | "support"
  | "analytics"
  | "unknown";

const destinationAliases: Record<string, string[]> = {
  hunza: ["hunza", "karimabad", "altit", "baltit", "attabad", "passu", "khunjerab", "rakaposhi"],
  skardu: ["skardu", "deosai", "shangrila", "satpara", "k2"],
  swat: ["swat", "kalam", "malam jabba", "malamjabba", "mahodand", "mahudand", "mingora"],
  naran: ["naran", "kaghan", "saif", "babusar", "shogran", "lulusar"],
  murree: ["murree", "nathia", "nathiagali", "nathia gali", "ayubia", "patriata"],
  fairy: ["fairy meadows", "fairymeadows", "nanga parbat", "beyal"],
  naltar: ["naltar", "ski"],
  chitral: ["chitral", "kalash"],
  neelum: ["neelum"],
  gilgit: ["gilgit"],
};

const stopWords = new Set(["for", "the", "and", "with", "tour", "tours", "trip", "package", "packages", "price", "cost"]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasAny = (text: string, words: string[]) => words.some(word => text.includes(word));
const money = (value: number) => formatPKR(value);

function detectIntent(message: string): Intent {
  const text = normalize(message);

  if (/^(hi|hello|hey|salam|assalam|aoa|hy)\b/.test(text)) return "greeting";
  if (hasAny(text, ["thanks", "thank you", "shukriya", "bye", "goodbye", "allah hafiz"])) return "farewell";
  if (hasAny(text, ["compare", "difference", "better", "best between", "vs", "versus"])) return "compare";
  if (hasAny(text, ["admin", "approve company", "suspend", "manage users", "all bookings", "platform", "analytics"])) return hasAny(text, ["analytics", "report", "chart", "stats"]) ? "analytics" : "admin";
  if (hasAny(text, ["company", "operator", "vendor", "business", "add tour", "create tour", "manage bookings", "company panel", "revenue", "customer"])) return "company";
  if (hasAny(text, ["book", "booking", "reserve", "reservation", "trip status", "my booking", "confirm booking"])) return "booking";
  if (hasAny(text, ["cancel", "refund", "reschedule", "change date"])) return "cancel";
  if (hasAny(text, ["payment", "pay", "paid", "invoice", "receipt", "transaction"])) return "payment";
  if (hasAny(text, ["budget", "price", "cost", "pkr", "expense", "afford", "cheap", "premium", "estimate"])) return "budget";
  if (hasAny(text, ["safe", "safety", "security", "danger", "risk", "sos", "tracking", "route", "hazard"])) return "safety";
  if (hasAny(text, ["weather", "season", "best time", "temperature", "snow", "rain", "month"])) return "weather";
  if (hasAny(text, ["itinerary", "planner", "plan", "schedule", "days", "5 day", "seven day"])) return "itinerary";
  if (hasAny(text, ["group", "friends", "family", "split", "members", "together"])) return "group";
  if (hasAny(text, ["review", "rating", "feedback", "sentiment", "complaint"])) return "review";
  if (hasAny(text, ["login", "register", "signup", "sign up", "forgot", "password", "account"])) return "auth";
  if (hasAny(text, ["help", "support", "human", "agent", "contact", "problem", "issue"])) return "support";
  if (hasAny(text, ["destination", "where", "place", "recommend", "hunza", "skardu", "swat", "naran", "murree", "fairy", "naltar", "chitral", "neelum", "kalam"])) return "destination";

  return "unknown";
}

function getNumbers(message: string) {
  return normalize(message)
    .split(" ")
    .map(part => Number(part))
    .filter(value => Number.isFinite(value) && value > 0);
}

function findDestinationKey(message: string) {
  const text = normalize(message);
  return Object.entries(destinationAliases).find(([, aliases]) => aliases.some(alias => text.includes(alias)))?.[0] || null;
}

function findTours(message: string) {
  const text = normalize(message);
  const destinationKey = findDestinationKey(message);

  let matches = TOURS.filter(tour => {
    const haystack = normalize([tour.destination, tour.title, tour.region, tour.category, ...tour.tags, ...tour.highlights].join(" "));
    if (destinationKey) {
      return destinationAliases[destinationKey].some(alias => haystack.includes(alias));
    }

    const queryWords = text.split(" ").filter(word => word.length > 2 && !stopWords.has(word));
    return queryWords.some(word => haystack.includes(word));
  });

  if (text.includes("family")) matches = TOURS.filter(tour => tour.category.toLowerCase() === "family" || tour.tags.some(tag => normalize(tag).includes("family")));
  if (text.includes("trek") || text.includes("adventure")) matches = TOURS.filter(tour => ["trekking", "adventure"].includes(tour.category.toLowerCase()));
  if (text.includes("ski") || text.includes("snow") || text.includes("winter")) matches = TOURS.filter(tour => normalize([tour.title, tour.category, ...tour.tags].join(" ")).includes("ski"));
  if (text.includes("cheap") || text.includes("low") || text.includes("budget")) matches = [...(matches.length ? matches : TOURS)].sort((a, b) => a.price - b.price);
  if (text.includes("premium") || text.includes("best") || text.includes("top")) matches = [...(matches.length ? matches : TOURS)].sort((a, b) => b.rating - a.rating || b.safetyScore - a.safetyScore);

  return (matches.length ? matches : TOURS.filter(tour => tour.featured && tour.available))
    .filter(tour => tour.available)
    .slice(0, 4);
}

function findPrimaryTour(message: string, lastTopic: string | null) {
  const matches = findTours(message);
  if (findDestinationKey(message)) return matches[0] || null;
  if (lastTopic) {
    return TOURS.find(tour => normalize(tour.destination) === normalize(lastTopic)) || null;
  }
  return matches[0] || null;
}

function getSafetyZone(message: string, lastTopic: string | null) {
  const text = normalize(message);
  const topic = lastTopic ? normalize(lastTopic) : "";
  return SAFETY_ZONES.find(zone => {
    const area = normalize(zone.area);
    return text.includes(area) || area.split(" ").some(part => part.length > 3 && text.includes(part)) || (topic && area.includes(topic.split(" ")[0]));
  }) || null;
}

function tourLine(tour: (typeof TOURS)[number]) {
  return `- ${tour.title}: ${tour.destination}, ${tour.duration} days, ${money(tour.price)}, ${tour.difficulty}, rating ${tour.rating}/5, safety ${tour.safetyScore}/100`;
}

function appSummary() {
  const activeTours = TOURS.filter(tour => tour.available);
  const confirmedBookings = BOOKINGS.filter(booking => booking.status === "confirmed").length;
  const totalRevenue = COMPANIES.reduce((sum, company) => sum + company.totalRevenue, 0);
  const avgRating = REVIEWS.reduce((sum, review) => sum + review.rating, 0) / REVIEWS.length;

  return {
    activeTours: activeTours.length,
    companies: COMPANIES.length,
    confirmedBookings,
    totalRevenue,
    avgRating: avgRating.toFixed(1),
  };
}

function weatherAdvice(message: string, lastTopic: string | null) {
  const tour = findPrimaryTour(message, lastTopic);
  const place = tour?.destination || lastTopic || "northern Pakistan";

  return `Weather guidance for ${place}:

- Apr-May: mild valleys, blossoms, comfortable sightseeing
- Jun-Aug: best for Hunza, Skardu, Naran Kaghan, Deosai, and high passes
- Sep-Oct: clear skies, photography, cooler evenings
- Nov-Mar: winter trips need snow gear; Naltar and Malam Jabba are stronger picks

Before departure, check route and safety from [Safety Center](/user/safety).`;
}

function itineraryAdvice(message: string, lastTopic: string | null) {
  const tour = findPrimaryTour(message, lastTopic);
  const numbers = getNumbers(message);
  const days = numbers.find(value => value <= 30) || tour?.duration || 5;
  const destination = tour?.destination || lastTopic || "Hunza Valley";

  return `A professional ${days}-day plan for ${destination} should cover:

1. Arrival, hotel check-in, local market, light sightseeing
2. Main viewpoints, heritage sites, and photo stops
3. Lakes or valley drive with guide-led activity
4. Adventure day or cultural experience based on difficulty
5. Buffer time, shopping, and safe return

For a full generated itinerary with budget, group size, date, and interests, open [AI Planner](/user/planner?dest=${encodeURIComponent(destination)}&days=${days}).`;
}

function safetyReply(message: string, lastTopic: string | null) {
  const zone = getSafetyZone(message, lastTopic);
  if (zone) {
    return `Safety snapshot for ${zone.area}:

- Score: ${zone.score}/100
- Status: ${zone.status}
- Travel advice: use verified operators, share route with your group, keep emergency contacts ready, and monitor weather before long drives

Open [Safety Center](/user/safety) for route tracking, safety map, and SOS support.`;
  }

  const safest = [...SAFETY_ZONES].sort((a, b) => b.score - a.score).slice(0, 4);
  return `Current safest destination estimates:

${safest.map(zone => `- ${zone.area}: ${zone.score}/100 (${zone.status})`).join("\n")}

For any mountain route, always confirm road status and weather before departure in [Safety Center](/user/safety).`;
}

function budgetReply(message: string, lastTopic: string | null) {
  const tour = findPrimaryTour(message, lastTopic);
  const numbers = getNumbers(message);
  const groupSize = numbers.find(value => value > 1 && value <= 50) || 1;

  if (tour) {
    return `Budget estimate for ${tour.destination}:

- Package: ${tour.title}
- Per person: ${money(tour.price)}
- Group size detected: ${groupSize}
- Estimated package total: ${money(tour.price * groupSize)}
- Included: ${tour.included.join(", ")}

Track full transport, food, activity, and misc spend in [Budget Tracker](/user/budget).`;
  }

  return `Typical northern Pakistan budget ranges:

- Economy: PKR 20K-30K per person
- Standard: PKR 35K-55K per person
- Premium: PKR 60K-100K+ per person

Use [Budget Tracker](/user/budget) for expense control or [AI Planner](/user/planner) for a custom estimate.`;
}

function companyReply(message: string) {
  const text = normalize(message);

  if (hasAny(text, ["add tour", "create tour", "package"])) {
    return `To add a professional tour package:

1. Open [Company Tours](/company/tours)
2. Choose New Tour
3. Add title, destination, price, duration, group size, difficulty, highlights, and included services
4. Publish only after checking safety score and availability

Strong package pages include clear inclusions, route notes, cancellation terms, and realistic images.`;
  }

  if (hasAny(text, ["booking", "pending", "confirm", "reservation"])) {
    return `Company booking workflow:

- Review pending requests in [Company Bookings](/company/bookings)
- Confirm availability, date, group size, and payment status
- Message the traveler from [Company Chat](/company/chat/list)
- Keep status updated: pending, confirmed, completed, or cancelled

Fast confirmation improves trust and review quality.`;
  }

  if (hasAny(text, ["revenue", "earning", "income", "payment"])) {
    return `Company revenue guidance:

- Track earnings in [Company Revenue](/company/revenue)
- Compare completed bookings with payment status
- Watch refunds, cancellations, and high-performing packages
- Use reviews to improve package pricing and customer retention`;
  }

  return `For company partners, I can help with:

- Tour catalog: [Company Tours](/company/tours)
- Reservations: [Company Bookings](/company/bookings)
- Traveler chat: [Company Messages](/company/chat/list)
- Revenue: [Company Revenue](/company/revenue)
- Reviews and customer quality: [Company Reviews](/company/reviews)

New operators can apply from [Register Company](/user/register-company).`;
}

function adminReply(message: string) {
  const stats = appSummary();
  const text = normalize(message);

  if (hasAny(text, ["approve", "company", "operator"])) {
    return `Admin company moderation:

- Open [Admin Companies](/admin/companies)
- Review company profile, city, contact details, tour quality, and verification status
- Approve legitimate operators, reject incomplete applications, or suspend risky accounts

Current platform snapshot: ${stats.companies} companies and ${stats.activeTours} active mock tours.`;
  }

  return `Admin control areas:

- Dashboard: [Admin Dashboard](/admin/dashboard)
- Users: [Admin Users](/admin/users)
- Companies: [Admin Companies](/admin/companies)
- Tours: [Admin Tours](/admin/tours)
- Bookings: [Admin Bookings](/admin/bookings)
- Safety: [Admin Safety](/admin/safety)
- Analytics: [Admin Analytics](/admin/analytics)

Snapshot: ${stats.activeTours} active tours, ${stats.confirmedBookings} confirmed bookings, ${money(stats.totalRevenue)} company revenue, average review ${stats.avgRating}/5.`;
}

function professionalReply(message: string, role: string | undefined, lastTopic: string | null, pathname: string) {
  const intent = detectIntent(message);
  const tour = findPrimaryTour(message, lastTopic);
  const tours = findTours(message);
  const roleName = role === "company" ? "company partner" : role === "admin" ? "administrator" : "traveler";
  const stats = appSummary();

  switch (intent) {
    case "greeting":
      return `Hello. I am Zia, your Smart Tour assistant.

I can help you as a ${roleName} with tour discovery, booking flow, budget estimates, route safety, itinerary planning, company operations, admin controls, and support escalation.`;

    case "farewell":
      return "You are welcome. I am here whenever you need help with tours, bookings, safety, budgets, company operations, or admin workflows.";

    case "destination":
      return `Recommended matches:

${tours.map(tourLine).join("\n")}

Browse details in [Tours](/user/tours) or generate a custom route in [AI Planner](/user/planner).`;

    case "compare":
      return `Quick comparison:

${tours.slice(0, 3).map(t => `- ${t.destination}: ${money(t.price)}, ${t.duration} days, ${t.difficulty}, rating ${t.rating}/5, safety ${t.safetyScore}/100`).join("\n")}

Best value: ${[...tours].sort((a, b) => a.price - b.price)[0]?.title || "Naran Kaghan Family Package"}
Highest rated: ${[...tours].sort((a, b) => b.rating - a.rating)[0]?.title || "Hunza Valley Explorer"}
Safest score: ${[...tours].sort((a, b) => b.safetyScore - a.safetyScore)[0]?.title || "Naran Kaghan Family Package"}`;

    case "booking":
      if (tour) {
        return `Booking match: ${tour.title}

- Destination: ${tour.destination}
- Duration: ${tour.duration} days
- Price: ${money(tour.price)} per person
- Max group: ${tour.maxGroup}
- Company: ${tour.company}
- Safety score: ${tour.safetyScore}/100

Open [Tours](/user/tours) to reserve it. After submission, track status from [My Bookings](/user/bookings).`;
      }

      return `Booking flow:

1. Open [Tours](/user/tours)
2. Select a package
3. Submit date, phone, and group size
4. Track status in [My Bookings](/user/bookings)
5. Coordinate details through [Messages](/user/chat/list)`;

    case "cancel":
      return `Cancellation or reschedule flow:

- Open [My Bookings](/user/bookings)
- Check booking status and payment status
- For confirmed trips, message the operator in [Messages](/user/chat/list)
- Ask for a written confirmation for date changes, cancellation, or refund handling`;

    case "budget":
      return budgetReply(message, lastTopic);

    case "payment":
      return `Payment guidance:

- Confirm package price and group size before paying
- Keep reservation ID and receipt
- Check payment status in [My Bookings](/user/bookings)
- Company partners can reconcile revenue in [Company Revenue](/company/revenue)

If payment status looks wrong, contact the operator through chat with booking ID, amount, and payment date.`;

    case "safety":
      return safetyReply(message, lastTopic);

    case "weather":
      return weatherAdvice(message, lastTopic);

    case "itinerary":
      return itineraryAdvice(message, lastTopic);

    case "group":
      return `Group travel workflow:

- Add members and destination in [Group Planning](/user/group)
- Align preferred dates
- Compare individual budgets and total budget
- Use [AI Planner](/user/planner) for route and itinerary
- Book only after group size and payment split are clear`;

    case "company":
      return companyReply(message);

    case "admin":
    case "analytics":
      return adminReply(message);

    case "review":
      return `Reviews and feedback:

- Travelers can submit reviews from [My Reviews](/user/reviews)
- Companies can monitor sentiment in [Company Reviews](/company/reviews)
- Admins can moderate platform reviews in [Admin Reviews](/admin/reviews)

Current mock feedback average is ${stats.avgRating}/5 across ${REVIEWS.length} reviews. Clear, specific reviews help operators improve faster.`;

    case "auth":
      return `Account help:

- Login: [Login](/auth/login)
- Register: [Register](/auth/register)
- Forgot password: [Forgot Password](/auth/forgot-password)
- Update password: [Update Password](/auth/update-password)

For company access, first create a traveler account, then apply through [Register Company](/user/register-company).`;

    case "support":
      return `Support routing:

- Traveler issue: [User Messages](/user/chat/list)
- Company issue: [Company Messages](/company/chat/list)
- Public contact: [Contact](/contact)

Send booking ID, destination, travel date, amount paid, and a short issue summary. That gives support enough context to act quickly.`;

    default:
      return `I can handle major Smart Tour queries:

- Recommend or compare tours
- Estimate budget and group cost
- Explain booking, payment, cancellation, and refunds
- Check safety scores and route advice
- Build itinerary guidance
- Guide company operations
- Guide admin moderation and analytics

You are currently on ${pathname || "Smart Tour"}. Try: "Compare Hunza and Skardu", "Budget for 4 people in Swat", or "How do I approve a company?"`;
  }
}

export default function Chatbot() {
  const { profile } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastTopic, setLastTopic] = useState<string | null>(null);
  const [recentRecommendations, setRecentRecommendations] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const storageKey = `smart-tour-chat-${profile?.role || "guest"}`;

  const quickActions: QuickAction[] = useMemo(() => {
    if (profile?.role === "admin") {
      return [
        { label: "Platform stats", prompt: "Show platform analytics summary", icon: <BarChart3 size={13} /> },
        { label: "Approve company", prompt: "How do I approve a company?", icon: <BriefcaseBusiness size={13} /> },
        { label: "Safety admin", prompt: "How do I manage safety alerts?", icon: <ShieldCheck size={13} /> },
        { label: "Reviews", prompt: "How do I moderate reviews?", icon: <Star size={13} /> },
      ];
    }

    if (profile?.role === "company") {
      return [
        { label: "Pending bookings", prompt: "How do I manage pending bookings?", icon: <CalendarCheck size={13} /> },
        { label: "Add tour", prompt: "How can my company add a new tour package?", icon: <Compass size={13} /> },
        { label: "Revenue", prompt: "How can I track company revenue?", icon: <Wallet size={13} /> },
        { label: "Customer chat", prompt: "How do I respond to traveler queries professionally?", icon: <LifeBuoy size={13} /> },
      ];
    }

    return [
      { label: "Recommend tour", prompt: "Recommend top tours for northern Pakistan", icon: <Compass size={13} /> },
      { label: "Compare trips", prompt: "Compare Hunza and Skardu tours", icon: <Sparkles size={13} /> },
      { label: "Budget help", prompt: "Budget for 4 people in Swat", icon: <Wallet size={13} /> },
      { label: "Safety", prompt: "Is Hunza safe for travel?", icon: <ShieldCheck size={13} /> },
    ];
  }, [profile?.role]);

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
      return;
    }

    const roleIntro =
      profile?.role === "admin"
        ? "I can help with platform users, companies, tours, bookings, reviews, safety, and analytics."
        : profile?.role === "company"
          ? "I can help with bookings, packages, traveler chat, reviews, customers, and revenue."
          : "I can help with destinations, budgets, bookings, group planning, safety, and operator support.";

    setMessages([
      {
        id: crypto.randomUUID(),
        role: "bot",
        text: `Hello${profile?.full_name ? ` ${profile.full_name}` : ""}. I am Zia, your Smart Tour assistant.

${roleIntro}`,
      },
    ]);
  }, [storageKey, profile?.full_name, profile?.role]);

  useEffect(() => {
    if (messages.length > 0) sessionStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const sendMessage = async (text: string = input) => {
    const userText = text.trim();
    if (!userText || typing) return;

    const tour = findPrimaryTour(userText, lastTopic);
    if (tour && findDestinationKey(userText)) setLastTopic(tour.destination);

    setInput("");
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text: userText }]);
    setTyping(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          role: profile?.role,
          pathname,
          lastTopic: tour?.destination || lastTopic,
          recentRecommendations,
        }),
      });

      if (!response.ok) throw new Error("Chatbot API failed");

      const data = await response.json();
      const reply = typeof data.reply === "string" ? data.reply : professionalReply(userText, profile?.role, tour?.destination || lastTopic, pathname);

      if (Array.isArray(data.recommendedDestinations) && data.recommendedDestinations.length > 0) {
        setRecentRecommendations(prev => [...prev, ...data.recommendedDestinations.map(String)].slice(-8));
      }

      if (typeof data.lastTopic === "string" && data.lastTopic) {
        setLastTopic(data.lastTopic);
      }

      setTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: reply }]);
    } catch {
      window.setTimeout(() => {
        const reply = professionalReply(userText, profile?.role, tour?.destination || lastTopic, pathname);
        setTyping(false);
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: reply }]);
      }, 300);
    }
  };

  const resetChat = () => {
    sessionStorage.removeItem(storageKey);
    setLastTopic(null);
    setRecentRecommendations([]);
    setMessages([
      {
        id: crypto.randomUUID(),
        role: "bot",
        text: "Conversation reset. Tell me what you need help with: tours, bookings, safety, budgets, company operations, or admin workflows.",
      },
    ]);
  };

  const renderMessage = (text: string) =>
    text.split(/(\[.*?\]\(.*?\))/g).map((part, index) => {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a key={index} href={match[2]} style={{ color: "var(--teal)", textDecoration: "underline", fontWeight: 800 }}>
            {match[1]}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });

  return (
    <>
      {open && (
        <div className="chat-window animate-fade" role="dialog" aria-label="Smart Tour assistant">
          <div className="chat-header">
            <div className="chat-header-avatar" aria-hidden="true">
              <Bot size={18} />
            </div>
            <div className="chat-header-copy">
              <div className="chat-header-title">Zia - Smart Tour Assistant</div>
              <div className="chat-header-status">
                <Circle size={8} fill="currentColor" /> Project-aware support online
              </div>
            </div>
            <button onClick={resetChat} className="chat-icon-btn chat-reset-btn" aria-label="Reset chat">
              <RefreshCcw size={15} />
            </button>
            <button onClick={() => setOpen(false)} className="chat-icon-btn" aria-label="Close chat">
              <X size={16} />
            </button>
          </div>

          <div className="chat-body custom-scrollbar">
            {messages.map(message => (
              <div key={message.id} className={`chat-msg ${message.role}`} style={{ whiteSpace: "pre-line" }}>
                {renderMessage(message.text)}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="chat-quick-actions">
                {quickActions.map(action => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    className="chat-quick-action"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {typing && (
              <div className="chat-msg bot chat-typing">
                <span className="loading-spinner chat-typing-spinner" />
                <span>Zia is preparing a response...</span>
              </div>
            )}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>

          <div className="chat-footer">
            <input
              className="chat-input"
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") sendMessage(input);
              }}
              placeholder={profile?.role === "admin" ? "Ask about platform management..." : profile?.role === "company" ? "Ask about bookings, tours, revenue..." : "Ask about tours, budget, safety..."}
            />
            <button onClick={() => sendMessage(input)} className="chat-send-btn" aria-label="Send message">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button className="chatbot-fab animate-glow" onClick={() => setOpen(!open)} aria-label={open ? "Close assistant" : "Open assistant"}>
        {open ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </>
  );
}
