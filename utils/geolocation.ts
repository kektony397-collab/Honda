
// Haversine distance (meters) between two lat/lon points
export function haversineDistance(coords1: [number, number], coords2: [number, number]): number {
  const [lat1, lon1] = coords1;
  const [lat2, lon2] = coords2;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convex hull (Andrew monotone chain) -> area of polygon (m^2)
export function polygonArea(points: [number, number][]): number {
  if (points.length < 3) return 0;
  
  const pts = [...points];
  pts.sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]));

  const cross = (o: [number, number], a: [number, number], b: [number, number]): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  
  const lower: [number, number][] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  
  const upper: [number, number][] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  
  upper.pop();
  lower.pop();
  
  const hull = lower.concat(upper);
  if (hull.length < 3) return 0;

  // Convert lat/lon to meter projection for area calculation using equirectangular approximation
  const latRef = (hull.reduce((s, p) => s + p[0], 0) / hull.length) * (Math.PI / 180);
  const mPerDegLat = 111132.92 - 559.82 * Math.cos(2 * latRef) + 1.175 * Math.cos(4 * latRef);
  const mPerDegLon = (Math.PI / 180) * 6378137 * Math.cos(latRef);

  const verts = hull.map((p): [number, number] => [p[1] * mPerDegLon, p[0] * mPerDegLat]);

  let area = 0;
  for (let i = 0; i < verts.length; i++) {
    const [x1, y1] = verts[i];
    const [x2, y2] = verts[(i + 1) % verts.length];
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area / 2);
}

// Format numbers
export const fmtNumber = (v: number | null | undefined, d = 2): string => {
  if (v === null || v === undefined || !isFinite(v)) {
    return Number(0).toFixed(d);
  }
  return v.toFixed(d);
};
