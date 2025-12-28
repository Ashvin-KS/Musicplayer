import React, { useState, useRef, useEffect, useCallback } from 'react';
import YouTube from 'react-youtube';
import './App.css';
import {
  LeftSidebar,
  PlaylistView,
  SearchResults,
  RightSidebar,
  Playbar,
  ErrorMessage
} from './components';
import { Home, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LS_PLAYLISTS = 'musicapp_playlists';

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
  const [playlists, setPlaylists] = useState([]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [volume, setVolume] = useState(100);
  const [isShuffle, setIsShuffle] = useState(false);
  const [playQueue, setPlayQueue] = useState([]);

  const playerRef = useRef(null);
  const progressBarRef = useRef(null);
  const intervalRef = useRef(null);

  // Search
  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setCurrentView('search');
    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      setError('Search failed');
    }
    setLoading(false);
  }, [query]);

  // Play track - plays the exact song clicked, stores the playlist for navigation
  const playTrack = useCallback((tracks, idx) => {
    if (!tracks || tracks.length === 0) return;
    setPlayQueue([...tracks]); // Keep original order in queue
    setCurrentIndex(idx);
    setCurrentTrack(tracks[idx]); // Play the exact song clicked
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
    setIsPlaying(prev => !prev);
  }, [isPlaying]);

  const playNext = useCallback(() => {
    if (playQueue.length === 0) return;
    let nextIdx;
    if (isShuffle) {
      // Random next (but not the same track)
      do {
        nextIdx = Math.floor(Math.random() * playQueue.length);
      } while (nextIdx === currentIndex && playQueue.length > 1);
    } else {
      nextIdx = (currentIndex + 1) % playQueue.length;
    }
    setCurrentIndex(nextIdx);
    setCurrentTrack(playQueue[nextIdx]);
  }, [playQueue, currentIndex, isShuffle]);

  const playPrev = useCallback(() => {
    if (playQueue.length === 0) return;

    // If more than 10 seconds into the song, restart it
    if (currentTime > 10 && playerRef.current) {
      playerRef.current.seekTo(0, true);
      setCurrentTime(0);
      return;
    }

    // Otherwise go to previous track
    const prev = (currentIndex - 1 + playQueue.length) % playQueue.length;
    setCurrentIndex(prev);
    setCurrentTrack(playQueue[prev]);
  }, [playQueue, currentIndex, currentTime]);

  // YouTube callbacks
  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(volume);
    setDuration(playerRef.current.getDuration());
    if (isPlaying) playerRef.current.playVideo();
  };

  const onPlayerStateChange = (event) => {
    setDuration(playerRef.current?.getDuration() || 0);
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true);
      startTimer();
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopTimer();
    } else if (event.data === YouTube.PlayerState.ENDED) {
      playNext();
    }
  };

  const startTimer = () => {
    stopTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current) setCurrentTime(playerRef.current.getCurrentTime());
    }, 250);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleProgressClick = (e) => {
    if (!playerRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    playerRef.current.seekTo(percent * duration, true);
  };

  const handleVolumeChange = (v) => {
    setVolume(v);
    if (playerRef.current) playerRef.current.setVolume(v);
  };

  const formatTime = (t) => {
    if (isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  // Playlist management
  const handleAddToPlaylist = (track) => {
    if (!activePlaylistId) return alert('Select a playlist first');
    setPlaylists(prev => prev.map(p => {
      if (p.id === activePlaylistId && !p.tracks.find(t => t.id === track.id)) {
        return { ...p, tracks: [...p.tracks, track] };
      }
      return p;
    }));
  };

  const updatePlaylist = (id, updates) => {
    setPlaylists(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const reorderTrack = (playlistId, fromIdx, toIdx) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        const tracks = [...p.tracks];
        const [removed] = tracks.splice(fromIdx, 1);
        tracks.splice(toIdx, 0, removed);
        return { ...p, tracks };
      }
      return p;
    }));
  };

  const createPlaylist = (name) => {
    const newPlaylist = { id: Date.now(), name, tracks: [], coverImage: null };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const deletePlaylist = (id) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (activePlaylistId === id) {
      setActivePlaylistId(null);
      setCurrentView('home');
    }
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  // Load playlists - try localStorage first, then server
  useEffect(() => {
    const load = async () => {
      // First load from localStorage for immediate display
      const saved = localStorage.getItem(LS_PLAYLISTS);
      if (saved) {
        try {
          const localData = JSON.parse(saved);
          if (Array.isArray(localData) && localData.length > 0) {
            setPlaylists(localData);
          }
        } catch (e) {
          console.error('Failed to parse localStorage:', e);
        }
      }

      // Then try to sync with server (server is source of truth if available)
      try {
        const res = await fetch(`${API_BASE}/playlists`);
        if (res.ok) {
          const serverData = await res.json();
          if (Array.isArray(serverData) && serverData.length > 0) {
            setPlaylists(serverData);
            localStorage.setItem(LS_PLAYLISTS, JSON.stringify(serverData));
          }
        }
      } catch (e) {
        console.log('Server unavailable, using localStorage');
      }
    };
    load();
  }, []);

  const isInitialMount = useRef(true);

  useEffect(() => {
    // Don't save on initial mount - wait for load to complete
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Save to localStorage
    localStorage.setItem(LS_PLAYLISTS, JSON.stringify(playlists));
    // Sync to server
    fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlists)
    }).catch(() => { });
  }, [playlists]);

  const activePlaylist = playlists.find(p => p.id === activePlaylistId);

  return (
    <div className="app-container">
      <div className="main-wrapper">
        <LeftSidebar
          playlists={playlists}
          activePlaylistId={activePlaylistId}
          setActivePlaylistId={(id) => { setActivePlaylistId(id); setCurrentView('playlist'); }}
          currentView={currentView}
          setCurrentView={setCurrentView}
          createPlaylist={createPlaylist}
          deletePlaylist={deletePlaylist}
        />

        <div className="main-view">
          {/* Top Bar */}
          <div className="top-bar">
            <div
              className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentView('home')}
              style={{ padding: '8px 16px', borderRadius: '500px', background: currentView === 'home' ? '#fff' : '#242424', color: currentView === 'home' ? '#000' : '#fff' }}
            >
              <Home size={20} />
            </div>
            <form onSubmit={handleSearch} className="search-container">
              <Search size={20} color="#b3b3b3" />
              <input
                type="text"
                placeholder="What do you want to play?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>

          <ErrorMessage error={error} />

          {currentView === 'home' && (
            <div style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '24px' }}>Good afternoon</h2>
              {playlists.length > 0 && (
                <div className="results-grid">
                  {playlists.map(p => (
                    <div
                      key={p.id}
                      className="result-card"
                      onClick={() => { setActivePlaylistId(p.id); setCurrentView('playlist'); }}
                    >
                      <img src={p.coverImage || p.tracks[0]?.thumbnail || 'https://via.placeholder.com/180'} alt="" />
                      <h4>{p.name}</h4>
                      <span className="subtitle">Playlist • {p.tracks.length} songs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {currentView === 'search' && (
            <SearchResults
              searchResults={searchResults}
              loading={loading}
              playTrack={(idx) => playTrack(searchResults, idx)}
              addToPlaylist={handleAddToPlaylist}
              currentTrack={currentTrack}
            />
          )}

          {currentView === 'playlist' && activePlaylist && (
            <PlaylistView
              playlist={activePlaylist}
              playTrack={playTrack}
              currentTrack={currentTrack}
              updatePlaylist={updatePlaylist}
              reorderTrack={reorderTrack}
              isShuffle={isShuffle}
              toggleShuffle={toggleShuffle}
            />
          )}
        </div>

        <RightSidebar currentTrack={currentTrack}>
          {currentTrack && (
            <YouTube
              videoId={currentTrack.id}
              opts={{ height: '0', width: '0', playerVars: { autoplay: 1 } }}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
            />
          )}
        </RightSidebar>
      </div>

      <Playbar
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        playNext={playNext}
        playPrev={playPrev}
        currentTrack={currentTrack}
        progressBarRef={progressBarRef}
        handleProgressClick={handleProgressClick}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isShuffle={isShuffle}
        toggleShuffle={toggleShuffle}
      />
    </div>
  );
}

export default App;
