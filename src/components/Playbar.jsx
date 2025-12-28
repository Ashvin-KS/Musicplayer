import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Volume2, VolumeX } from 'lucide-react';

const Playbar = ({
  isPlaying,
  togglePlay,
  playNext,
  playPrev,
  currentTrack,
  progressBarRef,
  handleProgressClick,
  currentTime,
  duration,
  formatTime,
  volume,
  onVolumeChange,
  isShuffle,
  toggleShuffle
}) => {
  return (
    <div className="playbar">
      {/* Track Info */}
      <div className="track-info-bar">
        {currentTrack ? (
          <>
            <img src={currentTrack.thumbnail} alt="" />
            <span>{currentTrack.title}</span>
          </>
        ) : (
          <span style={{ color: '#b3b3b3' }}>No track playing</span>
        )}
      </div>

      {/* Controls */}
      <div className="playbar-controls">
        <div className="control-buttons">
          <button className={`control-btn ${isShuffle ? 'active' : ''}`} onClick={toggleShuffle} style={{ color: isShuffle ? '#1ed760' : '#b3b3b3' }}>
            <Shuffle size={18} />
          </button>
          <button className="control-btn" onClick={playPrev}>
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button className="control-btn main" onClick={togglePlay} disabled={!currentTrack}>
            {isPlaying ? <Pause size={18} fill="#000" /> : <Play size={18} fill="#000" style={{ marginLeft: 2 }} />}
          </button>
          <button className="control-btn" onClick={playNext}>
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>

        <div className="progress-section">
          <span className="time-display">{formatTime(currentTime)}</span>
          <div className="progress-bar" ref={progressBarRef} onClick={handleProgressClick}>
            <div className="progress" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
          </div>
          <span className="time-display">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="volume-section">
        <button
          onClick={() => onVolumeChange(volume === 0 ? 100 : 0)}
          style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
        >
          {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="volume-slider"
        />
      </div>
    </div>
  );
};

export default Playbar;
