# 🌍 AI Trip Planner

![Hero Image](https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&q=80)

A production-ready, full-stack MERN application built for the **Frontend Internship Assignment**. It transforms free-form natural language into a highly structured, interactive, and shareable travel itinerary using Large Language Models (LLMs).

---

## 🏗️ System Architecture

The application is built on a defensive architecture designed to handle unpredictable AI outputs gracefully. The frontend never talks directly to the AI—everything is proxied through a Node.js backend that sanitizes and validates the data.

```mermaid
graph TD
    %% Styling
    classDef client fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef server fill:#10b981,stroke:#059669,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef ai fill:#8b5cf6,stroke:#7c3aed,stroke-width:2px,color:#fff,rx:8px,ry:8px
    classDef db fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff,rx:8px,ry:8px

    subgraph Frontend [React + Zustand]
        UI[Interactive UI]:::client
        Store[Zustand Store]:::client
        Map[Leaflet Map]:::client
    end

    subgraph Backend [Node.js + Express]
        API[Express Router]:::server
        Parser{Defensive JSON Parser}:::server
    end
    
    subgraph External
        LLM[Groq / LLaMA 3.3]:::ai
        Unsplash[Unsplash API]:::ai
        DB[(MongoDB Atlas)]:::db
    end

    %% Connections
    UI -- "1. Prompt (e.g. '3 days in Tokyo')" --> API
    API -- "2. System Prompt + Input" --> LLM
    LLM -- "3. Unstructured/Markdown JSON" --> Parser
    Parser -- "4. Validated ITripSession" --> DB
    API -- "Fetch Hero Image" --> Unsplash
    DB -- "5. Saved Session (UUID)" --> Store
    Store -- "6. Render Drag-and-Drop List" --> UI
    Store -- "7. Render Coordinates" --> Map
```

---

## ✨ Core Features

- **Defensive AI Parsing:** LLMs often hallucinate markdown blocks (e.g., ` ```json `). A custom regex parser safely extracts and parses JSON before it ever hits the database.
- **Interactive Builder:** Uses `@dnd-kit` for real-time drag-and-drop, allowing users to reorganize AI-generated stops seamlessly.
- **Session Persistence & Routing (Stretch Goal):** All trips are saved to MongoDB. A unique URL (e.g., `/trip/abc-123`) allows users to return to or share their specific itinerary.
- **Stale Response Mitigation:** Uses `AbortController` on network requests so newer generations automatically cancel older pending requests, avoiding state race conditions.

---

## 🔄 The "Tweak" Loop (Stretch Goal)

Rather than forcing the user to regenerate an entire trip if they don't like one part of it, the app features a "Tweak Panel". 

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Groq AI
    participant MongoDB

    User->>Frontend: Types: "Make day 2 cheaper"
    Frontend->>Backend: POST /tweak (Instruction + Current JSON State)
    
    note over Backend,Groq AI: Backend proxies the current state<br/>so the AI knows what to edit.
    
    Backend->>Groq AI: Context + Current State + Instruction
    Groq AI-->>Backend: New Mutated JSON State
    
    Backend->>MongoDB: Push old state to History array
    Backend->>MongoDB: Save new Mutated state
    
    Backend-->>Frontend: Updated Trip Session
    Frontend->>User: UI Updates Seamlessly
```

---

## 🚀 Setup Instructions

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

---

## 🤖 AI Usage Note
AI tools (DeepMind Agents / GitHub Copilot) were used to bootstrap the Tailwind v4 styling, assist in formatting standard boilerplate (like configuring Vite/PostCSS), and provide suggestions for complex generic algorithms (like the defensive JSON regex parser). The core architectural decisions (Zustand over Context, MongoDB schema design, Groq integration, and Error Boundaries) were carefully planned out to meet the strict requirements of the assignment. I am fully prepared to explain and walk through every line of code!

## ⚠️ Known Limitations
- The Unsplash API has a rate limit of 50 requests per hour for free tiers. If this limit is hit, the hero image will silently fallback to a default image.
- Since the AI tries to find real places and approximate coordinates, obscure places may have slightly inaccurate geocoordinates on the Leaflet map.

## ⏱️ Time Spent
Approximately ~6 to 7 hours of active architecture planning, development, and debugging across the frontend and backend.
