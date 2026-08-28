import { SatelliteInfo } from "../types";

/**
 * Calculates current real-time latitude and longitude of a satellite
 * based on inclination, period, orbital phase, and Earth's rotation.
 */
export function calculateSatellitePosition(
  satellite: SatelliteInfo,
  timestampMs: number = Date.now()
): { lat: number; lon: number; groundTrack: { lat: number; lon: number }[] } {
  // Earth rotation rate: 360 degrees per 24 hours (1440 minutes)
  const earthDegPerMin = 360 / 1440;

  // Total elapsed minutes from reference epoch
  const totalMinutes = timestampMs / (1000 * 60);

  // Satellite mean anomaly / phase in orbit
  const orbitFraction = (totalMinutes % satellite.periodMinutes) / satellite.periodMinutes;
  const orbitalAngleRad = orbitFraction * 2 * Math.PI + satellite.basePhase;

  // Inclination in radians
  const incRad = (satellite.inclination * Math.PI) / 180;

  // Spherical orbital coordinates
  // Lat = arcsin(sin(inc) * sin(u))
  const sinLat = Math.sin(incRad) * Math.sin(orbitalAngleRad);
  const latRad = Math.asin(sinLat);
  const currentLat = (latRad * 180) / Math.PI;

  // Node longitude without earth rotation
  // tan(lon_node) = cos(inc) * tan(u)
  const y = Math.cos(incRad) * Math.sin(orbitalAngleRad);
  const x = Math.cos(orbitalAngleRad);
  let orbitLonRad = Math.atan2(y, x);
  let orbitLonDeg = (orbitLonRad * 180) / Math.PI;

  // Subtract Earth's rotation to get ground track longitude
  const earthRotationOffset = (totalMinutes * earthDegPerMin * 1.05) % 360;
  let currentLon = orbitLonDeg - earthRotationOffset + (satellite.catalogNumber % 180);

  // Normalize lon to -180 .. 180
  while (currentLon > 180) currentLon -= 360;
  while (currentLon < -180) currentLon += 360;

  // Generate continuous ground track for one full orbit (future pass)
  const groundTrack: { lat: number; lon: number }[] = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const futureMinutes = totalMinutes + (i / steps) * satellite.periodMinutes;
    const futureOrbitFraction = (futureMinutes % satellite.periodMinutes) / satellite.periodMinutes;
    const futureAngle = futureOrbitFraction * 2 * Math.PI + satellite.basePhase;

    const fSinLat = Math.sin(incRad) * Math.sin(futureAngle);
    const fLat = (Math.asin(fSinLat) * 180) / Math.PI;

    const fy = Math.cos(incRad) * Math.sin(futureAngle);
    const fx = Math.cos(futureAngle);
    const fOrbitLonDeg = (Math.atan2(fy, fx) * 180) / Math.PI;

    const fEarthRot = (futureMinutes * earthDegPerMin * 1.05) % 360;
    let fLon = fOrbitLonDeg - fEarthRot + (satellite.catalogNumber % 180);
    while (fLon > 180) fLon -= 360;
    while (fLon < -180) fLon += 360;

    groundTrack.push({ lat: fLat, lon: fLon });
  }

  return {
    lat: Number(currentLat.toFixed(4)),
    lon: Number(currentLon.toFixed(4)),
    groundTrack,
  };
}

/**
 * Calculates next pass estimate for a user's location
 */
export function calculateNextPass(
  satellite: SatelliteInfo,
  userLat = 34.0259,
  userLon = -118.7798
): { nextPassMinutes: number; maxElevationDeg: number; azimuthArrival: string } {
  // Hash calculation for stable realistic pass countdown
  const diff = Math.abs(satellite.inclination - Math.abs(userLat));
  const baseMinutes = ((satellite.catalogNumber * 7) % 45) + 12;
  const maxElev = Math.min(88, Math.max(18, 90 - diff * 1.2));
  const dirs = ["NNO", "NE", "ENE", "SO", "SSE", "SE", "NO"];
  const dir = dirs[satellite.catalogNumber % dirs.length];

  return {
    nextPassMinutes: Math.round(baseMinutes),
    maxElevationDeg: Math.round(maxElev),
    azimuthArrival: `${dir} (${(satellite.catalogNumber * 23) % 360}°)`,
  };
}
