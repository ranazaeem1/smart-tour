import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_DESTINATION_ID,
  getDestinationById,
  NORTHERN_PAKISTAN_DESTINATIONS,
} from "@/lib/northern-pakistan-destinations";
import { fetchDestinationSafetyIntel, toSafetyZoneSnapshot } from "@/lib/safety-intelligence";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const destinationId =
    request.nextUrl.searchParams.get("destination") || DEFAULT_DESTINATION_ID;
  const all = request.nextUrl.searchParams.get("all") === "true";

  try {
    if (all) {
      const results = await Promise.all(
        NORTHERN_PAKISTAN_DESTINATIONS.map((d) => fetchDestinationSafetyIntel(d))
      );
      return NextResponse.json({
        destinations: results.map((intel) => ({
          id: intel.destination.id,
          zone: toSafetyZoneSnapshot(intel),
          intel,
        })),
        lastUpdated: new Date().toISOString(),
      });
    }

    const destination = getDestinationById(destinationId);
    if (!destination) {
      return NextResponse.json({ error: "Unknown destination" }, { status: 404 });
    }

    const intel = await fetchDestinationSafetyIntel(destination);
    return NextResponse.json({
      intel,
      zone: toSafetyZoneSnapshot(intel),
      destinations: NORTHERN_PAKISTAN_DESTINATIONS.map((d) => ({
        id: d.id,
        name: d.name,
        region: d.region,
      })),
    });
  } catch (error) {
    console.error("[safety/intelligence]", error);
    return NextResponse.json(
      { error: "Failed to load safety intelligence" },
      { status: 500 }
    );
  }
}
