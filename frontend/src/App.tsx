import React, { useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
import { TripForm } from "./components/TripForm";
import { ItineraryView } from "./components/ItineraryView";
import { MapView } from "./components/MapView";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useTripStore } from "./store/useTripStore";

const TripViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { session, setSession, isLoading, setLoading, setError } = useTripStore();

  useEffect(() => {
    if (id && (!session || session.sessionId !== id)) {
      setLoading(true);
      setError(null);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      axios.get(`${API_URL}/api/trip/${id}`)
        .then(res => setSession(res.data))
        .catch(err => {
          console.error(err);
          setError("Failed to load trip or trip not found.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, session?.sessionId, setSession, setLoading, setError]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (!session) return null;

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-slate-50 overflow-hidden">
      <div className="w-full h-[55%] md:h-full md:w-[400px] lg:w-[500px] flex flex-col shadow-xl z-10">
        <ItineraryView />
      </div>
      <div className="flex-1 h-full relative z-0">
        <MapView />
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { error } = useTripStore();

  if (error) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 p-4">
        <ErrorBoundary>
          {(() => { throw new Error(error); })()}
        </ErrorBoundary>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<TripForm />} />
      <Route path="/trip/:id" element={<TripViewer />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};

export default App;
