import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Loader2 } from "lucide-react";
import { useTripStore } from "../store/useTripStore";

export const TweakPanel: React.FC = () => {
  const [instruction, setInstruction] = useState("");
  const [isTweaking, setIsTweaking] = useState(false);
  const { session, updateItinerary, setError } = useTripStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleTweak = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || !session) return;

    setIsTweaking(true);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.post(`${API_URL}/api/trip/${session.sessionId}/tweak`, {
        instruction,
        currentItinerary: session.itinerary,
      }, {
        signal: abortControllerRef.current.signal
      });
      
      const data = response.data;
      if (data && data.itinerary) {
        updateItinerary(data.itinerary);
        setInstruction("");
      } else {
        throw new Error("Invalid tweak response.");
      }
    } catch (err: any) {
      if (axios.isCancel(err)) {
        console.log("Request canceled", err.message);
        return;
      }
      console.error(err);
      setError("Failed to tweak itinerary. Please try again.");
    } finally {
      setIsTweaking(false);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <form onSubmit={handleTweak} className="flex items-center space-x-2">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g., Make day 2 cheaper, add a museum..."
          disabled={isTweaking}
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500 placeholder-slate-400 transition-all"
        />
        <button
          type="submit"
          disabled={isTweaking || !instruction.trim()}
          className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[3rem]"
        >
          {isTweaking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};
