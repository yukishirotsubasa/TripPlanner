/** 單一景點 */
export interface Spot {
  id: string;
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  durationMins: number;
}

/** 單日行程 */
export interface DayPlan {
  id: string;
  date: string;
  spots: Spot[];
}

/** 完整行程表 */
export interface Itinerary {
  id: string;
  title: string;
  days: DayPlan[];
}
