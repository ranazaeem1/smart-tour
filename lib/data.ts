/**
 * @file data.ts
 * @description Smart Tour — Shared Data & Types.
 * Central repository for TypeScript interfaces and mock datasets used across the application.
 * @author Smart Tour Team
 */

// ==========================================
// Types & Interfaces
// ==========================================

export interface Tour {
  id: string;
  title: string;
  company: string;
  companyId: string;
  destination: string;
  region: string;
  price: number;
  duration: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  tags: string[];
  maxGroup: number;
  difficulty: string;
  highlights: string[];
  included: string[];
  safetyScore: number;
  available: boolean;
  featured: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "user" | "company" | "admin";
  joinDate: string;
  totalBookings: number;
  totalSpent: number;
  verified: boolean;
}

export interface Booking {
  id: string;
  tourId: string;
  tourTitle: string;
  userId: string;
  userName: string;
  companyId: string;
  companyName: string;
  destination: string;
  date: string;
  groupSize: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "refunded";
  createdAt: string;
}

export interface Review {
  id: string;
  tourId: string;
  tourTitle: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  date: string;
  helpful: number;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  verified: boolean;
  status: "pending" | "approved" | "suspended";
  rating: number;
  totalTours: number;
  totalBookings: number;
  totalRevenue: number;
  joinDate: string;
  logo: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: string[];
  travelTime: string;
  accommodation: string;
  meals: string[];
  weather: string;
  weatherIcon: string;
}

// ---- Mock Data ----

export const DESTINATIONS = [
  "Murree", "Nathia Gali", "Hunza Valley", "Swat Valley", "Kalam", 
  "Malam Jabba", "Naran", "Kaghan", "Skardu", "Gilgit", "Fairy Meadows",
  "Attabad Lake", "Khunjerab Pass", "Shangrila Resort", "Naltar Valley",
  "Rakaposhi", "Passu", "Shogran", "Babusar Top", "Neelum Valley",
  "Chitral", "Kalash Valley", "Astore", "Deosai Plains", "Phander Valley"
];

