/**
 * Fetches artist information for a given song title from the backend, which in turn
 * retrieves it from YouTube.
 * @param {string} songTitle The title of the song.
 * @returns {Promise<object|null>} A promise that resolves to an object with artist info or null if an error occurs.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export const getArtistDetails = async (songTitle) => {
  try {
    const response = await fetch(`${API_BASE}/get_artist_details?song_title=${encodeURIComponent(songTitle)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Backend error fetching artist info: ${response.status} - ${errorData.error}`);
      return null;
    }

    const artistInfo = await response.json();
    console.log(`Fetched artist info from backend:`, artistInfo);
    return artistInfo;
  } catch (error) {
    console.error("Error fetching artist info from backend:", error);
    return null;
  }
}
