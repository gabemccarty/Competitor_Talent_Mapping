/**
 * Common city/region names to [lat, lng] for Gem CSV location parsing.
 * Normalized to lowercase; generator matches "San Francisco" or "san francisco, ca".
 */
export const cityCoordinates = {
  'san francisco': [37.7749, -122.4194],
  'san francisco bay area': [37.7749, -122.4194],
  'sf bay area': [37.7749, -122.4194],
  'bay area': [37.7749, -122.4194],
  'menlo park': [37.4529, -122.1817],
  'sunnyvale': [37.3688, -122.0363],
  'mountain view': [37.3861, -122.0839],
  'palo alto': [37.4419, -122.1430],
  'cupertino': [37.3230, -122.0322],
  'santa clara': [37.3541, -122.0488],
  'san jose': [37.3382, -122.8863],
  'oakland': [37.8044, -122.2712],
  'fremont': [37.5485, -121.9886],
  'new york': [40.7128, -74.0060],
  'new york city': [40.7128, -74.0060],
  'nyc': [40.7128, -74.0060],
  'brooklyn': [40.6782, -73.9442],
  'seattle': [47.6062, -122.3321],
  'bellevue': [47.6101, -122.2015],
  'redmond': [47.6740, -122.1215],
  'kirkland': [47.6815, -122.2087],
  'los angeles': [34.0522, -118.2437],
  'la': [34.0522, -118.2437],
  'san diego': [32.7157, -117.1611],
  'irvine': [33.6846, -117.8265],
  'austin': [30.2672, -97.7431],
  'denver': [39.7392, -104.9903],
  'boulder': [40.0150, -105.2705],
  'boston': [42.3601, -72.0589],
  'cambridge': [42.3736, -71.1097],
  'chicago': [41.8781, -87.6298],
  'washington': [38.9072, -77.0369],
  'washington dc': [38.9072, -77.0369],
  'dc': [38.9072, -77.0369],
  'arlington': [38.8816, -77.0910],
  'atlanta': [33.7490, -84.3880],
  'miami': [25.7617, -80.1918],
  'dallas': [32.7767, -96.7970],
  'houston': [29.7604, -95.3698],
  'phoenix': [33.4484, -112.0740],
  'philadelphia': [39.9526, -75.1652],
  'minneapolis': [44.9778, -93.2650],
  'portland': [45.5152, -122.6784],
  'salt lake city': [40.7608, -111.8910],
  'london': [51.5074, -0.1278],
  'greater london': [51.5074, -0.1278],
  'dublin': [53.3498, -6.2603],
  'ireland': [53.3498, -6.2603],
  'amsterdam': [52.3676, 4.9041],
  'berlin': [52.5200, 13.4050],
  'munich': [48.1351, 11.5820],
  'paris': [48.8566, 2.3522],
  'zurich': [47.3769, 8.5417],
  'tel aviv': [32.0853, 34.7818],
  'israel': [32.0853, 34.7818],
  'singapore': [1.3521, 103.8198],
  'tokyo': [35.6762, 139.6503],
  'japan': [35.6762, 139.6503],
  'sydney': [-33.8688, 151.2093],
  'australia': [-33.8688, 151.2093],
  'toronto': [43.6532, -79.3832],
  'vancouver': [49.2827, -123.1207],
  'montreal': [45.5017, -73.5673],
  'waterloo': [43.4643, -80.5204],
  'india': [20.5937, 78.9629],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'hyderabad': [17.3850, 78.4867],
  'mumbai': [19.0760, 72.8777],
  'delhi': [28.7041, 77.1025],
  'gurgaon': [28.4595, 77.0266],
  'gurugram': [28.4595, 77.0266],
  'china': [35.8617, 104.1954],
  'shanghai': [31.2304, 121.4737],
  'beijing': [39.9042, 116.4074],
  'shenzhen': [22.5431, 114.0579],
  'hong kong': [22.3193, 114.1694],
  'remote': [20, 0],
  'united states': [39.8283, -98.5795],
  'usa': [39.8283, -98.5795],
  'united kingdom': [55.3781, -3.4360],
  'uk': [55.3781, -3.4360],
  'canada': [56.1304, -106.3468],
  'germany': [51.1657, 10.4515],
  'france': [46.2276, 2.2137],
  'netherlands': [52.1326, 5.2913],
  'switzerland': [46.8182, 8.2275],
  'spain': [40.4637, -3.7492],
  'madrid': [40.4168, -3.7038],
  'barcelona': [41.3851, 2.1734],
  'poland': [51.9194, 19.1451],
  'warsaw': [52.2297, 21.0122],
  'krakow': [50.0647, 19.9450],
  'sweden': [60.1282, 18.6435],
  'stockholm': [59.3293, 18.0686],
  'brazil': [-14.2350, -51.9253],
  'sao paulo': [-23.5505, -46.6333],
  'mexico': [23.6345, -102.5528],
  'mexico city': [19.4326, -99.1332],
  'argentina': [-38.4161, -63.6167],
  'buenos aires': [-34.6037, -58.3816],
};

/**
 * Normalize location string and try to resolve to [lat, lng].
 * @param {string} location - Raw location e.g. "San Francisco, CA" or "London, UK"
 * @returns {{ lat: number, lng: number, label: string } | null}
 */
export function resolveLocation(location) {
  if (!location || typeof location !== 'string') return null;
  const raw = location.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const parts = lower.split(/[\s,;|]+/).map((p) => p.trim()).filter(Boolean);
  for (let i = 0; i < parts.length; i++) {
    const key = parts.slice(0, i + 1).join(' ');
    if (cityCoordinates[key]) {
      const [lat, lng] = cityCoordinates[key];
      return { lat, lng, label: raw };
    }
  }
  const first = parts[0];
  if (cityCoordinates[first]) {
    const [lat, lng] = cityCoordinates[first];
    return { lat, lng, label: raw };
  }
  return null;
}
