# 🎬 MovieApp - Fullstack Movie Discovery Platform

A comprehensive fullstack JavaScript application for discovering, saving, and organizing movies. Built with React, Express.js, and PostgreSQL, featuring real-time movie data from The Movie Database (TMDB) API.

![MovieApp Demo](https://github.com/user/movieapp/assets/demo.png)

## 🌟 Features

### 🔐 Authentication & User Management
- **Secure JWT Authentication** with bcrypt password hashing
- **User Registration & Login** with form validation
- **Protected Routes** ensuring secure access to user data
- **Persistent Sessions** with automatic token refresh

### 🎥 Movie Discovery
- **Advanced Movie Search** powered by TMDB API
- **Filter by Genre** - Browse movies by specific genres
- **Filter by Year** - Discover movies from different decades
- **Popular Movies** - Trending and highly-rated films
- **Detailed Movie Information** including ratings, release dates, and overviews

### ⭐ Personal Movie Management
- **Save to Favorites** - Quick access to loved movies
- **Custom Watchlists** - Create and organize themed movie collections
- **Public/Private Watchlists** - Share recommendations or keep them personal
- **Watchlist Management** - Full CRUD operations for organizing movies

### 📱 User Experience
- **Fully Responsive Design** - Optimized for desktop, tablet, and mobile
- **Real-time Updates** - Instant feedback on all user actions
- **Loading States** - Smooth user experience with proper loading indicators
- **Error Handling** - Comprehensive error messages and recovery options
- **Modern UI** - Clean, intuitive interface with Tailwind CSS

## 🚀 Technologies Used

### Frontend
- **React 18** - Modern component-based UI framework
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first styling framework
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Data fetching and state management
- **React Hook Form** - Efficient form handling with validation
- **Zod** - Schema validation for type safety
- **Radix UI** - Accessible component primitives

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe server development
- **JWT** - Secure authentication tokens
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing configuration

### Database & ORM
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database operations
- **Database Migrations** - Version-controlled schema management

### External APIs
- **The Movie Database (TMDB)** - Comprehensive movie data and images

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **TMDB API Key** ([Get one here](https://www.themoviedb.org/settings/api))

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/movieapp.git
cd movieapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/movieapp

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key_here

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# (Optional) Seed database with sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🌐 Live Demo

- **Frontend (Vercel)**: [https://movieapp-frontend.vercel.app](https://movieapp-frontend.vercel.app)
- **Backend API (Render)**: [https://movieapp-api.render.com](https://movieapp-api.render.com)

## 📱 Screenshots

### Home Page
![Home Page](screenshots/home.png)

### Movie Search
![Movie Search](screenshots/search.png)

### User Profile
![User Profile](screenshots/profile.png)

### Watchlist Management
![Watchlists](screenshots/watchlists.png)

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Configure build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`

2. **Environment Variables**
   ```env
   VITE_API_URL=https://your-backend-url.render.com
   VITE_TMDB_API_KEY=your_tmdb_api_key
   ```

### Backend Deployment (Render)

1. **Create Web Service**
   - Connect your GitHub repository
   - Configure service settings:
     - Build Command: `npm run build`
     - Start Command: `npm start`

2. **Environment Variables**
   ```env
   DATABASE_URL=your_postgresql_connection_string
   TMDB_API_KEY=your_tmdb_api_key
   JWT_SECRET=your_jwt_secret
   NODE_ENV=production
   PORT=10000
   ```

### Database Setup (Render PostgreSQL)

1. Create a PostgreSQL instance on Render
2. Copy the connection string to your environment variables
3. Run migrations: `npm run db:push`

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

## 📁 Project Structure

```
movieapp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utility functions and configurations
│   │   └── hooks/          # Custom React hooks
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database configuration
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and validation
├── screenshots/           # Application screenshots
└── docs/                  # Additional documentation
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open database studio
- `npm run lint` - Run ESLint
- `npm run test` - Run test suite

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Movie Database (TMDB)** for providing comprehensive movie data
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for the utility-first styling approach
- **Drizzle ORM** for type-safe database operations

## 📞 Support

For support, email support@movieapp.com or join our [Discord community](https://discord.gg/movieapp).

---

**Built with ❤️ by [Your Name](https://github.com/yourusername)**