export const validateTripJSON = (data: any): boolean => {
  if (!data || typeof data !== "object") return false;

  const { destinationMeta, itinerary } = data;

  if (
    !destinationMeta ||
    typeof destinationMeta.name !== "string" ||
    typeof destinationMeta.lat !== "number" ||
    typeof destinationMeta.lng !== "number"
  ) {
    return false;
  }

  if (!Array.isArray(itinerary)) return false;

  for (const day of itinerary) {
    if (typeof day.dayNumber !== "number") return false;
    if (!Array.isArray(day.stops)) return false;

    for (const stop of day.stops) {
      if (
        typeof stop.id !== "string" ||
        typeof stop.name !== "string" ||
        typeof stop.description !== "string" ||
        typeof stop.lat !== "number" ||
        typeof stop.lng !== "number"
      ) {
        return false;
      }
    }
  }

  return true;
};
