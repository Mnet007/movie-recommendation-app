import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, saveMovieSchema, createWatchlistSchema, addToWatchlistSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; username: string };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid registration data",
          errors: validation.error.errors
        });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validation.data.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      const existingUsername = await storage.getUserByUsername(validation.data.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validation.data.password, 10);
      
      const user = await storage.createUser({
        ...validation.data,
        password: hashedPassword
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({ 
        token, 
        user: { id: user.id, email: user.email, username: user.username } 
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid login data",
          errors: validation.error.errors
        });
      }

      const user = await storage.getUserByEmail(validation.data.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(validation.data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({ 
        token, 
        user: { id: user.id, email: user.email, username: user.username } 
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Movie routes
  app.get("/api/movies/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const genre = req.query.genre as string;
      const year = req.query.year as string;
      const page = req.query.page as string || "1";

      if (!TMDB_API_KEY) {
        return res.status(500).json({ message: "TMDB API key not configured" });
      }

      let url = "";
      let params = new URLSearchParams({
        api_key: TMDB_API_KEY,
        page: page
      });

      // Search by query
      if (query && query.trim()) {
        url = "https://api.themoviedb.org/3/search/movie";
        params.append("query", query);
        if (year) params.append("year", year);
      } 
      // Discover movies by genre/year
      else if (genre || year) {
        url = "https://api.themoviedb.org/3/discover/movie";
        if (genre) params.append("with_genres", genre);
        if (year) params.append("year", year);
        params.append("sort_by", "popularity.desc");
      }
      // Default popular movies
      else {
        url = "https://api.themoviedb.org/3/movie/popular";
      }

      const response = await fetch(`${url}?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch movies from TMDB');
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error searching movies:", error);
      res.status(500).json({ message: "Failed to search movies" });
    }
  });

  // Get movie genres
  app.get("/api/movies/genres", async (req, res) => {
    try {
      if (!TMDB_API_KEY) {
        return res.status(500).json({ message: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch genres from TMDB');
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching genres:", error);
      res.status(500).json({ message: "Failed to fetch genres" });
    }
  });

  app.post("/api/movies/save", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validation = saveMovieSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid movie data",
          errors: validation.error.errors
        });
      }

      // Check if movie is already saved
      const isAlreadySaved = await storage.isMovieSaved(req.user!.id, validation.data.movieId);
      if (isAlreadySaved) {
        return res.status(409).json({ message: "Movie already saved" });
      }

      const savedMovie = await storage.saveMovie({
        ...validation.data,
        userId: req.user!.id
      });

      res.status(201).json(savedMovie);
    } catch (error) {
      console.error("Error saving movie:", error);
      res.status(500).json({ message: "Failed to save movie" });
    }
  });

  app.get("/api/movies/saved", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const listType = req.query.listType as string || "favorites";
      const savedMovies = await storage.getSavedMovies(req.user!.id, listType);
      res.json(savedMovies);
    } catch (error) {
      console.error("Error fetching saved movies:", error);
      res.status(500).json({ message: "Failed to fetch saved movies" });
    }
  });

  // User profile route
  app.get("/api/user/profile", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const favorites = await storage.getSavedMovies(req.user!.id, "favorites");
      const watchlists = await storage.getUserWatchlists(req.user!.id);

      // Get watchlist counts
      const watchlistsWithCounts = await Promise.all(
        watchlists.map(async (watchlist) => {
          const movies = await storage.getWatchlistMovies(watchlist.id);
          return {
            ...watchlist,
            movieCount: movies.length
          };
        })
      );

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt
        },
        favorites,
        watchlists: watchlistsWithCounts,
        stats: {
          favoriteCount: favorites.length,
          watchlistCount: watchlists.length
        }
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.delete("/api/movies/saved/:movieId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = req.params.movieId;
      const listType = req.query.listType as string || "favorites";
      const removed = await storage.removeSavedMovie(req.user!.id, movieId, listType);
      
      if (!removed) {
        return res.status(404).json({ message: "Movie not found in saved list" });
      }

      res.json({ message: "Movie removed from saved list" });
    } catch (error) {
      console.error("Error removing saved movie:", error);
      res.status(500).json({ message: "Failed to remove saved movie" });
    }
  });

  // Watchlist routes
  app.post("/api/watchlists", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validation = createWatchlistSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid watchlist data",
          errors: validation.error.errors
        });
      }

      const watchlist = await storage.createWatchlist({
        ...validation.data,
        userId: req.user!.id
      });

      res.status(201).json(watchlist);
    } catch (error) {
      console.error("Error creating watchlist:", error);
      res.status(500).json({ message: "Failed to create watchlist" });
    }
  });

  app.get("/api/watchlists", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const watchlists = await storage.getUserWatchlists(req.user!.id);
      res.json(watchlists);
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      res.status(500).json({ message: "Failed to fetch watchlists" });
    }
  });

  app.get("/api/watchlists/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid watchlist ID" });
      }

      const watchlist = await storage.getWatchlist(id);
      if (!watchlist) {
        return res.status(404).json({ message: "Watchlist not found" });
      }

      // Check if user owns the watchlist or if it's public
      if (watchlist.userId !== req.user!.id && !watchlist.isPublic) {
        return res.status(403).json({ message: "Access denied" });
      }

      const movies = await storage.getWatchlistMovies(id);
      res.json({ ...watchlist, movies });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.delete("/api/watchlists/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid watchlist ID" });
      }

      const deleted = await storage.deleteWatchlist(id, req.user!.id);
      if (!deleted) {
        return res.status(404).json({ message: "Watchlist not found" });
      }

      res.json({ message: "Watchlist deleted successfully" });
    } catch (error) {
      console.error("Error deleting watchlist:", error);
      res.status(500).json({ message: "Failed to delete watchlist" });
    }
  });

  app.post("/api/watchlists/:id/movies", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      if (isNaN(watchlistId)) {
        return res.status(400).json({ message: "Invalid watchlist ID" });
      }

      const validation = addToWatchlistSchema.safeParse({
        ...req.body,
        watchlistId
      });
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid movie data",
          errors: validation.error.errors
        });
      }

      // Check if user owns the watchlist
      const watchlist = await storage.getWatchlist(watchlistId);
      if (!watchlist || watchlist.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const movie = await storage.addMovieToWatchlist(validation.data);
      res.status(201).json(movie);
    } catch (error) {
      console.error("Error adding movie to watchlist:", error);
      res.status(500).json({ message: "Failed to add movie to watchlist" });
    }
  });

  app.delete("/api/watchlists/:id/movies/:movieId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const watchlistId = parseInt(req.params.id);
      const movieId = req.params.movieId;

      if (isNaN(watchlistId)) {
        return res.status(400).json({ message: "Invalid watchlist ID" });
      }

      // Check if user owns the watchlist
      const watchlist = await storage.getWatchlist(watchlistId);
      if (!watchlist || watchlist.userId !== req.user!.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const removed = await storage.removeMovieFromWatchlist(watchlistId, movieId);
      if (!removed) {
        return res.status(404).json({ message: "Movie not found in watchlist" });
      }

      res.json({ message: "Movie removed from watchlist" });
    } catch (error) {
      console.error("Error removing movie from watchlist:", error);
      res.status(500).json({ message: "Failed to remove movie from watchlist" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
