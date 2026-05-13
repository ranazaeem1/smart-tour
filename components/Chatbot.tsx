/**
 * @file Chatbot.tsx
 * @description Floating AI Chatbot component ("Zia"). Provides instant answers
 * to user queries regarding tours, destinations, safety, and budgets.
 * @author Smart Tour Team
 * @dependencies react, @/lib/data
 */

// ==========================================
// Imports
// ==========================================
"use client";
import { useState, useRef, useEffect } from "react";
import { TOURS, SAFETY_ZONES } from "@/lib/data";

// ==========================================
// Types
// ==========================================

/**
 * Defines the structure of a chat message.
 * @interface Message
 */
interface Message { 
  id: string; 
  role: "user" | "bot"; 
  text: string; 
}

// ==========================================
// Constants
// ==========================================

const QUICK_REPLIES = ["🏔️ Top Destinations", "💰 Budget Guide", "🛡️ Safety Info", "📅 Book a Tour"];

/**
 * Static mapping of keywords to bot responses.
 * @constant
 * @type {Record<string, string>}
 */
const BOT_RESPONSES: Record<string, string> = {
  hunza: "🏔️ Hunza Valley is one of Pakistan's most beautiful destinations! Best time to visit: April-October.",
  skardu: "⛰️ Skardu is the gateway to K2! Expect stunning landscapes and Deosai Plains. Best season: June-September.",
  murree: "🌲 Murree is a popular hill station near Islamabad, great for quick family getaways.",
  nathiagali: "🌲 Nathia Gali offers beautiful pine forests and hiking trails like Mukshpuri. Best visited in summer!",
  swat: "🏞️ Swat Valley, known as the Switzerland of the East! Don't miss Malam Jabba and Kalam.",
  kalam: "🏞️ Kalam Valley in Swat features dense forests and the beautiful Mahodand Lake. Best in summer.",
  malamjabba: "⛷️ Malam Jabba is famous for its ski resort and chairlift! Great for winter sports and summer views.",
  naran: "🌊 Naran is famous for Lake Saif-ul-Malook and Babusar Top. Best time: June to September.",
  kaghan: "🌊 Kaghan Valley offers lush green landscapes and the Kunhar River. Great for trout fishing!",
  fairymeadows: "⛺ Fairy Meadows offers stunning views of Nanga Parbat. It's a highly recommended adventure!",
  chitral: "🏔️ Chitral is home to the Kalash Valley and unique culture. Best visited in late spring or summer.",
  neelum: "🌊 Neelum Valley in AJK features crystal-clear rivers and lush green mountains.",
  naltar: "🎿 Naltar Valley is known for its colorful lakes and winter skiing.",
  shogran: "🌲 Shogran and Siri Paye Meadows are perfect for a weekend retreat with majestic views.",
  deosai: "🐻 Deosai Plains is the land of giants, a high-altitude plateau famous for brown bears.",
  phander: "🎣 Phander Valley is renowned for tranquil lakes and excellent trout fishing.",
  astore: "⛰️ Astore Valley provides rugged landscapes and acts as a gateway to Deosai and Rama Lake.",
  babusar: "🏔️ Babusar Pass is a spectacular high mountain pass connecting Kaghan Valley to Gilgit-Baltistan.",
  budget: "💰 For a typical 5-day northern Pakistan tour:\n• Economy: PKR 20,000-30,000\n• Standard: PKR 35,000-55,000\n• Premium: PKR 60,000-100,000+\nAll include transport, accommodation & meals.",
  weather: "🌤️ Best weather in northern Pakistan:\n• Spring (Apr-May): Blooming apricots in Hunza\n• Summer (Jun-Aug): Best for high altitude treks\n• Autumn (Sep-Oct): Golden foliage, clear skies\n• Winter (Nov-Mar): Snow sports in Naltar & Malam Jabba",
  book: "📅 To book a tour:\n1. Browse available tours\n2. Select your budget & dates\n3. Choose group size\n4. Confirm & pay securely\nNeed help finding the perfect tour? Tell me your budget!",
  default: "🤖 I'm your Smart Tour AI assistant! I can help with:\n• Destination recommendations, weather & best time to visit\n• Budget guides and safety scores\n\nNeed to talk to a human? [Chat with a Tour Operator](/user/chat/list)\n\nWhat would you like to know?",
};