export const TOURS: Tour[] = [
  {
    id: "t1", title: "Hunza Valley Explorer", company: "Northern Trails Co.", companyId: "c1",
    destination: "Hunza Valley", region: "Gilgit-Baltistan", price: 45000, duration: 7,
    rating: 4.9, reviews: 128, image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    category: "Adventure", tags: ["Trekking","Culture","Photography"], maxGroup: 12,
    difficulty: "Moderate", highlights: ["Altit Fort","Baltit Fort","Eagle's Nest","Attabad Lake"],
    included: ["Transport","Hotels","Meals","Guide"], safetyScore: 94, available: true, featured: true
  },
  {
    id: "t2", title: "Skardu & Deosai Plains", company: "Peak Adventures", companyId: "c2",
    destination: "Skardu", region: "Gilgit-Baltistan", price: 65000, duration: 10,
    rating: 4.8, reviews: 94, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
    category: "Trekking", tags: ["K2 View","Camping","Wildlife"], maxGroup: 8,
    difficulty: "Challenging", highlights: ["Deosai Plains","Satpara Lake","Shangrila","K2 Viewpoint"],
    included: ["Transport","Camping Gear","Meals","Guide"], safetyScore: 87, available: true, featured: true
  },
  {
    id: "t3", title: "Swat Valley Heritage Tour", company: "Green Valley Tours", companyId: "c3",
    destination: "Swat Valley", region: "KPK", price: 28000, duration: 5,
    rating: 4.7, reviews: 211, image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800",
    category: "Cultural", tags: ["History","Nature","Family"], maxGroup: 20,
    difficulty: "Easy", highlights: ["Malam Jabba","Mahodand Lake","Saidu Sharif","Udegram"],
    included: ["Transport","Hotels","Breakfast","Guide"], safetyScore: 92, available: true, featured: true
  },
  {
    id: "t4", title: "Fairy Meadows Basecamp", company: "Nanga Parbat Expeditions", companyId: "c1",
    destination: "Fairy Meadows", region: "Gilgit-Baltistan", price: 35000, duration: 4,
    rating: 4.9, reviews: 76, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    category: "Adventure", tags: ["Camping","Nanga Parbat","Trekking"], maxGroup: 10,
    difficulty: "Moderate", highlights: ["Fairy Meadows Camp","Beyal Camp","Nanga Parbat View","Forest Walk"],
    included: ["Transport","Camping","All Meals","Guide"], safetyScore: 89, available: true, featured: false
  },
  {
    id: "t5", title: "Naran Kaghan Family Package", company: "Family Getaways PK", companyId: "c4",
    destination: "Naran Kaghan", region: "KPK", price: 22000, duration: 4,
    rating: 4.6, reviews: 342, image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    category: "Family", tags: ["Shogran","Saif ul Malook","Family Friendly"], maxGroup: 30,
    difficulty: "Easy", highlights: ["Lake Saif ul Malook","Babusar Top","Lulusar Lake","Shogran"],
    included: ["Transport","Hotels","Breakfast","Guide"], safetyScore: 95, available: true, featured: true
  },
  {
    id: "t6", title: "Naltar Valley Skiing", company: "Northern Trails Co.", companyId: "c1",
    destination: "Naltar Valley", region: "Gilgit-Baltistan", price: 38000, duration: 3,
    rating: 4.7, reviews: 58, image: "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800",
    category: "Sports", tags: ["Skiing","Snow","Winter"], maxGroup: 15,
    difficulty: "Moderate", highlights: ["Naltar Lakes","Ski Resort","Snow Sports","Wildlife"],
    included: ["Transport","Hotel","Ski Equipment","Guide"], safetyScore: 91, available: true, featured: false
  },
  {
    id: "t7", title: "Murree & Nathia Gali Weekend", company: "Family Getaways PK", companyId: "c4",
    destination: "Murree", region: "Punjab", price: 18000, duration: 3,
    rating: 4.5, reviews: 420, image: "https://images.unsplash.com/photo-1588713028328-86d70ae4f469?w=800",
    category: "Family", tags: ["Murree","Nathia Gali","Weekend"], maxGroup: 25,
    difficulty: "Easy", highlights: ["Mall Road","Patriata Chairlift","Mukshpuri Peak","Ayubia"],
    included: ["Transport","Hotels","Breakfast"], safetyScore: 90, available: true, featured: true
  },
  {
    id: "t8", title: "Malam Jabba Ski Safari", company: "Green Valley Tours", companyId: "c3",
    destination: "Malam Jabba", region: "KPK", price: 26000, duration: 4,
    rating: 4.8, reviews: 145, image: "https://images.unsplash.com/photo-1616422285623-149eb0f3f208?w=800",
    category: "Adventure", tags: ["Skiing","Swat","Chairlift"], maxGroup: 20,
    difficulty: "Moderate", highlights: ["Ski Resort","Chairlift","Fiza Ghat","White Palace"],
    included: ["Transport","Hotels","Breakfast","Ski Gear"], safetyScore: 88, available: true, featured: true
  }
];

export const COMPANIES: Company[] = [
  { id:"c1", name:"Northern Trails Co.", email:"info@northerntrails.pk", phone:"0300-1234567", city:"Gilgit", verified:true, status:"approved", rating:4.9, totalTours:24, totalBookings:856, totalRevenue:3850000, joinDate:"2023-03-15", logo:"NT" },
  { id:"c2", name:"Peak Adventures", email:"hello@peakadventures.pk", phone:"0311-7654321", city:"Skardu", verified:true, status:"approved", rating:4.8, totalTours:18, totalBookings:542, totalRevenue:2340000, joinDate:"2023-06-20", logo:"PA" },
  { id:"c3", name:"Green Valley Tours", email:"contact@greenvalley.pk", phone:"0333-9876543", city:"Mingora", verified:true, status:"approved", rating:4.7, totalTours:31, totalBookings:1124, totalRevenue:1890000, joinDate:"2022-11-08", logo:"GV" },
  { id:"c4", name:"Family Getaways PK", email:"info@familygetaways.pk", phone:"0321-1111222", city:"Lahore", verified:false, status:"pending", rating:4.6, totalTours:12, totalBookings:0, totalRevenue:0, joinDate:"2024-01-10", logo:"FG" },
  { id:"c5", name:"Silk Road Journeys", email:"hello@silkroadpk.com", phone:"0345-5556666", city:"Islamabad", verified:false, status:"pending", rating:0, totalTours:0, totalBookings:0, totalRevenue:0, joinDate:"2024-02-20", logo:"SR" },
];

