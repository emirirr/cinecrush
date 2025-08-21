import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ChevronLeft } from "lucide-react";
import { getMovieByImdbId, AppMovie } from "@/lib/omdb";
import { getMovieById as getMockById } from "@/data/mockMovies";

function isImdbId(id: string) {
  return /^tt\d+$/i.test(id);
}

const MovieDetail = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<AppMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
      if (Array.isArray(fav)) setIsFavorite(fav.includes(id));
    } catch {}
  }, [id]);

  const toggleFavorite = () => {
    try {
      const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
      const next = Array.isArray(fav)
        ? (fav.includes(id) ? fav.filter((x: string) => x !== id) : [...fav, id])
        : [id];
      localStorage.setItem("cinecrush:favorites", JSON.stringify(next));
      setIsFavorite(next.includes(id));
    } catch {}
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!id) { setMovie(null); return; }
        if (isImdbId(id)) {
          const m = await getMovieByImdbId(id);
          if (active) setMovie(m);
        } else {
          const mock = getMockById(id as any);
          if (active) setMovie(mock as unknown as AppMovie || null);
        }
      } catch {
        if (active) setMovie(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Loading movie…</h2>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Movie not found</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-4 mb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">{movie.title}</h1>
        </div>

        <Card className="card-movie">
          <CardContent className="p-0 md:p-6">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img src={movie.poster} alt={movie.title} className="w-full aspect-[2/3] object-cover md:rounded-lg" />
              </div>
              <div className="p-4 md:p-0 md:w-2/3 md:pl-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{movie.year}</Badge>
                  {movie.genre.slice(0, 3).map((g) => (
                    <Badge key={g} variant="outline">{g}</Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{movie.rating}</span>
                </div>
                {movie.description && (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{movie.description}</p>
                )}

                <div className="mt-6 flex gap-3">
                  <Button className="btn-neon" onClick={toggleFavorite}>
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`https://www.imdb.com/title/${isImdbId(id) ? id : ''}`, '_blank')}>IMDB</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MovieDetail;