// ==========================================
// Component: Chatbot
// ==========================================

/**
 * Chatbot Component
 * A floating widget that provides simulated AI chat assistance using pre-defined intents.
 * 
 * @returns {JSX.Element} The rendered Chatbot widget
 */
export default function Chatbot() {
  // State Management
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lastTopic, setTopic] = useState<string | null>(null);
  
  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // Hooks & Lifecycle
  // ==========================================

  // Initialize messages from sessionStorage to maintain history across reloads
  useEffect(() => {
    const saved = sessionStorage.getItem("chat_messages");
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([{ id: crypto.randomUUID(), role: "bot", text: "👋 Hi! I'm Zia, your Smart Tour AI assistant. Ask me anything about northern Pakistan tours!" }]);
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to the bottom of the chat window
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  // ==========================================
  // Handlers
  // ==========================================

  /**
   * Processes the user input and generates an appropriate response based on keywords.
   * 
   * @param {string} msg - The raw user input string
   * @returns {Promise<string>} The generated bot response
   */
  const getBotReply = async (msg: string): Promise<string> => {
    const lower = msg.toLowerCase();
    
    // 1. Basic Greetings
    if (/^(hi|hello|hey|salam|assalam)/i.test(lower)) {
      return "👋 Hello! I'm Zia, your travel assistant. Where would you like to explore in northern Pakistan?";
    }

    // 2. Farewells
    if (/^(thanks|thank you|shukriya|bye|goodbye)/i.test(lower)) {
      return "😊 You're welcome! Feel free to ask anytime. Happy travels! 🏔️";
    }

    // Identify topic from destinations
    let currentTopic = lastTopic;
    const destKeys = Object.keys(BOT_RESPONSES).filter(k => !["budget", "weather", "book", "default", "safe"].includes(k));
    
    // Check if the message mentions a known destination
    for (const d of destKeys) {
      if (lower.includes(d) || (d === 'nathiagali' && lower.includes('nathia gali')) || (d === 'malamjabba' && lower.includes('malam jabba')) || (d === 'fairymeadows' && lower.includes('fairy meadows'))) {
        currentTopic = d;
        setTopic(d);
        break;
      }
    }

    // 3. Booking intent
    if (lower.includes("book") || lower.includes("reserve") || lower.includes("buy")) {
      if (currentTopic) {
        // Try to dynamically find a real tour for this destination
        // TODO: Replace this simulated lookup with a real backend semantic search API
        const tour = TOURS.find(t => t.destination.toLowerCase().replace(/\s+/g, '').includes(currentTopic!) || currentTopic!.includes(t.destination.toLowerCase().replace(/\s+/g, '')));
        if (tour) {
          return `📅 I found the perfect tour for you!\n\n**${tour.title}**\nPrice: PKR ${tour.price.toLocaleString()}/person · ${tour.duration} days\n\n[Book Now →](/user/tours)`;
        }
      }
      return BOT_RESPONSES.book;
    }

    // 4. Budget intent with context
    if (lower.includes("budget") || lower.includes("price") || lower.includes("cost") || lower.includes("pkr") || lower.includes("how much")) {
      if (currentTopic) {
        const tour = TOURS.find(t => t.destination.toLowerCase().replace(/\s+/g, '').includes(currentTopic!) || currentTopic!.includes(t.destination.toLowerCase().replace(/\s+/g, '')));
        if (tour) {
          return `💰 For a tour to ${tour.destination}, the starting price is around PKR ${tour.price.toLocaleString()} for ${tour.duration} days.`;
        }
      }
      return BOT_RESPONSES.budget;
    }

    // 5. Safety Data Integration
    if (lower.includes("safe") || lower.includes("security") || lower.includes("danger") || lower.includes("risk")) {
      if (currentTopic) {
        const zone = SAFETY_ZONES.find(z => z.area.toLowerCase().replace(/\s+/g, '').includes(currentTopic!) || currentTopic!.includes(z.area.toLowerCase().replace(/\s+/g, '')));
        if (zone) return `🛡️ Safety in ${zone.area}:\nSafety Score: ${zone.score}/100 — ${zone.status}`;
      }
      return "🛡️ Northern Pakistan is generally safe for tourists! Hunza, Naran, and Swat have safety scores above 85%. Always check weather forecasts and travel with registered companies.";
    }

    // 6. Generic inquiries
    if (lower.includes("weather") || lower.includes("season") || lower.includes("best time")) return BOT_RESPONSES.weather;
    if (lower.includes("top destinations") || lower.includes("where to go")) return "🏔️ Top destinations include Hunza Valley, Skardu, Swat Valley, Naran, Kaghan, and Fairy Meadows. Which one interests you?";

    // 7. Contextual destination info
    if (currentTopic && destKeys.includes(currentTopic)) {
      if (BOT_RESPONSES[currentTopic]) {
        return BOT_RESPONSES[currentTopic];
      }
    }

    return BOT_RESPONSES.default;
  };

  /**
   * Handles user submission of a message, updates state, and triggers bot reply.
   * 
   * @param {string} text - Message to send
   */
  const send = async (text: string = input) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    
    // Optimistic UI update: Add User Msg immediately
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "user", text: userMsg }]);
    setTyping(true);

    try {
      const reply = await getBotReply(userMsg);
      // Simulate network delay for natural feel
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: reply }]);
      }, 600);
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "bot", text: "Sorry, I encountered an error. Please try again." }]);
    }
  };

  // ==========================================
  // JSX Return
  // ==========================================
  return (
    <>
      {/* Floating Chat Window */}
      {open && (
        <div className="chat-window animate-fade">
          {/* Header */}
          <div className="chat-header">
            <div style={{ width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🤖</div>
            <div>
              <div style={{ fontWeight:700,fontSize:14 }}>Zia — AI Travel Assistant</div>
              <div style={{ fontSize:12,opacity:0.8 }}>● Online</div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ marginLeft:"auto",background:"rgba(255,255,255,0.2)",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",color:"white",fontSize:16 }}>✕</button>
          </div>
          
          {/* Body / Messages List */}
          <div className="chat-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg ${m.role}`} style={{ whiteSpace:"pre-line" }}>
                {/* Parse basic markdown like links */}
                {m.text.split(/(\[.*?\]\(.*?\))/g).map((part, i) => {
                  const match = part.match(/\[(.*?)\]\((.*?)\)/);
                  if (match) return <a key={i} href={match[2]} style={{ color: "var(--teal)", textDecoration: "underline" }}>{match[1]}</a>;
                  return <span key={i}>{part}</span>;
                })}
              </div>
            ))}
            
            {/* Show quick replies if only the initial greeting exists */}
            {messages.length === 1 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {QUICK_REPLIES.map(qr => (
                  <button key={qr} onClick={() => send(qr)} className="badge badge-teal" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--text-secondary)" }}>
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Typing Indicator */}
            {typing && (
              <div className="chat-msg bot" style={{ display:"flex",gap:4,alignItems:"center" }}>
                <span className="loading-spinner" style={{ width:14,height:14 }}/>
                <span style={{ fontSize:12,color:"var(--text-muted)" }}>Zia is typing...</span>
              </div>
            )}
            {/* Invisible div to scroll into view */}
            <div ref={bottomRef} style={{ height: 1 }} />
          </div>

          {/* Footer / Input Area */}
          <div className="chat-footer">
            <input
              className="chat-input" value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send(input)}
              placeholder="Ask about tours, budget, safety..."
            />
            <button onClick={() => send(input)} className="btn btn-primary btn-sm" style={{ borderRadius:"50%",padding:"10px",width:40,height:40,flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21L23 12 2 3v7l15 2-15 2v7z"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button className="chatbot-fab animate-glow" onClick={()=>setOpen(!open)}>
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          : <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
        }
      </button>
    </>
  );
}
