import { Badge } from "@/components/ui/badge";
import { Star, Heart, Play } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  description?: string;
}

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  size?: "sm" | "md" | "lg";
}

const MovieCard = ({ 
  movie, 
  onClick, 
  showFavoriteButton = false, 
  isFavorite = false, 
  onToggleFavorite,
  size = "md" 
}: MovieCardProps) => {
  const sizeClasses = {
    sm: "w-32 h-48",
    md: "w-40 h-60", 
    lg: "w-48 h-72"
  };

  return (
    <div 
      className={`card-movie group cursor-pointer ${sizeClasses[size]}`}
      onClick={onClick}
    >
      <div className="relative h-full">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-primary/20 backdrop-blur-sm rounded-full p-4 border border-primary/30">
            <Play className="h-6 w-6 text-primary fill-current" />
          </div>
        </div>

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white truncate">
                {movie.title}
              </h3>
              {showFavoriteButton && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                  className="text-white hover:text-neon-red transition-colors"
                >
                  <Heart 
                    className={`h-4 w-4 ${isFavorite ? 'fill-current text-neon-red' : ''}`} 
                  />
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300">{movie.year}</span>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                <span className="text-gray-300">{movie.rating.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {movie.genre.slice(0, 2).map((g) => (
                <Badge 
                  key={g} 
                  variant="secondary" 
                  className="text-xs px-1 py-0 bg-primary/20 text-primary border-primary/30"
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;