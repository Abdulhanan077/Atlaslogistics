/**
 * Geocoding utility using OpenStreetMap (Nominatim)
 * Free to use, but please respect their usage policy: 
 * https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeocodeResult {
    lat: string;
    lon: string;
    display_name: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address || address.length < 3) return null;

    // Clean address parts
    let currentQuery = address.trim();
    const parts = currentQuery.split(',').map(p => p.trim());
    
    // We will try up to 3 times, stripping the first part each time if not found
    // e.g. "7th Floor, 3 Shortlands, London" -> "3 Shortlands, London" -> "London"
    for (let i = 0; i < Math.min(3, parts.length); i++) {
        const query = parts.slice(i).join(', ');
        if (query.length < 3) break;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'AtlasLogistics-Platform/1.0'
                    }
                }
            );

            if (!response.ok) continue;

            const data = await response.json();
            if (data && data.length > 0) {
                return {
                    lat: data[0].lat,
                    lon: data[0].lon,
                    display_name: data[0].display_name
                };
            }
        } catch (error) {
            console.error('Geocoding attempt failed:', error);
        }
    }

    return null;
}
