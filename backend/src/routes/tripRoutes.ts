import express from "express";
import { generateTrip, getTrip, updateTrip, tweakTrip } from "../controllers/tripController.js";

const router = express.Router();

router.post("/generate-trip", generateTrip);
router.get("/:id", getTrip);
router.put("/:id", updateTrip);
router.post("/:id/tweak", tweakTrip);

export default router;
