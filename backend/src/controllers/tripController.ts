import type { Request, Response } from "express";
import { Groq } from "groq-sdk";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import TripSession from "../models/TripSession.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Utility to parse potentially malformed JSON from LLM
const extractAndParseJSON = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        throw new Error("AI_GENERATION_FAILED");
      }
    }
    throw new Error("AI_GENERATION_FAILED");
  }
};

export const generateTrip = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const systemPrompt = `You are an expert travel planner. Return a structured itinerary in strictly valid JSON format. Do NOT include markdown blocks like \`\`\`json. 
    The JSON must match this structure exactly:
    {
      "destinationMeta": {
        "name": "City Name",
        "lat": 0.0,
        "lng": 0.0
      },
      "itinerary": [
        {
          "dayNumber": 1,
          "stops": [
            {
              "id": "unique-string-id",
              "name": "Place Name",
              "description": "Short description",
              "lat": 0.0,
              "lng": 0.0
            }
          ]
        }
      ]
    }`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const aiText = completion.choices[0]?.message?.content || "";
    const parsedData = extractAndParseJSON(aiText);

    if (!parsedData.destinationMeta || !parsedData.itinerary) {
      throw new Error("AI_GENERATION_FAILED");
    }

    // Fetch Unsplash Image
    let heroImageUrl = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1080&q=80"; // fallback
    if (UNSPLASH_ACCESS_KEY) {
      try {
        const unsplashRes = await axios.get(`https://api.unsplash.com/search/photos`, {
          params: { query: parsedData.destinationMeta.name, per_page: 1, orientation: "landscape" },
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
        });
        if (unsplashRes.data.results.length > 0) {
          heroImageUrl = unsplashRes.data.results[0].urls.regular;
        }
      } catch (e) {
        console.error("Unsplash error:", e);
      }
    }

    parsedData.destinationMeta.heroImageUrl = heroImageUrl;
    const sessionId = uuidv4();

    const tripSession = new TripSession({
      sessionId,
      destinationMeta: parsedData.destinationMeta,
      itinerary: parsedData.itinerary,
      rawAiHistory: [{ days: parsedData.itinerary }],
    });

    await tripSession.save();

    res.status(200).json(tripSession);
  } catch (error: any) {
    console.error("generateTrip Error:", error);
    res.status(500).json({
      error: "AI_GENERATION_FAILED",
      message: "The AI returned an invalid format. Please try again.",
    });
  }
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tripSession = await TripSession.findOne({ sessionId: id } as any);
    if (!tripSession) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.status(200).json(tripSession);
  } catch (error) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to fetch trip" });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { itinerary } = req.body;

    const tripSession = await TripSession.findOneAndUpdate(
      { sessionId: id } as any,
      { itinerary },
      { returnDocument: "after" }
    );

    if (!tripSession) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.status(200).json(tripSession);
  } catch (error) {
    res.status(500).json({ error: "INTERNAL_SERVER_ERROR", message: "Failed to update trip" });
  }
};

export const tweakTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { instruction, currentItinerary } = req.body;

    const tripSession = await TripSession.findOne({ sessionId: id } as any);
    if (!tripSession) {
      return res.status(404).json({ error: "Trip not found" });
    }

    const systemPrompt = `You are an expert travel planner. The user wants to modify an existing itinerary.
    Return the fully updated itinerary array in strictly valid JSON format.
    Current Itinerary: ${JSON.stringify(currentItinerary)}
    
    User Instruction: ${instruction}
    
    Return ONLY the new "itinerary" array of days and stops inside a JSON object: { "itinerary": [...] }.
    Maintain the identical JSON structure for days and stops.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const aiText = completion.choices[0]?.message?.content || "";
    const parsedData = extractAndParseJSON(aiText);

    if (!parsedData.itinerary) {
      throw new Error("AI_GENERATION_FAILED");
    }

    // Push current to history
    tripSession.rawAiHistory.push({ days: tripSession.itinerary });
    
    // Update current
    tripSession.itinerary = parsedData.itinerary;
    await tripSession.save();

    res.status(200).json(tripSession);
  } catch (error: any) {
    console.error("tweakTrip Error:", error);
    res.status(500).json({
      error: "AI_GENERATION_FAILED",
      message: "The AI returned an invalid format. Please try again.",
    });
  }
};
