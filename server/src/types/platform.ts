export interface PlatformStats {
  platform?: string;
  username?: string;
  solvedCount: number;
  rating?: number;
  maxRating?: number;
  tier?: string | null;
  contributions?: number;
  activityData?: { date: string; count: number }[] | null;
}
