import React, { useState, useEffect, memo } from 'react';
import { getArtistInfo } from './aii';

const RightSidebar = ({ 
  showVideo, 
  currentTrack, 
  videoRef, 
  isPlaying
}) => {
  const [artistInfo, setArtistInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false; // Flag to ignore stale requests

    if (currentTrack && currentTrack.title) {
      setArtistInfo(null); // Immediately clear old artist info
      setIsLoading(true);

      const fetchArtistInfo = async () => {
        try {
          const info = await getArtistInfo(currentTrack.title);
          // Only update state if this effect is still the active one
          if (!isCancelled) {
            setArtistInfo(info || {});
          }
        } catch (error) {
          console.error("RightSidebar: Failed to fetch artist info:", error);
          if (!isCancelled) {
            setArtistInfo({}); // Set to an empty object on error
          }
        } finally {
          if (!isCancelled) {
            setIsLoading(false);
          }
        }
      };

      fetchArtistInfo();
    } else {
      setArtistInfo(null);
      setIsLoading(false);
    }

    // Cleanup function: This runs when the component unmounts or the effect re-runs.
    // It sets the flag to true, so any pending fetch requests from the *previous* effect will be ignored.
    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.title]); // Re-run only when the actual track ID changes

  return (
    <div className="sidebar right-sidebar">
      {showVideo && currentTrack && (
        <div className="video-container">
          <iframe
            ref={videoRef}
            src={`https://www.youtube.com/embed/${currentTrack.id}?enablejsapi=1&controls=0&rel=0&modestbranding=1&mute=1&autoplay=${isPlaying ? 1 : 0}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      )}
      
      <div className="artist-info-container">
        {currentTrack && (
          <>
            {/* Display artist image */}
            {/* Prioritize artistInfo.artistImage, then currentTrack.thumbnail as a fallback */}
            {((artistInfo && artistInfo.artistImage) || (currentTrack && currentTrack.thumbnail)) && (
              <div className="artist-image-wrapper">
                <img
                  src={(artistInfo && artistInfo.artistImage) || (currentTrack && currentTrack.thumbnail)}
                  alt={(artistInfo && artistInfo.artistName) || (currentTrack && currentTrack.artist) || "Artist"}
                  className="artist-image"
                />
              </div>
            )}
            {isLoading && !((artistInfo && artistInfo.artistImage) || (currentTrack && currentTrack.thumbnail)) && (
              <p>Loading artist image...</p>
            )}
            {/* Display artist name from fetched info, fallback to currentTrack */}
            <h2>{(artistInfo && artistInfo.artistName) || (currentTrack && currentTrack.artist) || "Unknown Artist"}</h2>
            {/* Display views from fetched info, fallback to currentTrack */}
            {((artistInfo && artistInfo.viewCount) || (currentTrack && currentTrack.view_count)) && (
              <p style={{ fontSize: '0.9em', color: '#ccc' }}>
                Views: {((artistInfo && artistInfo.viewCount) || (currentTrack && currentTrack.view_count)).toLocaleString()}
              </p>
            )}
            
            {/* Artist description removed as per request */}
          </>
        )}
        {currentTrack && currentTrack.description && (
          <div className="artist-description-container" style={{ padding: '15px', overflowY: 'auto', flex: '1' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#fff' }}>About the Artist</h3>
            <p className="artist-description" style={{ fontSize: '0.9em', color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {currentTrack.description}
            </p>
          </div>
        )}
        {!currentTrack && (
            <p>Select a track to see information.</p>
        )}
      </div>
    </div>
  );
};

export default memo(RightSidebar);
