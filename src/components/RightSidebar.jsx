import React, { useState, useEffect, memo } from 'react';
import { getArtistDetails } from './aii';

const RightSidebar = ({ currentTrack, children }) => {
  const [artistInfo, setArtistInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (currentTrack?.title) {
      setArtistInfo(null);
      getArtistDetails(currentTrack.title)
        .then(info => { if (!cancelled) setArtistInfo(info || {}); })
        .catch(() => { if (!cancelled) setArtistInfo({}); });
    }
    return () => { cancelled = true; };
  }, [currentTrack?.id]);

  const artistName = artistInfo?.artistName || currentTrack?.artist || 'Unknown Artist';
  const artistImage = artistInfo?.artistImage || currentTrack?.thumbnail;

  return (
    <div className="right-sidebar">
      {/* Hidden YouTube player */}
      <div style={{ position: 'absolute', top: '-9999px' }}>{children}</div>

      {currentTrack ? (
        <div className="artist-card">
          {artistImage && <img src={artistImage} alt={artistName} />}
          <div className="artist-card-content">
            <h3>{artistName}</h3>
            <p>{artistInfo?.viewCount?.toLocaleString() || currentTrack.view_count?.toLocaleString() || '0'} views</p>
            {currentTrack.description && (
              <p style={{ marginTop: '8px' }}>{currentTrack.description}</p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ color: '#b3b3b3', textAlign: 'center', padding: '24px' }}>
          Play a track to see artist info
        </div>
      )}
    </div>
  );
};

export default memo(RightSidebar);
