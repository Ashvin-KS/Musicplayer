import React from 'react';

const SearchResults = ({ searchResults, currentIndex, playTrack, loading, addToPlaylist, playlist, playSource }) => (
  <div className="main-content scrollable-content">
    <div className="search-results">
      <h2 style={{ minHeight: '2.5em', margin: 0 }}>Results</h2>
      {loading ? <div>Loading...</div> : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {searchResults.map((item, idx) => (
            <li key={item.id} className={playSource === 'results' && idx === currentIndex ? 'active playing-gradient' : ''}>
              <div className="thumbnail-container">
                <img src={item.thumbnail} alt="thumb" />
                <button className="play-button" onClick={() => playTrack(idx)}>
                  ▶
                </button>
              </div>
              
                <span>{item.title}</span>
               
              <button
                style={{ marginLeft: 8, fontSize: '1.1em', background: '#232', color: '#1db954', border: 'none', borderRadius: 4, padding: '0.2em 0.7em', cursor: 'pointer',right:"10px",position:"absolute" }}
                onClick={() => addToPlaylist(item)}
                disabled={playlist.some(track => track.id === item.id)}
                title={playlist.some(track => track.id === item.id) ? 'Already in playlist' : 'Add to playlist'}
              >
                +
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

export default SearchResults;
