export interface Track {
  filePath: string;
  fileName: string;
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string[];
  duration?: number;
  bpm?: number;
  key?: string;
  picture?: string; // Base64 data URI
}

export interface MusicFolder {
  name: string;
  path: string;
  trackCount: number;
  tracks: Track[];
  avgBpm?: number;
  dominantKey?: string;
}

export interface MixRecommendation {
  track: Track;
  reason: string;
  compatibilityScore: number;
}
