# AI Trip Planner

This project was built for the Frontend Internship Assignment. It is a full-stack MERN application that uses a Large Language Model (Groq / LLaMA 3.3) to dynamically generate and edit a day-by-day travel itinerary.

## Features Built
- **Structured AI Output Parsing:** Converts free-form text ("I want to go to Tokyo for 3 days") into structured JSON data mapped onto an interactive UI. Defensive parsing handles malformed markdown/JSON.
- **Drag & Drop Editing:** Fully interactive `@dnd-kit` sortable lists allowing users to reorganize stops on the fly.
- **Tweak Loop (Stretch Goal):** A chat panel allows users to send follow-up instructions to edit the *existing* generated itinerary rather than starting from scratch.
- **Session Persistence & Routing (Stretch Goal):** All trips are saved to MongoDB. A unique URL allows users to return to or share their specific itinerary.
- **Mobile Responsive:** Layout smartly adapts between a full-screen side-by-side view on desktop to a stacked, scrolling view on mobile.
- **Stale Response Handling:** Uses `AbortController` on network requests so a newer generation request automatically cancels older, pending requests, avoiding state race conditions.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)

### 1. Backend Setup
```bash
cd backend
npm install
copy .env.example .env
```
Fill out the `.env` file with your `GROQ_API_KEY` (free from groq.com) and `UNSPLASH_ACCESS_KEY` (free from unsplash.com).

Run the backend:
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal.
```bash
cd frontend
npm install
npm run dev
```

Navigate to `http://localhost:5173` in your browser.

## AI Usage Note
AI tools (GitHub Copilot / DeepMind Agents) were used to bootstrap the Tailwind styling, assist in formatting standard boilerplate (like configuring Vite/PostCSS), and provide suggestions for complex generic algorithms (like the defensive JSON regex parser). The core architectural decisions (Zustand over Context, MongoDB schema design, Groq integration) were carefully planned out to meet the strict requirements of the assignment. I am fully prepared to explain and walk through every line of code!

## Known Limitations
- The Unsplash API has a rate limit of 50 requests per hour for free tiers. If this limit is hit, the hero image will silently fallback to a default image.
- Since the AI tries to find real places and approximate coordinates, some obscure places may have slightly inaccurate geocoordinates on the Leaflet map.
- The map only supports viewing pins. Interactive clicking on map pins to highlight the itinerary card is not yet implemented.

## Time Spent
Approximately ~6 to 7 hours of active architecture planning, development, and debugging across the frontend and backend.
