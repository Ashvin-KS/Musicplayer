import React, { useState, useEffect, memo } from 'react';
import { getArtistDetails } from './aii';

const RightSidebar = ({ 
  showVideo, 
  currentTrack, 
  children
}) => {
  const [artistInfo, setArtistInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (currentTrack && currentTrack.title) {
      setArtistInfo(null);
      setIsLoading(true);

      const fetchArtistInfo = async () => {
        try {
          const info = await getArtistDetails(currentTrack.title);
          if (!isCancelled) {
            setArtistInfo(info || {});
          }
        } catch (error) {
          console.error("RightSidebar: Failed to fetch artist info:", error);
          if (!isCancelled) {
            setArtistInfo({});
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

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.id, currentTrack?.title, currentTrack]);

  return (
    <div className="sidebar right-sidebar">
      <div 
        className="video-container"
        style={showVideo && currentTrack ? {
          height: '200px', 
        } : {
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
        }}
      >
        {children}
      </div>
      
      <div className="artist-info-container">
        {currentTrack && (
          <>
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
            <h2>{(artistInfo && artistInfo.artistName) || (currentTrack && currentTrack.artist) || "Unknown Artist"}</h2>
            {((artistInfo && artistInfo.viewCount) || (currentTrack && currentTrack.view_count)) && (
              <p style={{ fontSize: '0.9em', color: '#ccc' }}>
                Views: {((artistInfo && artistInfo.viewCount) || (currentTrack && currentTrack.view_count)).toLocaleString()}
              </p>
            )}
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
