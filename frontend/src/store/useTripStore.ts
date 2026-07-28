import { create } from 'zustand';
import axios from 'axios';
import debounce from 'lodash/debounce';

export interface Stop {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

export interface Day {
  dayNumber: number;
  stops: Stop[];
}

export interface DestinationMeta {
  name: string;
  heroImageUrl: string;
  lat: number;
  lng: number;
}

export interface TripSession {
  sessionId: string;
  destinationMeta: DestinationMeta;
  itinerary: Day[];
  rawAiHistory: { days: Day[] }[];
}

interface TripState {
  session: TripSession | null;
  isLoading: boolean;
  error: string | null;
  setSession: (session: TripSession) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateItinerary: (itinerary: Day[]) => void;
}

// Debounced sync function for backend updates
const syncWithBackend = debounce(async (sessionId: string, itinerary: Day[]) => {
  try {
    await axios.put(`http://localhost:5000/api/trip/${sessionId}`, { itinerary });
  } catch (error) {
    console.error('Failed to sync with backend', error);
  }
}, 1000);

export const useTripStore = create<TripState>((set, get) => ({
  session: null,
  isLoading: false,
  error: null,
  setSession: (session) => set({ session, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  updateItinerary: (itinerary) => {
    const { session } = get();
    if (session) {
      set({ session: { ...session, itinerary } });
      syncWithBackend(session.sessionId, itinerary);
    }
  },
}));
