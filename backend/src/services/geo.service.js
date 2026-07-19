import { env } from "../config/env.js";

/**
 * Reverse-geocodes lat/lng into a human-readable address + best-guess ward/locality
 * using OpenStreetMap Nominatim (free, no API key required).
 * Falls back to raw coordinates string if the service is unreachable.
 */
export async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "CivicLensAI/1.0 (hackathon project)" },
    });
    if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
    const data = await res.json();
    const addr = data.address || {};
    const ward = addr.suburb || addr.neighbourhood || addr.city_district || addr.village || "Unknown Ward";
    return {
      address: data.display_name || `${lat}, ${lng}`,
      ward,
    };
  } catch (err) {
    console.warn("[geo] reverse geocode failed, using raw coordinates:", err.message);
    return { address: `Lat ${lat}, Lng ${lng}`, ward: "Unknown Ward" };
  }
}

/**
 * Checks whether a hospital or school exists within `radiusMeters` of the point,
 * using Google Places Nearby Search if a key is configured. Returns false (safe
 * default) if the API key is missing or the call fails — this only affects the
 * impact score's proximity sub-weight, never blocks the core flow.
 */
export async function isNearHospitalOrSchool(lat, lng, radiusMeters = 300) {
  if (!env.GOOGLE_PLACES_API_KEY) return false;

  const types = ["hospital", "school"];
  try {
    const results = await Promise.all(
      types.map(async (type) => {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${type}&key=${env.GOOGLE_PLACES_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        return Array.isArray(data.results) && data.results.length > 0;
      })
    );
    return results.some(Boolean);
  } catch (err) {
    console.warn("[geo] places proximity check failed:", err.message);
    return false;
  }
}
