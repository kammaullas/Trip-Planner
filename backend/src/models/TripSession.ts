import mongoose, { Document, Schema } from "mongoose";

export interface IStop {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

export interface IDay {
  dayNumber: number;
  stops: IStop[];
}

export interface ITripState {
  days: IDay[];
}

export interface ITripSession extends Document {
  sessionId: string;
  destinationMeta: {
    name: string;
    heroImageUrl: string;
    lat: number;
    lng: number;
  };
  itinerary: IDay[];
  rawAiHistory: ITripState[];
}

const StopSchema = new Schema<IStop>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

const DaySchema = new Schema<IDay>({
  dayNumber: { type: Number, required: true },
  stops: [StopSchema],
});

const TripStateSchema = new Schema<ITripState>({
  days: [DaySchema],
});

const TripSessionSchema = new Schema<ITripSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    destinationMeta: {
      name: { type: String, required: true },
      heroImageUrl: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    itinerary: [DaySchema],
    rawAiHistory: [TripStateSchema],
  },
  { timestamps: true }
);

export default mongoose.model<ITripSession>("TripSession", TripSessionSchema);
