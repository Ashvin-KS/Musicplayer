import React from 'react';
import { Home, Search, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';

const TopBar = ({ query, setQuery, handleSearch, loading, currentView, setView }) => {
    return (
        <div className="top-bar">
            <div className="nav-controls">
                <button className="nav-btn"><ChevronLeft size={20} /></button>
                <button className="nav-btn"><ChevronRight size={20} /></button>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                    className={`sidebar-icon ${currentView === 'home' ? 'active' : ''}`}
                    onClick={() => setView('home')}
                    style={{ width: 48, height: 48, background: 'rgba(0,0,0,0.5)', borderRadius: '50%' }}
                >
                    <Home size={24} />
                </div>

                <div className="search-container">
                    <Search size={20} color="#b3b3b3" />
                    <form onSubmit={handleSearch} style={{ flex: 1 }}>
                        <input
                            type="text"
                            placeholder="What do you want to play?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </form>
                    <div style={{ padding: '0 8px', borderLeft: '1px solid #333' }}>
                        <LayoutGrid size={20} color="#b3b3b3" />
                    </div>
                </div>
            </div>

            <div style={{ position: 'absolute', right: 24, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button className="nav-btn" style={{ width: 'auto', borderRadius: '500px', padding: '0 12px', fontSize: '12px', fontWeight: '700' }}>Explore Premium</button>
                <button className="nav-btn" style={{ borderRadius: '50%' }}><LayoutGrid size={20} /></button>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#A020F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>A</div>
            </div>
        </div>
    );
};

export default TopBar;
