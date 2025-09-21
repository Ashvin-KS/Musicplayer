import React from 'react';

const PLACEHOLDER_IMAGE = 'https://imgs.search.brave.com/_El4hVIjHgeB8y4J0ZGGx1WFMH324o5Om6622gP9JNg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zLndp/ZGdldC1jbHViLmNv/bS9zYW1wbGVzL0I2/aDk2UVB1MUFnYm5G/bkZpaDA2TEdQRmsx/UzIvZGVId1BzczBj/b3hRTEVINHBYUEwv/MDVCNDZDNjYtOEIz/NC00NTQ4LUE4MkQt/QzEwREIxNzlFREE2/LmpwZz9xPTcw';
const PLACEHOLDER_TEXT = 'No track playing...';

const Playbar = ({
  isPlaying,
  playPrev,
  playNext,
  togglePlay,
  toggleVideo,
  showVideo,
  currentTrack,
  progressBarRef,
  handleProgressBarClick,
  currentTime,
  duration,
  formatTime
}) => (
  <div className="playbar">
    <div className="track-info">
      <div className="current-track-info">
        <img
          src={currentTrack ? currentTrack.thumbnail : PLACEHOLDER_IMAGE}
          alt="thumb"
        />
        <span>{currentTrack ? currentTrack.title : PLACEHOLDER_TEXT}</span>
      </div>
    </div>
    <div className="playbar-controls">
      <div className="playbar-buttons">
        <button onClick={playPrev} disabled={!currentTrack}>⏮</button>
        <button onClick={togglePlay} disabled={!currentTrack}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={playNext} disabled={!currentTrack}>⏭</button>
      </div>
      <div className="progress-section">
        <span className="time">{formatTime(currentTime)}</span>
        <div
          className="progress-bar"
          ref={progressBarRef}
          onClick={handleProgressBarClick}
        >
          <div
            className="progress"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
        </div>
        <span className="time">{formatTime(duration)}</span>
      </div>
    </div>
    <button onClick={toggleVideo} className="video-toggle" title="Toggle Video">
      {showVideo ? '🎥' : '📺'}
    </button>
  </div>
);

export default Playbar;
