import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, Star } from "lucide-react";
import { getMoviesByIds, getSharedMovies } from "@/data/mockMovies";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

type MatchUser = {
  id: string;
  name: string;
  age?: number | string;
  bio?: string;
  avatar?: string;
  favoriteMovies?: string[];
  location?: string;
};

const Matches = () => {
  const [userMatches, setUserMatches] = useState<MatchUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  let currentUserMovies: string[] = [];
  try {
    const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
    if (Array.isArray(fav)) currentUserMovies = fav;
  } catch {}

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const liked = (JSON.parse(localStorage.getItem("cinecrush:matches") || "[]") as string[]) || [];
        if (liked.length === 0) {
          if (mounted) {
            setUserMatches([]);
          }
          return;
        }
        const snap = await getDocs(collection(db, "profiles"));
        const users: MatchUser[] = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data?.name || "",
            age: data?.age,
            bio: data?.bio || "",
            avatar: data?.avatar || "",
            favoriteMovies: Array.isArray(data?.favoriteMovies) ? data.favoriteMovies : [],
            location: data?.location || "",
          } as MatchUser;
        });
        const filtered = users.filter(u => liked.includes(u.id));
        if (mounted) setUserMatches(filtered.slice(0, 10));
      } catch {
        if (mounted) setUserMatches([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">💫</div>
          <h2 className="text-2xl font-bold mb-2">Loading matches…</h2>
          <p className="text-muted-foreground mb-6">Fetching your connections</p>
        </div>
      </div>
    );
  }

  if (userMatches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">💫</div>
          <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
          <p className="text-muted-foreground mb-6">
            Start swiping to find people who share your movie taste!
          </p>
          <Link to="/swipe">
            <Button className="btn-neon">Start Swiping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Your Matches</h1>
          <p className="text-xl text-muted-foreground">
            People who share your passion for cinema
          </p>
        </div>

        {/* Matches Grid */}
        <div className="space-y-6">
          {userMatches.map((match) => {
            const theirFavorites = match.favoriteMovies || [];
            const sharedMovieIds = getSharedMovies(currentUserMovies, theirFavorites);
            const sharedMovies = getMoviesByIds(sharedMovieIds);
            const matchUserMovies = getMoviesByIds(theirFavorites);

            return (
              <Card key={match.id} className="card-movie">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Section */}
                    <div className="flex items-center space-x-4 md:w-1/3">
                      <img
                        src={match.avatar || "/placeholder.svg"}
                        alt={match.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-semibold">{match.name}</h3>
                          <Badge className="bg-primary/20 text-primary">
                            {Math.round((sharedMovieIds.length / Math.max(currentUserMovies.length, theirFavorites.length || 1)) * 100)}% Match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{match.age} • {match.location}</p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Matched 2 days ago</span>
                        </div>
                      </div>
                    </div>

                    {/* Movies Section */}
                    <div className="md:w-2/3">
                      {/* Shared Movies */}
                      {sharedMovies.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center text-neon-red">
                            <Heart className="h-4 w-4 mr-1 fill-current" />
                            Movies in Common ({sharedMovies.length})
                          </h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {sharedMovies.map((movie) => (
                              <div key={movie.id} className="flex-shrink-0 relative">
                                <img
                                  src={movie.poster}
                                  alt={movie.title}
                                  className="w-16 h-24 object-cover rounded-lg"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-1 rounded-b-lg">
                                  <div className="flex items-center">
                                    <Star className="h-2 w-2 text-yellow-400 fill-current mr-1" />
                                    <span>{movie.rating}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Their Movies */}
                      <div>
                        <h4 className="font-semibold mb-2">Their Favorites</h4>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {matchUserMovies.slice(0, 4).map((movie) => (
                            <div key={movie.id} className="flex-shrink-0 text-center">
                              <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-12 h-18 object-cover rounded-lg"
                              />
                              <p className="text-xs mt-1 truncate w-12">{movie.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground italic mb-4">
                      "{match.bio}"
                    </p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button className="btn-neon flex-1" onClick={() => navigate(`/chat?u=${match.id}`)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline" className="border-neon" onClick={() => navigate(`/user/${match.id}`)}>
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-600/10 to-pink-500/10 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Want more matches?</h3>
          <p className="text-muted-foreground mb-4">
            Keep swiping to find more movie lovers in your area
          </p>
          <Link to="/swipe">
            <Button className="btn-neon">
              <Heart className="h-4 w-4 mr-2" />
              Continue Swiping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Matches;