export const BOOKINGS: Booking[] = [
  { id:"b1", tourId:"t1", tourTitle:"Hunza Valley Explorer", userId:"u1", userName:"Ali Hassan", companyId:"c1", companyName:"Northern Trails Co.", destination:"Hunza Valley", date:"2024-06-15", groupSize:4, totalPrice:180000, status:"confirmed", paymentStatus:"paid", createdAt:"2024-05-01" },
  { id:"b2", tourId:"t3", tourTitle:"Swat Valley Heritage Tour", userId:"u2", userName:"Sara Khan", companyId:"c3", companyName:"Green Valley Tours", destination:"Swat Valley", date:"2024-06-20", groupSize:2, totalPrice:56000, status:"pending", paymentStatus:"pending", createdAt:"2024-05-10" },
  { id:"b3", tourId:"t2", tourTitle:"Skardu & Deosai Plains", userId:"u3", userName:"Umar Farooq", companyId:"c2", companyName:"Peak Adventures", destination:"Skardu", date:"2024-07-01", groupSize:3, totalPrice:195000, status:"confirmed", paymentStatus:"paid", createdAt:"2024-05-15" },
  { id:"b4", tourId:"t5", tourTitle:"Naran Kaghan Family Package", userId:"u4", userName:"Fatima Malik", companyId:"c4", companyName:"Family Getaways PK", destination:"Naran Kaghan", date:"2024-06-28", groupSize:6, totalPrice:132000, status:"completed", paymentStatus:"paid", createdAt:"2024-04-25" },
];

export const REVIEWS: Review[] = [
  { id:"r1", tourId:"t1", tourTitle:"Hunza Valley Explorer", userId:"u1", userName:"Ali Hassan", rating:5, comment:"Absolutely breathtaking experience! The guide was knowledgeable and the views were beyond description. Highly recommend!", sentiment:"positive", date:"2024-05-20", helpful:24 },
  { id:"r2", tourId:"t3", tourTitle:"Swat Valley Heritage Tour", userId:"u2", userName:"Sara Khan", rating:4, comment:"Great trip overall. Food could have been better but the scenery made up for everything.", sentiment:"positive", date:"2024-05-18", helpful:15 },
  { id:"r3", tourId:"t2", tourTitle:"Skardu & Deosai Plains", userId:"u3", userName:"Umar Farooq", rating:3, comment:"The trip was okay but the accommodation was not as described. Deosai was beautiful though.", sentiment:"neutral", date:"2024-05-12", helpful:8 },
  { id:"r4", tourId:"t5", tourTitle:"Naran Kaghan Family Package", userId:"u4", userName:"Fatima Malik", rating:5, comment:"Perfect family trip! Kids loved Saif ul Malook lake. Very well organized and safe.", sentiment:"positive", date:"2024-05-05", helpful:31 },
];

