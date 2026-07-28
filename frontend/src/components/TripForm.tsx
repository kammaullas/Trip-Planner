import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Plane, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTripStore } from "../store/useTripStore";
import { validateTripJSON } from "../utils/validators";

export const TripForm: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const { setSession, isLoading, setLoading, setError } = useTripStore();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.post(`${API_URL}/api/trip/generate-trip`, { prompt }, {
        signal: abortControllerRef.current.signal
      });
      const data = response.data;

      // Defensive Parsing Check
      if (validateTripJSON(data)) {
        setSession(data);
        navigate(`/trip/${data.sessionId}`);
      } else {
        throw new Error("Invalid itinerary format received from AI.");
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
        return;
      }
      console.error(err);
      setError(
        err.response?.data?.message || err.message || "Failed to generate trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-12 rounded-3xl shadow-2xl transform transition-all hover:scale-[1.01]">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <Plane className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center mb-4 tracking-tight">
          Where to next?
        </h1>
        <p className="text-slate-300 text-center mb-8 text-lg">
          Describe your dream trip. Our AI will craft the perfect itinerary.
        </p>
        
        <form onSubmit={handleSubmit} className="relative group">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A 3-day budget trip to Tokyo focusing on food and temples..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-2xl p-6 pr-32 min-h-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 disabled:hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all shadow-lg hover:shadow-blue-500/25"
          >
            <span>{isLoading ? "Generating..." : "Generate"}</span>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
