import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { Itinerary } from "../types";

/** 將行程壓縮為 URL-safe 字串 */
export function compressItinerary(itinerary: Itinerary): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { title, ...rest } = itinerary;
  return compressToEncodedURIComponent(JSON.stringify(rest));
}

/** 從壓縮字串還原行程，失敗回傳 null */
export function decompressItinerary(encoded: string): Itinerary | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    return {
      title: "分享的行程", // 如果壓縮時移除了名稱，顯示此預覽名稱
      ...parsed,
    } as Itinerary;
  } catch {
    return null;
  }
}