export const ITINERARY_5DAY: ItineraryDay[] = [
  { day:1, title:"Arrival in Gilgit", places:["Gilgit Airport","Gilgit Bazaar","Kargah Buddha"], travelTime:"2h from ISB", accommodation:"Serena Hotel Gilgit", meals:["Dinner"], weather:"Sunny 22°C", weatherIcon:"☀️" },
  { day:2, title:"Karimabad & Altit Fort", places:["Karimabad","Altit Fort","Baltit Fort","Ganish Village"], travelTime:"3h drive", accommodation:"Hunza Serena", meals:["Breakfast","Dinner"], weather:"Partly Cloudy 18°C", weatherIcon:"⛅" },
  { day:3, title:"Eagle's Nest & Attabad Lake", places:["Eagle's Nest viewpoint","Attabad Lake","Gulmit Village"], travelTime:"4h total", accommodation:"Hunza Serena", meals:["Breakfast","Lunch","Dinner"], weather:"Clear 20°C", weatherIcon:"☀️" },
  { day:4, title:"Passu Cones & Khunjerab", places:["Passu Cones","Khunjerab Pass","Borith Lake"], travelTime:"5h drive", accommodation:"Passu Inn", meals:["Breakfast","Lunch"], weather:"Cool 12°C", weatherIcon:"🌤️" },
  { day:5, title:"Return to Islamabad", places:["Shopping in Gilgit","Gilgit Airport Departure"], travelTime:"2h to airport", accommodation:"—", meals:["Breakfast"], weather:"Sunny 24°C", weatherIcon:"☀️" },
];

export const MONTHLY_REVENUE = [
  { month:"Jan", revenue:420000, bookings:18 },
  { month:"Feb", revenue:380000, bookings:15 },
  { month:"Mar", revenue:650000, bookings:26 },
  { month:"Apr", revenue:890000, bookings:34 },
  { month:"May", revenue:1200000, bookings:48 },
  { month:"Jun", revenue:1450000, bookings:58 },
  { month:"Jul", revenue:1680000, bookings:67 },
  { month:"Aug", revenue:1540000, bookings:62 },
  { month:"Sep", revenue:980000, bookings:39 },
  { month:"Oct", revenue:760000, bookings:30 },
  { month:"Nov", revenue:520000, bookings:21 },
  { month:"Dec", revenue:450000, bookings:18 },
];

export const BUDGET_BREAKDOWN = [
  { name:"Accommodation", value:35, color:"#14D2BE", amount:15750 },
  { name:"Transport", value:25, color:"#7C3AED", amount:11250 },
  { name:"Food", value:20, color:"#F59E0B", amount:9000 },
  { name:"Activities", value:12, color:"#10B981", amount:5400 },
  { name:"Misc", value:8, color:"#F97316", amount:3600 },
];

export const SAFETY_ZONES = [
  { area:"Hunza Valley", score:94, status:"Safe", color:"#10B981" },
  { area:"Skardu", score:87, status:"Safe", color:"#10B981" },
  { area:"Swat Valley", score:82, status:"Moderate", color:"#F59E0B" },
  { area:"Naran Kaghan", score:95, status:"Very Safe", color:"#14D2BE" },
  { area:"Fairy Meadows", score:89, status:"Safe", color:"#10B981" },
  { area:"Gilgit City", score:78, status:"Moderate", color:"#F59E0B" },
  { area:"Murree", score:90, status:"Safe", color:"#10B981" },
  { area:"Nathia Gali", score:92, status:"Safe", color:"#10B981" },
  { area:"Kalam", score:85, status:"Safe", color:"#10B981" },
  { area:"Malam Jabba", score:88, status:"Safe", color:"#10B981" },
];

export function formatPKR(amount: number): string {
  if (amount >= 1000000) return `PKR ${(amount/1000000).toFixed(1)}M`;
  if (amount >= 1000) return `PKR ${(amount/1000).toFixed(0)}K`;
  return `PKR ${amount.toLocaleString()}`;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    confirmed: "badge-emerald", pending: "badge-gold",
    completed: "badge-teal", cancelled: "badge-rose",
    approved: "badge-emerald", suspended: "badge-rose",
    paid: "badge-emerald", refunded: "badge-purple",
    positive: "badge-emerald", neutral: "badge-gold", negative: "badge-rose",
  };
  return map[status] || "badge-teal";
}
