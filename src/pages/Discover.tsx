import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Heart } from "lucide-react";
import MovieCard from "@/components/shared/MovieCard";
import { mockMovies, Movie } from "@/data/mockMovies";
import { searchMovies, AppMovie, setOmdbApiKeyRuntime } from "@/lib/omdb";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [favoriteMovies, setFavoriteMovies] = useState<string[]>([]);
  const [remoteMovies, setRemoteMovies] = useState<AppMovie[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("cinecrush:favorites");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavoriteMovies(parsed);
      }
    } catch {}
  }, []);

  // Persist favorites when changed
  useEffect(() => {
    try {
      localStorage.setItem("cinecrush:favorites", JSON.stringify(favoriteMovies));
    } catch {}
  }, [favoriteMovies]);

  // Persist API key from env if present
  useEffect(() => {
    const envKey = (import.meta as any).env?.VITE_OMDB_API_KEY as string | undefined;
    if (envKey) {
      try { setOmdbApiKeyRuntime(envKey); } catch {}
    }
  }, []);

  // Search OMDb when query changes
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setRemoteMovies(null);
      return;
    }
    let active = true;
    setIsSearching(true);
    searchMovies(q, 18)
      .then((res) => {
        if (!active) return;
        setRemoteMovies(res);
      })
      .catch(() => {
        if (!active) return;
        setRemoteMovies([]);
      })
      .finally(() => {
        if (!active) return;
        setIsSearching(false);
      });
    return () => { active = false; };
  }, [searchQuery]);

  // Get all unique genres
  const allGenres = Array.from(
    new Set(mockMovies.flatMap(movie => movie.genre))
  ).sort();

  // Choose source: OMDb results if searching, else mock
  const sourceMovies: (Movie | AppMovie)[] = remoteMovies && searchQuery.trim()
    ? remoteMovies
    : mockMovies;

  // Filter and sort movies
  const filteredMovies = sourceMovies
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           movie.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGenre = selectedGenre === "all" || movie.genre.includes(selectedGenre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "year":
          return b.year - a.year;
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const toggleFavorite = (movieId: string) => {
    setFavoriteMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Discover Movies</h1>
          <p className="text-xl text-muted-foreground">
            Find your next favorite film and add it to your preferences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search movies by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-6"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || selectedGenre !== "all") && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("all");
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* My Favorites Count */}
          {favoriteMovies.length > 0 && (
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 text-neon-red fill-current" />
              <span className="text-sm">
                {favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''} in your favorites
              </span>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {isSearching ? "Searching OMDb…" : `Showing ${filteredMovies.length} movie${filteredMovies.length !== 1 ? 's' : ''}`}
            {selectedGenre !== "all" && ` in ${selectedGenre}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                showFavoriteButton={!(remoteMovies && searchQuery.trim())}
                isFavorite={favoriteMovies.includes(movie.id)}
                onToggleFavorite={() => {
                  if (remoteMovies && searchQuery.trim()) return;
                  toggleFavorite(movie.id);
                }}
                onClick={() => {
                  // Could open movie details modal here
                  console.log("Movie clicked:", movie.title);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-2xl font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find more results.
            </p>
            <Button 
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("all");
              }}
            >
              Show All Movies
            </Button>
          </div>
        )}

        {/* Popular Genres */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Popular Genres</h2>
          <div className="flex flex-wrap gap-2">
            {allGenres.map(genre => {
              const count = mockMovies.filter(movie => movie.genre.includes(genre)).length;
              return (
                <Badge
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => setSelectedGenre(genre)}
                >
                  {genre} ({count})
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;