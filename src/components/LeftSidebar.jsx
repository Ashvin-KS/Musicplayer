import React, { useState } from 'react';
import { Home, Search, Library, Plus, Trash2 } from 'lucide-react';

const LeftSidebar = ({
  playlists,
  activePlaylistId,
  setActivePlaylistId,
  currentView,
  setCurrentView,
  createPlaylist,
  deletePlaylist
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="left-sidebar">
      <div className="nav-section">
        <div
          className={`nav-item ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          <Home size={24} />
          <span>Home</span>
        </div>
        <div
          className={`nav-item ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => setCurrentView('search')}
        >
          <Search size={24} />
          <span>Search</span>
        </div>
      </div>

      <div className="library-section">
        <div className="library-header">
          <h3>
            <Library size={24} />
            Your Library
          </h3>
          <button onClick={() => setShowCreateForm(true)}>
            <Plus size={20} />
          </button>
        </div>

        {showCreateForm && (
          <div className="create-form">
            <input
              autoFocus
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="create-form-buttons">
              <button className="btn-cancel" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="btn-create" onClick={handleCreate}>Create</button>
            </div>
          </div>
        )}

        <div className="playlist-list">
          {playlists.map(playlist => (
            <div
              key={playlist.id}
              className={`playlist-item ${activePlaylistId === playlist.id ? 'active' : ''}`}
              onClick={() => setActivePlaylistId(playlist.id)}
            >
              <img
                src={playlist.coverImage || playlist.tracks[0]?.thumbnail || 'https://via.placeholder.com/48'}
                alt=""
              />
              <div className="playlist-info">
                <h4>{playlist.name}</h4>
                <span>Playlist • {playlist.tracks.length} songs</span>
              </div>
              {activePlaylistId === playlist.id && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                  style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
