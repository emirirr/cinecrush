export type OmdbSearchItem = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type?: string;
};

export type OmdbMovieDetail = {
  imdbID: string;
  Title: string;
  Year: string;
  Genre: string; // comma separated
  imdbRating: string; // e.g., "7.8"
  Poster: string;
  Plot?: string;
  Type?: string;
};

export type AppMovie = {
  id: string;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  description?: string;
};

const API_BASE = "https://www.omdbapi.com/";
const DEFAULT_KEY = "3e6622c9";

function getApiKey(): string {
  // Priority: env var -> localStorage override -> default key
  const envKey = (import.meta as any).env?.VITE_OMDB_API_KEY as string | undefined;
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("cinecrush:omdbKey") : null;
    if (stored) return stored;
  } catch {}
  return envKey || DEFAULT_KEY;
}

function toAppMovie(detail: OmdbMovieDetail): AppMovie {
  const genres = detail.Genre ? detail.Genre.split(",").map(g => g.trim()).filter(Boolean) : [];
  const yearMatch = /\d{4}/.exec(detail.Year);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 0;
  const rating = detail.imdbRating && detail.imdbRating !== "N/A" ? parseFloat(detail.imdbRating) : 0;
  return {
    id: detail.imdbID,
    title: detail.Title,
    year,
    genre: genres,
    rating: isFinite(rating) ? rating : 0,
    poster: detail.Poster && detail.Poster !== "N/A" ? detail.Poster : "/placeholder.svg",
    description: detail.Plot || undefined,
  };
}

export async function getMovieByImdbId(imdbId: string): Promise<AppMovie | null> {
  const key = getApiKey();
  const url = `${API_BASE}?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(key)}&plot=short`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as any;
  if (json?.Response === "False") return null;
  return toAppMovie(json as OmdbMovieDetail);
}

export async function searchMovies(query: string, limit = 18): Promise<AppMovie[]> {
  const key = getApiKey();
  const url = `${API_BASE}?s=${encodeURIComponent(query)}&type=movie&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as any;
  if (json?.Response === "False" || !Array.isArray(json?.Search)) return [];
  const items = (json.Search as OmdbSearchItem[]).slice(0, limit);
  // Fetch details to obtain genres and ratings
  const details = await Promise.all(
    items.map(i => getMovieByImdbId(i.imdbID).catch(() => null))
  );
  return details.filter(Boolean) as AppMovie[];
}

export function setOmdbApiKeyRuntime(key: string) {
  try {
    localStorage.setItem("cinecrush:omdbKey", key);
  } catch {}
}


