import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Search, Star, Users, User, LogOut } from "lucide-react";
import { authApi } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [user, setUser] = useState(authApi.getUser());
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authApi.getUser());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MovieApp</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/search">
                <Button variant="ghost">Search Movies</Button>
              </Link>
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <Button variant="ghost">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Your Next
            <span className="text-blue-600 block">Favorite Movie</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Search millions of movies, read reviews, save your favorites, and create personalized watchlists. 
            Your ultimate movie companion starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Start Searching
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                Create Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Advanced Search</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Search through millions of movies with powerful filters. Find exactly what you're looking for.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Save Favorites</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Create personalized watchlists and save your favorite movies. Never forget a great recommendation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Share & Discover</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                Rate movies, write reviews, and discover what others are watching. Join the community.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Movie Journey?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of movie lovers who trust MovieApp to discover their next favorite film.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-3">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}