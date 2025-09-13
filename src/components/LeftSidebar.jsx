import React, { useState, useEffect } from 'react';

const LeftSidebar = ({
  playlists,
  setPlaylists,
  activePlaylistId,
  setActivePlaylistId,
  playPlaylistTrack,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  // Always get the selected playlist from the playlists prop
  const selectedPlaylist = playlists.find((p) => p.id === activePlaylistId) || null;

  // If the selected playlist is deleted or missing after reload, reset selection
  useEffect(() => {
    if (activePlaylistId && !selectedPlaylist) {
      setActivePlaylistId(null);
    }
  }, [playlists, activePlaylistId, selectedPlaylist, setActivePlaylistId]);

  // Create new playlist
  const createPlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist = {
      id: Date.now(),
      name: newPlaylistName.trim(),
      tracks: [],
      createdAt: new Date().toISOString()
    };
    setPlaylists([...playlists, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
  };

  // Delete playlist
  const deletePlaylist = (playlistId) => {
    setPlaylists(playlists.filter((p) => p.id !== playlistId));
    if (activePlaylistId === playlistId) {
      setActivePlaylistId(null);
    }
  };

  // Select playlist to view
  const selectPlaylist = (playlist) => {
    setActivePlaylistId(playlist.id);
  };

  // Go back to playlist list
  const goBackToPlaylists = () => {
    setActivePlaylistId(null);
  };

  // Add this prop to allow playing a playlist or a track
  const handlePlayPlaylist = () => {
    if (selectedPlaylist && selectedPlaylist.tracks.length > 0) {
      playPlaylistTrack(selectedPlaylist.tracks, 0);
    }
  };
  const handlePlayTrack = (trackIdx) => {
    if (selectedPlaylist) {
      playPlaylistTrack(selectedPlaylist.tracks, trackIdx);
    }
  };

  return (
    <div className="sidebar left-sidebar">
      <div className="playlist-section">
        <div className="playlist-header">
          <h3>Playlists</h3>
          {!selectedPlaylist && (
            <button 
              className="create-playlist-btn"
              onClick={() => setShowCreatePlaylist(true)}
            >
              + New Playlist
            </button>
          )}
        </div>

        {showCreatePlaylist && (
          <div className="create-playlist-form">
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
            />
            <div className="form-buttons">
              <button onClick={createPlaylist}>Create</button>
              <button onClick={() => setShowCreatePlaylist(false)}>Cancel</button>
            </div>
          </div>
        )}

        {!selectedPlaylist ? (
          // Playlist list view
          <div className="playlist-list">
            {playlists.length === 0 ? (
              <p className="no-playlists">No playlists yet. Create your first playlist!</p>
            ) : (
              playlists.map(playlist => {
                const cover = playlist.tracks[0]?.thumbnail;
                return (
                  <div
                    key={playlist.id}
                    className="playlist-item"
                    style={cover ? {
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(30,30,30,0.85)',
                    } : {}}
                  >
                    {cover && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          backgroundImage: `url(${cover})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(2px) brightness(0.5)',
                          zIndex: 0,
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <div style={{gap: 12, position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', width: '100%', minHeight: 90 }}>
                      {cover && (
                        <img
                          src={cover}
                          alt={playlist.name}
                          style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, marginRight: 18 }}
                        />
                      )}
                      <div className="playlist-info" onClick={() => selectPlaylist(playlist)}>
                        <h4>{playlist.name.length > 10 ? playlist.name.slice(0, 10) + '…' : playlist.name}</h4>
                        <span className="track-count">{playlist.tracks.length} tracks</span>
                      </div>
                      <button 
                        className="play-btn"
                        title="Play Playlist"
                        style={{
                          background: 'rgba(40,40,40,0.35)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          width: 44,
                          height: 44,
                          marginLeft: 8,
                          marginRight: 4,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.45), 0 1.5px 4px rgba(0,0,0,0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (playlist.tracks.length > 0) {
                            playPlaylistTrack(playlist.tracks, 0);
                          }
                        }}
                      >
                        <span className="btn-text">play</span>
                      </button>
                      <button 
                        className="delete-playlist-btn"
                        style={{
                          background: 'rgba(40,40,40,0.35)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          width: 44,
                          height: 44,
                          marginLeft: 4,
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          boxShadow: '0 4px 24px 0 rgba(0,0,0,0.45), 0 1.5px 4px rgba(0,0,0,0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => deletePlaylist(playlist.id)}
                      >
                        <span className="btn-text">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Individual playlist view
          <div className="playlist-details">
            <div className="playlist-details-header">
              <button className="back-btn" onClick={goBackToPlaylists}>
                ← Back
              </button>
              <h4>{selectedPlaylist.name}</h4>
              <button className="play-btn" style={{marginLeft: 12}} title="Play Playlist" onClick={handlePlayPlaylist}>
                ▶
              </button>
            </div>
            <div className="playlist-tracks">
              {selectedPlaylist.tracks.length === 0 ? (
                <p className="no-tracks">No tracks in this playlist yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {selectedPlaylist.tracks.map((track, idx) => (
                    <li key={track.id} className="playlist-track" style={{ display: 'flex', alignItems: 'center', position: 'relative', background: '#282828', borderRadius: 8, marginBottom: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', overflow: 'hidden', width: '100%' }}>
                      <div className="thumbnail-container">
                        <img src={track.thumbnail} alt="thumb" />
                        <button className="play-button" onClick={() => handlePlayTrack(idx)}>
                          ▶
                        </button>
                      </div>
                      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '1rem', textAlign: 'left' }}>{track.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
