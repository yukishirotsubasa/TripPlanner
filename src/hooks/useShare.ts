import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { compressItinerary, decompressItinerary } from "../utils/compression";
import type { Itinerary } from "../types";

/**
 * 解析 URL 中的 ?data= 參數。若存在且有效則回傳解壓後的行程，
 * 並且將 URL 的參數清除，以便後續變更不會一直被舊的 URL 重設。
 */
export function useShare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sharedItinerary, setSharedItinerary] = useState<Itinerary | null>(null);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const parsed = decompressItinerary(data);
      if (parsed) {
        setSharedItinerary(parsed);
        // 清除 query string (使用 replaceHistory API 不留歷史紀錄)
        setSearchParams({}, { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在掛載時執行一次

  /** 產生分享連結 */
  function generateShareUrl(itinerary: Itinerary): string {
    const compressed = compressItinerary(itinerary);
    const base = window.location.origin + window.location.pathname;
    return `${base}?data=${compressed}`;
  }

  return { sharedItinerary, generateShareUrl };
}
