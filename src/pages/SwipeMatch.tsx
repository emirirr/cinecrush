import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, Star } from "lucide-react";
import { getMoviesByIds, getSharedMovies, calculateMatchScore } from "@/data/mockMovies";
import MovieCard from "@/components/shared/MovieCard";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { getMovieByImdbId, AppMovie } from "@/lib/omdb";

type SwipeUser = {
  id: string;
  name: string;
  age?: number | string;
  bio?: string;
  avatar?: string;
  favoriteMovies?: string[];
  location?: string;
};

const SwipeMatch = () => {
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [likedUsers, setLikedUsers] = useState<string[]>([]);
  const [passedUsers, setPassedUsers] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [newMatchUser, setNewMatchUser] = useState<SwipeUser | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<SwipeUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [includeSelfForDebug, setIncludeSelfForDebug] = useState<boolean>(false);
  const [displayMovies, setDisplayMovies] = useState<AppMovie[]>([]);

  // Current user's favorite movies
  let currentUserMovies: string[] = [];
  try {
    const fav = JSON.parse(localStorage.getItem("cinecrush:favorites") || "[]");
    if (Array.isArray(fav)) currentUserMovies = fav;
  } catch {}

  // Load real users from Firestore profiles (real-time)
  useEffect(() => {
    setIsLoading(true);
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const users: SwipeUser[] = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: (data?.name || data?.displayName || "User").toString(),
          age: data?.age,
          bio: data?.bio || "",
          avatar: data?.avatar || "",
          favoriteMovies: Array.isArray(data?.favoriteMovies) ? data.favoriteMovies : [],
          location: data?.location || "",
        } as SwipeUser;
      });
      setRemoteUsers(users);
      setIsLoading(false);
    }, () => {
      setRemoteUsers([]);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const uid = auth.currentUser?.uid;
  const baseUsers = includeSelfForDebug ? remoteUsers : remoteUsers.filter(u => u.id !== uid);
  const availableUsers = baseUsers.filter(user => 
    !likedUsers.includes(user.id) && 
    !passedUsers.includes(user.id)
  );

  const currentUser = availableUsers[currentUserIndex];

  // Resolve their favorite movies using mock first, then OMDb for unknown ids
  useEffect(() => {
    let active = true;
    const theirFavs: string[] = Array.isArray(currentUser?.favoriteMovies)
      ? (currentUser!.favoriteMovies as string[])
      : [];
    const resolve = async () => {
      try {
        const mock = getMoviesByIds(theirFavs);
        const mockIds = new Set(mock.map(m => m.id));
        const remain = Math.max(0, 6 - mock.length);
        const unknown = theirFavs.filter(id => !mockIds.has(id)).slice(0, remain);
        const fromOmdb = await Promise.all(
          unknown.map(id => getMovieByImdbId(id).catch(() => null))
        );
        const omdbMovies = (fromOmdb.filter(Boolean) as AppMovie[]).slice(0, remain);
        const combined: AppMovie[] = [...(mock as any[]), ...omdbMovies].slice(0, 6);
        if (active) setDisplayMovies(combined as AppMovie[]);
      } catch {
        if (active) setDisplayMovies([]);
      }
    };
    resolve();
    return () => { active = false; };
  }, [currentUser?.id, JSON.stringify(currentUser?.favoriteMovies || [])]);

  const handleLike = () => {
    if (!currentUser) return;

    const newLikedUsers = [...likedUsers, currentUser.id];
    setLikedUsers(newLikedUsers);

    // Simulate match (in real app, check if other user also liked)
    const isMatch = Math.random() > 0.6; // demo
    if (isMatch) {
      setMatches([...matches, currentUser.id]);
      setNewMatchUser(currentUser);
      setShowMatch(true);
    }

    nextUser();
  };
  // Load persisted swipe state
  useEffect(() => {
    try {
      const liked = JSON.parse(localStorage.getItem("cinecrush:liked") || "[]");
      const passed = JSON.parse(localStorage.getItem("cinecrush:passed") || "[]");
      const ms = JSON.parse(localStorage.getItem("cinecrush:matches") || "[]");
      if (Array.isArray(liked)) setLikedUsers(liked);
      if (Array.isArray(passed)) setPassedUsers(passed);
      if (Array.isArray(ms)) setMatches(ms);
    } catch {}
  }, []);

  // Persist swipe state
  useEffect(() => {
    try {
      localStorage.setItem("cinecrush:liked", JSON.stringify(likedUsers));
      localStorage.setItem("cinecrush:passed", JSON.stringify(passedUsers));
      localStorage.setItem("cinecrush:matches", JSON.stringify(matches));
    } catch {}
  }, [likedUsers, passedUsers, matches]);

  const handlePass = () => {
    if (!currentUser) return;
    setPassedUsers([...passedUsers, currentUser.id]);
    nextUser();
  };

  const nextUser = () => {
    if (currentUserIndex < availableUsers.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      setCurrentUserIndex(0); // Reset for demo
    }
  };

  const closeMatchModal = () => {
    setShowMatch(false);
    setNewMatchUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">Loading users…</h2>
          <p className="text-muted-foreground mb-6">Fetching nearby cinephiles</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h2 className="text-2xl font-bold mb-2">No more users nearby</h2>
          <p className="text-muted-foreground mb-6">
            Check back later for more movie lovers to discover!
          </p>
          <Button onClick={() => {
            setCurrentUserIndex(0);
            setLikedUsers([]);
            setPassedUsers([]);
          }}>
            Start Over
          </Button>
          <div className="mt-4">
            <Button variant="outline" onClick={() => setIncludeSelfForDebug(v => !v)}>
              {includeSelfForDebug ? 'Hide Myself' : 'Show Myself (Test)'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const theirFavorites = currentUser.favoriteMovies || [];
  const sharedMovieIds = getSharedMovies(currentUserMovies, theirFavorites);
  const sharedMovies = getMoviesByIds(sharedMovieIds);
  const denominator = new Set([...(currentUserMovies || []), ...(theirFavorites || [])]).size;
  const matchScore = denominator > 0 ? calculateMatchScore(currentUserMovies, theirFavorites) : 0;

  

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Discover Movie Lovers</h1>
          <p className="text-muted-foreground">
            Swipe right if you'd like to connect!
          </p>
        </div>

        {/* User Card */}
        <div className="swipe-card mb-6" style={{ height: '600px' }}>
          <div className="relative h-full">
            {/* User Image */}
            <div 
              className="h-1/2 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${currentUser.avatar || "/placeholder.svg"})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Match Score Badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/90 text-primary-foreground">
                  {matchScore}% Match
                </Badge>
              </div>

              {/* User Info Overlay */}
              <div className="absolute bottom-4 left-4 text-white">
                <h2 className="text-2xl font-bold">{currentUser.name}{currentUser.age ? `, ${currentUser.age}` : ""}</h2>
                <div className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{currentUser.location || ""}</span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="h-1/2 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-sm text-muted-foreground">{currentUser.bio}</p>
                </div>

                {/* Shared Movies */}
                {sharedMovies.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center">
                      <Heart className="h-4 w-4 mr-1 text-neon-red" />
                      Movies in Common ({sharedMovies.length})
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {sharedMovies.map(movie => (
                        <div key={movie.id} className="flex-shrink-0">
                          <MovieCard movie={movie} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Their Favorite Movies */}
                <div>
                  <h3 className="font-semibold mb-2">Their Favorite Movies</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {displayMovies.map(movie => (
                      <div key={movie.id} className="relative">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-xs font-medium text-white">{movie.title}</div>
                            <div className="flex items-center justify-center mt-1">
                              <Star className="h-2 w-2 text-yellow-400 fill-current" />
                              <span className="text-xs text-yellow-400 ml-1">{movie.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="rounded-full w-16 h-16 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-8 w-8" />
          </Button>
          
          <Button
            onClick={handleLike}
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            <Heart className="h-8 w-8 fill-current" />
          </Button>
        </div>

        {/* Stats */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>
            {likedUsers.length} likes • {passedUsers.length} passes • {matches.length} matches
          </p>
        </div>
      </div>

      {/* Match Modal */}
      {showMatch && newMatchUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2 text-neon">It's a Match!</h2>
              <p className="text-muted-foreground mb-6">
                You and {newMatchUser.name} both liked each other's movie taste!
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                <img 
                  src={newMatchUser.avatar || "/placeholder.svg"} 
                  alt={newMatchUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="text-4xl flex items-center">💕</div>
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Button className="w-full btn-neon">
                  Send Message
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={closeMatchModal}
                >
                  Keep Swiping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Users Nearby List */}
      {availableUsers.length > 0 && (
        <div className="max-w-md mx-auto mt-10">
          <h3 className="text-center font-semibold mb-3">Users Nearby</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {availableUsers.slice(0, 12).map((u, idx) => (
              <button
                key={u.id}
                onClick={() => setCurrentUserIndex(idx)}
                className="text-left"
              >
                <img
                  src={u.avatar || "/placeholder.svg"}
                  alt={u.name}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <div className="text-sm font-medium truncate mt-1">{u.name || "User"}</div>
                <div className="text-xs text-muted-foreground truncate">{u.location || ""}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeMatch;