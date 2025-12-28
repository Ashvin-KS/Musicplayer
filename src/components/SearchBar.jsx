import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ query, setQuery, handleSearch, loading }) => (
  <form onSubmit={handleSearch} className="search-bar">
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      placeholder="What do you want to play?"
    />
    <button type="submit" disabled={loading}>
      {loading ? 'Searching...' : 'Search'}
    </button>
  </form>
);

export default SearchBar;
