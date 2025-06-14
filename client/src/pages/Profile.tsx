import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Star, Calendar, List, Trash2, Plus, Eye } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface Movie {
  id: string;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface Watchlist {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  movieCount: number;
}

interface ProfileData {
  user: {
    id: number;
    username: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
  favorites: Movie[];
  watchlists: Watchlist[];
  stats: {
    favoriteCount: number;
    watchlistCount: number;
  };
}

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWatchlist, setNewWatchlist] = useState({
    name: "",
    description: "",
    is_public: false
  });

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/user/profile"],
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (movieId: string) => {
      const response = await fetch(`/api/movies/saved/${movieId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Removed from favorites",
        description: "Movie removed from your favorites list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove movie from favorites.",
        variant: "destructive",
      });
    },
  });

  const createWatchlistMutation = useMutation({
    mutationFn: async (data: typeof newWatchlist) => {
      const response = await fetch("/api/watchlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create watchlist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      setShowCreateDialog(false);
      setNewWatchlist({ name: "", description: "", is_public: false });
      toast({
        title: "Watchlist created",
        description: "Your new watchlist has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create watchlist.",
        variant: "destructive",
      });
    },
  });

  const deleteWatchlistMutation = useMutation({
    mutationFn: async (watchlistId: number) => {
      const response = await fetch(`/api/watchlists/${watchlistId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete watchlist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/profile"] });
      toast({
        title: "Watchlist deleted",
        description: "Your watchlist has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete watchlist.",
        variant: "destructive",
      });
    },
  });

  const handleCreateWatchlist = () => {
    if (!newWatchlist.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a watchlist name.",
        variant: "destructive",
      });
      return;
    }
    createWatchlistMutation.mutate(newWatchlist);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load profile data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile.user.name || profile.user.username}!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.stats.favoriteCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlists</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.stats.watchlistCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(profile.user.createdAt).getFullYear()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
              <p className="text-sm">{profile.user.name || "Not provided"}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Username</Label>
              <p className="text-sm">{profile.user.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <p className="text-sm">{profile.user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Joined</Label>
              <p className="text-sm">{new Date(profile.user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watchlists */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              My Watchlists
            </CardTitle>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Watchlist
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Watchlist</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newWatchlist.name}
                      onChange={(e) => setNewWatchlist({ ...newWatchlist, name: e.target.value })}
                      placeholder="Enter watchlist name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newWatchlist.description}
                      onChange={(e) => setNewWatchlist({ ...newWatchlist, description: e.target.value })}
                      placeholder="Enter watchlist description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="public"
                      checked={newWatchlist.is_public}
                      onCheckedChange={(checked) => setNewWatchlist({ ...newWatchlist, is_public: checked })}
                    />
                    <Label htmlFor="public">Make this watchlist public</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateWatchlist} disabled={createWatchlistMutation.isPending}>
                      {createWatchlistMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {profile.watchlists.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No watchlists yet. Create your first watchlist to organize your movies!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {profile.watchlists.map((watchlist) => (
                <Card key={watchlist.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{watchlist.name}</CardTitle>
                        {watchlist.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {watchlist.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWatchlistMutation.mutate(watchlist.id)}
                        disabled={deleteWatchlistMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {watchlist.movieCount} movies
                        </Badge>
                        {watchlist.is_public && (
                          <Badge variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Favorite Movies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Favorite Movies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.favorites.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No favorite movies yet. Start exploring and save movies you love!
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profile.favorites.map((movie) => (
                <Card key={movie.id} className="overflow-hidden">
                  <div className="aspect-[2/3] relative">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground">No poster</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-2">{movie.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavoriteMutation.mutate(movie.id)}
                        disabled={removeFavoriteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}