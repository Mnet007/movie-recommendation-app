import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, saveMovieSchema } from "@shared/schema";
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
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      if (!TMDB_API_KEY) {
        return res.status(500).json({ message: "TMDB API key not configured" });
      }

      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
      );

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
      const savedMovies = await storage.getSavedMovies(req.user!.id);
      res.json(savedMovies);
    } catch (error) {
      console.error("Error fetching saved movies:", error);
      res.status(500).json({ message: "Failed to fetch saved movies" });
    }
  });

  app.delete("/api/movies/saved/:movieId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const movieId = req.params.movieId;
      const removed = await storage.removeSavedMovie(req.user!.id, movieId);
      
      if (!removed) {
        return res.status(404).json({ message: "Movie not found in saved list" });
      }

      res.json({ message: "Movie removed from saved list" });
    } catch (error) {
      console.error("Error removing saved movie:", error);
      res.status(500).json({ message: "Failed to remove saved movie" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
