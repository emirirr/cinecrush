import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Heart, Film, Users, MessageCircle, Star, ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";
import MovieCard from "@/components/shared/MovieCard";
import { mockMovies } from "@/data/mockMovies";

const Landing = () => {
  const featuredMovies = mockMovies.slice(0, 6);

  const features = [
    {
      icon: Heart,
      title: "Movie-Based Matching",
      description: "Connect with people who share your passion for cinema"
    },
    {
      icon: Film,
      title: "Discover New Films",
      description: "Explore trending movies and hidden gems from around the world"
    },
    {
      icon: MessageCircle,
      title: "Deep Conversations",
      description: "Start meaningful discussions about your favorite films and directors"
    },
    {
      icon: Users,
      title: "Film Community",
      description: "Join a community of cinema enthusiasts and movie lovers"
    }
  ];

  const testimonials = [
    {
      name: "Emma",
      age: 26,
      text: "Found my perfect movie buddy! We've already planned our next cinema date.",
      movies: ["Inception", "La La Land"]
    },
    {
      name: "Jake", 
      age: 29,
      text: "Finally, someone who appreciates Kubrick as much as I do. Thanks Cinecrush!",
      movies: ["Pulp Fiction", "Casablanca"]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              🎬 Now in Beta
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Find Love Through
              <span className="text-neon block mt-2">Cinema</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Match with fellow movie enthusiasts based on your favorite films. 
              Because the best relationships start with great taste in movies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/auth/register">
              <Button size="lg" className="btn-neon text-lg px-8 py-4">
                <Heart className="mr-2 h-5 w-5" />
                Start Matching
              </Button>
            </Link>
            <Link to="/discover">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Play className="mr-2 h-4 w-4" />
                Explore Movies
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-center">
            <div>
              <div className="text-3xl font-bold text-neon-purple">10K+</div>
              <div className="text-gray-400">Movie Lovers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-red">5K+</div>
              <div className="text-gray-400">Matches Made</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neon-pink">50K+</div>
              <div className="text-gray-400">Movies Rated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Cinecrush?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We believe that shared movie preferences reveal deeper compatibility than any algorithm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-movie border-neon">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Trending Movies</h2>
            <p className="text-xl text-muted-foreground">
              Discover what other movie lovers are talking about
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredMovies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                size="sm"
                showFavoriteButton={true}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/discover">
              <Button size="lg" variant="outline" className="border-neon text-primary">
                Explore All Movies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl text-muted-foreground">
              Real connections made through shared movie love
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-movie">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-lg mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{testimonial.name}, {testimonial.age}</div>
                      <div className="text-sm text-muted-foreground">
                        Loves: {testimonial.movies.join(", ")}
                      </div>
                    </div>
                    <Heart className="h-6 w-6 text-neon-red fill-current" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600/20 to-pink-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Movie Match?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of cinema lovers who've found their perfect match through shared movie tastes.
          </p>
          <Link to="/auth/register">
            <Button size="lg" className="btn-neon text-xl px-12 py-4">
              <Film className="mr-2 h-6 w-6" />
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;