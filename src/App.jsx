import React, { useState, useRef, useEffect } from 'react';
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
import { getArtistInfo } from './components/aii'; // Re-add import getArtistInfo

const API_BASE = 'http://localhost:5000'; // Adjust if Flask runs elsewhere

// LocalStorage keys
const LS_PLAYLISTS = 'musicapp_playlists';
const LS_SETTINGS = 'musicapp_settings';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(320); // px, initial right sidebar width
  const [isResizing, setIsResizing] = useState(false);
  const [playSource, setPlaySource] = useState('results'); // 'results' or 'playlist'
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]); // <-- central playlists state
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const videoRef = useRef(null);
  const lastSyncTime = useRef(0);
  const containerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Remove body margin to use full viewport width
  useEffect(() => {
    document.body.style.margin = '0';
    return () => {
      document.body.style.margin = ''; // Revert on unmount
    };
  }, []);

  // Search YouTube via backend
  const handleSearch = async (e) => {
    console.log('handleSearch called from App.jsx');
    if (e) {
      console.log('Event prevented default');
      e.preventDefault();
    }
    console.log('Setting loading to true');
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      let data = await res.json();
      setSearchResults(data); // Do not fetch artist info here
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  };

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      handleSearch();
    }, 400); // 400ms debounce
    return () => clearTimeout(timeout);
  }, [query]);

  // Perform an initial search when the component mounts
  useEffect(() => {
    handleSearch({ preventDefault: () => {} }); // Pass a mock event object
  }, []);

  // Automatically play the first search result if available and no track is playing
  useEffect(() => {
    if (searchResults.length > 0 && !currentTrack) {
      playTrack(0);
    }
  }, [searchResults, currentTrack]);

  // Play selected track from search results
  const playTrack = async (idx) => {
    if (searchResults.length === 0) return;
    setLoading(true);
    setError('');
    setCurrentIndex(idx);
    setCurrentTrack(searchResults[idx]);
    const videoId = searchResults[idx].id;
    setAudioUrl(`${API_BASE}/play/${videoId}`);
    setIsPlaying(true);
    setCurrentTime(0);
    setPlaySource('results');
    setLoading(false);
  };

  // Play playlist track
  const playPlaylistTrack = (tracks, idx) => {
    if (!tracks || tracks.length === 0) return;
    setCurrentTrack(tracks[idx]);
    setCurrentIndex(idx);
    setAudioUrl(`${API_BASE}/play/${tracks[idx].id}`);
    setIsPlaying(true);
    setPlaySource('playlist');
    setPlaylistTracks(tracks);
  };

  // Play/pause toggle
  const togglePlay = () => {
    // If nothing is loaded but there are results, play the first track
    if (!currentTrack && searchResults.length > 0) {
      playTrack(0);
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      // Pause video if it exists
      if (videoRef.current && showVideo) {
        videoRef.current.contentWindow.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          '*'
        );
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      // Play video if it exists
      if (videoRef.current && showVideo) {
        videoRef.current.contentWindow.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          '*'
        );
      }
    }
  };

  // Next/prev controls
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

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      // No automatic video syncing when audio loads
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // No automatic video syncing during playback
    };
    const onEnded = playNext;
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, showVideo, currentTrack]);

  // Video toggle handler
  const toggleVideo = () => {
    setShowVideo((prev) => !prev);
  };
  
  // Manual sync function for immediate synchronization
  const syncVideoToAudio = () => {
    if (videoRef.current && audioRef.current && showVideo && currentTrack) {
      const currentAudioTime = audioRef.current.currentTime;
      console.log('Manual sync - Audio time:', currentAudioTime);
      
      // Reload the iframe with the current time to force sync
      const videoId = currentTrack.id;
      const startTime = Math.floor(currentAudioTime);
      const newSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&modestbranding=1&mute=1&start=${startTime}&autoplay=${isPlaying ? 1 : 0}`;
      
      videoRef.current.src = newSrc;
      lastSyncTime.current = startTime;
    }
  };
  
  // Handle video initialization when video mode is toggled
  useEffect(() => {
    if (showVideo && currentTrack && videoRef.current) {
      // Small delay to ensure iframe is loaded
      setTimeout(() => {
        // Only match play/pause state, no seeking
        if (isPlaying) {
          videoRef.current.contentWindow.postMessage(
            '{"event":"command","func":"playVideo","args":""}',
            '*'
          );
        } else {
          videoRef.current.contentWindow.postMessage(
            '{"event":"command","func":"pauseVideo","args":""}',
            '*'
          );
        }
      }, 1000); // 1 second delay for iframe to load
    }
  }, [showVideo, currentTrack, isPlaying]);

  // Seek in audio and sync video
  const handleProgressBarClick = (e) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    
    // Set audio time
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    
    // Sync video by reloading iframe with new start time
    if (videoRef.current && showVideo && currentTrack) {
      setTimeout(() => {
        console.log('Timeline sync - Seeking to time:', seekTime);
        const videoId = currentTrack.id;
        const startTime = Math.floor(seekTime);
        const newSrc = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=0&rel=0&modestbranding=1&mute=1&start=${startTime}&autoplay=${isPlaying ? 1 : 0}`;
        
        videoRef.current.src = newSrc;
        lastSyncTime.current = startTime;
      }, 100);
    }
  };

  // Format time
  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Mouse event handlers for resizing
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

  // Add to playlist for active playlist in left sidebar
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

  // Keyboard controls for play/pause, next, prev
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

  // --- Load from localStorage on mount ---
  useEffect(() => {
    const savedPlaylists = localStorage.getItem(LS_PLAYLISTS);
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists));
      } catch {}
    }
    // Settings
    const savedSettings = localStorage.getItem(LS_SETTINGS);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (typeof settings.showVideo === 'boolean') setShowVideo(settings.showVideo);
      } catch {}
    }
  }, []);

  // --- Save playlists to localStorage when changed ---
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    localStorage.setItem(LS_PLAYLISTS, JSON.stringify(playlists));
  }, [playlists]);

  // --- Save settings to localStorage when changed ---
  useEffect(() => {
    localStorage.setItem(LS_SETTINGS, JSON.stringify({ showVideo }));
  }, [showVideo]);

  return (
    <div className="app-container" ref={containerRef}>
      <div
        className="sidebar left-sidebar"
        style={{ width: 365 }}
      >
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
          // Pass artist and view_count to SearchResults
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
          videoRef={videoRef}
          isPlaying={isPlaying}
        />
      </div>
      <Playbar
        audioRef={audioRef}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
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
