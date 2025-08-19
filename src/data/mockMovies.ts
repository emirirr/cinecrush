export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string[];
  rating: number;
  poster: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  avatar: string;
  favoriteMovies: string[];
  location: string;
}

export const mockMovies: Movie[] = [
  {
    id: "1",
    title: "Inception",
    year: 2010,
    genre: ["Sci-Fi", "Thriller", "Action"],
    rating: 8.8,
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
  },
  {
    id: "2", 
    title: "Pulp Fiction",
    year: 1994,
    genre: ["Crime", "Drama"],
    rating: 8.9,
    poster: "https://images.unsplash.com/photo-1489599808821-a6b2c9da9939?w=400&h=600&fit=crop",
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption."
  },
  {
    id: "3",
    title: "The Dark Knight", 
    year: 2008,
    genre: ["Action", "Crime", "Drama"],
    rating: 9.0,
    poster: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop",
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests."
  },
  {
    id: "4",
    title: "Interstellar",
    year: 2014,
    genre: ["Sci-Fi", "Drama", "Adventure"],
    rating: 8.6,
    poster: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=600&fit=crop",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."
  },
  {
    id: "5",
    title: "La La Land",
    year: 2016,
    genre: ["Romance", "Musical", "Drama"],
    rating: 8.0,
    poster: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=600&fit=crop",
    description: "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future."
  },
  {
    id: "6",
    title: "Blade Runner 2049",
    year: 2017,
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.0,
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    description: "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard."
  },
  {
    id: "7",
    title: "Casablanca",
    year: 1942,
    genre: ["Romance", "Drama", "War"],
    rating: 8.5,
    poster: "https://images.unsplash.com/photo-1489599808821-a6b2c9da9939?w=400&h=600&fit=crop",
    description: "A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape."
  },
  {
    id: "8",
    title: "Parasite",
    year: 2019,
    genre: ["Thriller", "Drama", "Comedy"],
    rating: 8.6,
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&h=600&fit=crop",
    description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
  }
];

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Emma",
    age: 26,
    bio: "Film student who loves indie cinema and Christopher Nolan films. Always down for a movie marathon! 🎬",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b988?w=400&h=400&fit=crop&crop=face",
    favoriteMovies: ["1", "3", "4", "6"],
    location: "Los Angeles, CA"
  },
  {
    id: "2", 
    name: "Jake",
    age: 29,
    bio: "Cinephile and film critic. I believe every great relationship starts with arguing about whether Die Hard is a Christmas movie.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    favoriteMovies: ["2", "3", "7", "8"],
    location: "New York, NY"
  },
  {
    id: "3",
    name: "Sofia",
    age: 24,
    bio: "Rom-com enthusiast who secretly loves sci-fi. Looking for someone to debate plot holes with over coffee ☕",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    favoriteMovies: ["1", "4", "5", "8"],
    location: "San Francisco, CA"
  },
  {
    id: "4",
    name: "Marcus",
    age: 31,
    bio: "Documentary filmmaker with a passion for classic cinema. Can quote Casablanca word for word.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face", 
    favoriteMovies: ["2", "6", "7", "8"],
    location: "Chicago, IL"
  },
  {
    id: "5",
    name: "Lily",
    age: 27,
    bio: "Aspiring screenwriter who believes the best stories make you feel something. Marvel fan but don't hold it against me 😄",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    favoriteMovies: ["1", "3", "5", "6"],
    location: "Austin, TX"
  }
];

export const getMovieById = (id: string): Movie | undefined => {
  return mockMovies.find(movie => movie.id === id);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getMoviesByIds = (ids: string[]): Movie[] => {
  return ids.map(id => getMovieById(id)).filter(Boolean) as Movie[];
};

export const getSharedMovies = (user1Movies: string[], user2Movies: string[]): string[] => {
  return user1Movies.filter(movieId => user2Movies.includes(movieId));
};

export const calculateMatchScore = (user1Movies: string[], user2Movies: string[]): number => {
  const sharedMovies = getSharedMovies(user1Movies, user2Movies);
  const totalUniqueMovies = new Set([...user1Movies, ...user2Movies]).size;
  return Math.round((sharedMovies.length / totalUniqueMovies) * 100);
};