import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import './App.css';
import {
  MusicHeader,
  SearchBar,
  SearchResults,
  RightSidebar,
  Playbar,
  ErrorMessage,
  LeftSidebar
} from './components';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// LocalStorage keys
const LS_PLAYLISTS = 'musicapp_playlists';
const LS_SETTINGS = 'musicapp_settings';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [playSource, setPlaySource] = useState('results');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);

  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const containerRef = useRef(null);
  const isInitialMount = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    document.body.style.margin = '0';
    return () => {
      document.body.style.margin = '';
    };
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      handleSearch();
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    handleSearch({ preventDefault: () => {} });
  }, []);

  useEffect(() => {
    if (searchResults.length > 0 && !currentTrack) {
      playTrack(0);
    }
  }, [searchResults]);

  const playTrack = (idx) => {
    if (searchResults.length === 0) return;
    setCurrentIndex(idx);
    setCurrentTrack(searchResults[idx]);
    setPlaySource('results');
    setIsPlaying(true);
  };

  const playPlaylistTrack = (tracks, idx) => {
    if (!tracks || tracks.length === 0) return;
    setCurrentTrack(tracks[idx]);
    setCurrentIndex(idx);
    setPlaySource('playlist');
    setPlaylistTracks(tracks);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack && searchResults.length > 0) {
      playTrack(0);
      return;
    }
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (playSource === 'playlist' && playlistTracks.length > 0) {
      const next = (currentIndex + 1) % playlistTracks.length;
      playPlaylistTrack(playlistTracks, next);
    } else if (searchResults.length > 0) {
      const next = (currentIndex + 1) % searchResults.length;
      playTrack(next);
    }
  };

  const playPrev = () => {
    if (playSource === 'playlist' && playlistTracks.length > 0) {
      const prev = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
      playPlaylistTrack(playlistTracks, prev);
    } else if (searchResults.length > 0) {
      const prev = (currentIndex - 1 + searchResults.length) % searchResults.length;
      playTrack(prev);
    }
  };

  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    setDuration(playerRef.current.getDuration());
    if (isPlaying) {
      playerRef.current.playVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    setDuration(playerRef.current.getDuration());
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimer();
    } else if (
      event.data === YouTube.PlayerState.PAUSED ||
      event.data === YouTube.PlayerState.ENDED
    ) {
      setIsPlaying(false);
      stopTimer();
    }
    if (event.data === YouTube.PlayerState.ENDED) {
      playNext();
    }
  };

  const startTimer = () => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 250);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const toggleVideo = () => {
    setShowVideo((prev) => !prev);
  };

  const handleProgressBarClick = (e) => {
    if (!playerRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const minSidebar = 200;
        const maxSidebar = 520;
        let newWidth = 0;
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          newWidth = Math.max(minSidebar, Math.min(maxSidebar, rect.right - e.clientX));
        }
        setRightSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleAddToActivePlaylist = (track) => {
    if (!activePlaylistId) {
      alert('Please select a playlist first!');
      return;
    }
    setPlaylists(
      playlists.map((p) => {
        if (p.id === activePlaylistId) {
          const trackExists = p.tracks.some((t) => t.id === track.id);
          if (!trackExists) {
            return { ...p, tracks: [...p.tracks, track] };
          }
        }
        return p;
      })
    );
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, playNext, playPrev]);

  useEffect(() => {
    const savedPlaylists = localStorage.getItem(LS_PLAYLISTS);
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch {}
    }
    const savedSettings = localStorage.getItem(LS_SETTINGS);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (typeof settings.showVideo === 'boolean') setShowVideo(settings.showVideo);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(LS_PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify({ showVideo }));
  }, [showVideo]);

  const youtubeOpts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      modestbranding: 1,
    },
  };

  return (
    <div className="app-container" ref={containerRef}>
      <div className="sidebar left-sidebar" style={{ width: 365 }}>
        <LeftSidebar
          playlists={playlists}
          setPlaylists={setPlaylists}
          activePlaylistId={activePlaylistId}
          setActivePlaylistId={setActivePlaylistId}
          playPlaylistTrack={playPlaylistTrack}
        />
      </div>
      <div className="music-app" style={{ flex: 1, minWidth: 300, maxWidth: '100vw', overflow: 'auto' }}>
        <MusicHeader />
        <SearchBar query={query} setQuery={setQuery} handleSearch={handleSearch} loading={loading} />
        <ErrorMessage error={error} />
        {searchResults.length > 0 && (
          <SearchResults
            searchResults={searchResults}
            currentIndex={currentIndex}
            playTrack={playTrack}
            addToPlaylist={handleAddToActivePlaylist}
            playlist={[]}
            playSource={playSource}
          />
        )}
      </div>
      <div
        className="resizer"
        style={{ width: 8, cursor: 'col-resize', background: isResizing ? '#888' : '#222', zIndex: 10 }}
        onMouseDown={() => setIsResizing(true)}
        onDoubleClick={() => setRightSidebarWidth(320)}
        title="Drag to resize right sidebar"
      />
      <div
        className="sidebar right-sidebar"
        style={{ width: rightSidebarWidth, padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <RightSidebar
          showVideo={showVideo}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        >
          {currentTrack && (
            <YouTube
              videoId={currentTrack.id}
              opts={youtubeOpts}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              style={{ height: '100%', width: '100%' }}
            />
          )}
        </RightSidebar>
      </div>
      <Playbar
        isPlaying={isPlaying}
        playPrev={playPrev}
        playNext={playNext}
        togglePlay={togglePlay}
        toggleVideo={toggleVideo}
        showVideo={showVideo}
        currentTrack={currentTrack}
        progressBarRef={progressBarRef}
        handleProgressBarClick={handleProgressBarClick}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
      />
    </div>
  );
}

export default App;
