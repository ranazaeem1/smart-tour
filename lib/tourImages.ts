const DEFAULT_TOUR_IMAGE = "/images/hunza.png";

const TOUR_IMAGE_ALIASES: Array<{ image: string; aliases: string[] }> = [
  { image: "/images/neelum.png", aliases: ["neelum", "azad kashmir", "ajk"] },
  { image: "/images/fairy-meadows.png", aliases: ["fairy", "fairy meadows", "nanga parbat", "beyal"] },
  { image: "/images/hunza.png", aliases: ["hunza", "karimabad", "altit", "baltit", "attabad", "passu", "khunjerab"] },
  { image: "/images/malam-jabba.png", aliases: ["malam", "malam jabba", "ski", "snow"] },
  { image: "/images/naran.png", aliases: ["naran", "kaghan", "saif", "babusar", "shogran"] },
  { image: "/images/murree.png", aliases: ["murree", "nathia", "nathia gali", "nathiagali", "ayubia", "patriata"] },
];

export function getDefaultTourImage(destination?: string | null, title?: string | null) {
  const searchText = `${destination || ""} ${title || ""}`.toLowerCase();
  return TOUR_IMAGE_ALIASES.find(item => item.aliases.some(alias => searchText.includes(alias)))?.image || DEFAULT_TOUR_IMAGE;
}

export function getTourImage(tour: { image_url?: string | null; image?: string | null; destination?: string | null; title?: string | null }) {
  return tour.image_url || tour.image || getDefaultTourImage(tour.destination, tour.title);
}
