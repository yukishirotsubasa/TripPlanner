import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { Itinerary } from "../types";

/** 將行程壓縮為 URL-safe 字串 */
export function compressItinerary(itinerary: Itinerary): string {
  return compressToEncodedURIComponent(JSON.stringify(itinerary));
}

/** 從壓縮字串還原行程，失敗回傳 null */
export function decompressItinerary(encoded: string): Itinerary | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as Itinerary;
  } catch {
    return null;
  }
}
