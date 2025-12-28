import React from 'react';
import { Play, Plus, Check } from 'lucide-react';

const SearchResults = ({ searchResults, loading, playTrack, addToPlaylist, currentTrack }) => {
  if (loading) {
    return <div style={{ padding: '24px', color: '#b3b3b3' }}>Searching...</div>;
  }

  if (searchResults.length === 0) {
    return <div style={{ padding: '24px', color: '#b3b3b3' }}>No results. Try searching for something!</div>;
  }

  return (
    <div className="search-results">
      <h2>Results</h2>
      <div className="results-grid">
        {searchResults.map((item, idx) => {
          const isPlaying = currentTrack?.id === item.id;
          return (
            <div key={item.id} className="result-card">
              <div className="thumb-wrap">
                <img src={item.thumbnail} alt={item.title} />
                <button className="play-btn" onClick={() => playTrack(idx)}>
                  <Play fill="#000" size={24} />
                </button>
              </div>
              <h4 style={{ color: isPlaying ? '#1ed760' : '#fff' }}>{item.title}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="subtitle">Song</span>
                <button
                  onClick={(e) => { e.stopPropagation(); addToPlaylist(item); }}
                  style={{ background: 'transparent', border: 'none', color: '#b3b3b3', cursor: 'pointer' }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchResults;
