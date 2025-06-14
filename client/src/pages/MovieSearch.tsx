import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Search, Star, Heart, LogOut, User } from "lucide-react";
import { authApi } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface SearchResponse {
  results: Movie[];
  total_results: number;
  total_pages: number;
}

export default function MovieSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { toast } = useToast();
  const user = authApi.getUser();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search movies
  const { data: searchResults, isLoading } = useQuery<SearchResponse>({
    queryKey: ["/api/movies/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [], total_results: 0, total_pages: 0 };
      
      const response = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to search movies");
      }
      return response.json();
    },
    enabled: !!debouncedQuery.trim(),
  });

  // Get saved movies
  const { data: savedMovies } = useQuery({
    queryKey: ["/api/movies/saved"],
    queryFn: async () => {
      if (!authApi.isAuthenticated()) return [];
      
      const response = await fetch("/api/movies/saved", {
        headers: {
          'Authorization': `Bearer ${authApi.getToken()}`
        }
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: authApi.isAuthenticated(),
  });

  // Save movie mutation
  const saveMovieMutation = useMutation({
    mutationFn: async (movie: Movie) => {
      if (!authApi.isAuthenticated()) {
        throw new Error("Please login to save movies");
      }
      
      const response = await fetch("/api/movies/save", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authApi.getToken()}`
        },
        body: JSON.stringify({
          movieId: movie.id.toString(),
          title: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
          overview: movie.overview,
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save movie');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies/saved"] });
      toast({
        title: "Movie saved!",
        description: "Added to your favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save movie",
        variant: "destructive",
      });
    }
  });

  // Remove movie mutation
  const removeMovieMutation = useMutation({
    mutationFn: async (movieId: string) => {
      const response = await fetch(`/api/movies/saved/${movieId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${authApi.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove movie');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/movies/saved"] });
      toast({
        title: "Movie removed",
        description: "Removed from your favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove movie",
        variant: "destructive",
      });
    }
  });

  const handleLogout = () => {
    authApi.logout();
    setLocation("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const isMovieSaved = (movieId: number) => {
    return savedMovies?.some((saved: any) => saved.movieId === movieId.toString());
  };

  const handleSaveToggle = (movie: Movie) => {
    if (isMovieSaved(movie.id)) {
      removeMovieMutation.mutate(movie.id.toString());
    } else {
      saveMovieMutation.mutate(movie);
    }
  };

  const getImageUrl = (posterPath: string | null) => {
    return posterPath 
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "https://via.placeholder.com/500x750?text=No+Image";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Film className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">MovieApp</span>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Discover Movies</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg h-12"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching movies...</p>
          </div>
        )}

        {searchResults && searchResults.results.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.total_results} movies found)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.results.map((movie) => (
                <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    {user && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={() => handleSaveToggle(movie)}
                        disabled={saveMovieMutation.isPending || removeMovieMutation.isPending}
                      >
                        <Heart 
                          className={`h-4 w-4 ${
                            isMovieSaved(movie.id) 
                              ? 'fill-red-500 text-red-500' 
                              : 'text-gray-600'
                          }`} 
                        />
                      </Button>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    {movie.overview && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                        {movie.overview}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {searchResults && searchResults.results.length === 0 && debouncedQuery && (
          <div className="text-center py-8">
            <p className="text-gray-600">No movies found for "{debouncedQuery}"</p>
            <p className="text-sm text-gray-500 mt-1">Try different keywords or check your spelling</p>
          </div>
        )}

        {/* Saved Movies Section */}
        {user && savedMovies && savedMovies.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Saved Movies ({savedMovies.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {savedMovies.map((movie: any) => (
                <Card key={movie.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[2/3] relative">
                    <img
                      src={getImageUrl(movie.posterPath)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      onClick={() => removeMovieMutation.mutate(movie.movieId)}
                      disabled={removeMovieMutation.isPending}
                    >
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                      {movie.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{movie.rating}/10</span>
                        </div>
                      )}
                    </div>
                    {movie.overview && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                        {movie.overview}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Get Started Message */}
        {!debouncedQuery && (!savedMovies || savedMovies.length === 0) && (
          <div className="text-center py-12">
            <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Discovering Movies</h3>
            <p className="text-gray-600 mb-6">
              Search for your favorite movies and {user ? 'save them to your collection' : 'create an account to save your favorites'}
            </p>
            {!user && (
              <div className="flex justify-center space-x-4">
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700">Create Account</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}