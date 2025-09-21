
import React from 'react';

const SearchBar = ({ query, setQuery, handleSearch, loading }) => (
  <form onSubmit={handleSearch} className="search-bar">
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="Search YouTube..."
      autoComplete="off"
    />
    <button type="submit" disabled={loading} className={loading ? 'loading' : ''} onClick={() => console.log('Search button clicked')}>
      {loading ? 'Loading...' : 'Search'}
    </button>
  </form>
);

export default SearchBar;
