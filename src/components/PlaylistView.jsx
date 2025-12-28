import React, { useRef } from 'react';
import { Play, Shuffle, Download, UserPlus, MoreHorizontal, Clock3, ChevronUp, ChevronDown } from 'lucide-react';

const PlaylistView = ({
    playlist,
    playTrack,
    currentTrack,
    updatePlaylist,
    reorderTrack,
    isShuffle,
    toggleShuffle
}) => {
    const fileInputRef = useRef(null);

    if (!playlist) return null;

    const totalTracks = playlist.tracks.length;
    const totalMins = Math.floor(totalTracks * 3.5);
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;

    const handleCoverClick = () => {
        fileInputRef.current?.click();
    };

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePlaylist(playlist.id, { coverImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="playlist-header">
                <div onClick={handleCoverClick} style={{ cursor: 'pointer' }}>
                    <img
                        src={playlist.coverImage || playlist.tracks[0]?.thumbnail || 'https://via.placeholder.com/232'}
                        alt={playlist.name}
                        className="header-cover"
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleCoverChange}
                    />
                </div>
                <div className="header-info">
                    <span className="type-text">Playlist</span>
                    <h1 className="playlist-name">{playlist.name}</h1>
                    <div className="owner-info">
                        ashvin • {totalTracks} songs{totalTracks > 0 && `, ${hours > 0 ? `${hours} hr ` : ''}${mins} min`}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="action-bar">
                <button className="btn-play-large" onClick={() => playTrack(playlist.tracks, 0)}>
                    <Play fill="#000" size={24} />
                </button>
                <Shuffle
                    className={`action-icon ${isShuffle ? 'active' : ''}`}
                    size={24}
                    onClick={toggleShuffle}
                />
                <Download className="action-icon" size={24} />
                <UserPlus className="action-icon" size={24} />
                <MoreHorizontal className="action-icon" size={24} />
            </div>

            {/* Track Table */}
            {playlist.tracks.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', color: '#b3b3b3' }}>
                    <p>No tracks yet. Search and add songs to this playlist!</p>
                </div>
            ) : (
                <table className="track-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Album</th>
                            <th>Date added</th>
                            <th style={{ textAlign: 'right' }}><Clock3 size={16} /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {playlist.tracks.map((track, idx) => {
                            const isActive = currentTrack?.id === track.id;
                            return (
                                <tr
                                    key={track.id}
                                    className={`track-row ${isActive ? 'active' : ''}`}
                                    onClick={() => playTrack(playlist.tracks, idx)}
                                >
                                    <td className="index-col">{idx + 1}</td>
                                    <td>
                                        <div className="title-col">
                                            <img src={track.thumbnail} alt="" className="track-thumb" />
                                            <div>
                                                <div className="track-title">{track.title}</div>
                                                <div className="track-artist">{track.artist || 'Unknown'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="album-col">{track.album || 'Single'}</td>
                                    <td className="date-col">Jun 30, 2024</td>
                                    <td className="duration-col">3:45</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div className="reorder-btns">
                                            <button
                                                className="reorder-btn"
                                                onClick={() => idx > 0 && reorderTrack(playlist.id, idx, idx - 1)}
                                                disabled={idx === 0}
                                            >
                                                <ChevronUp size={14} />
                                            </button>
                                            <button
                                                className="reorder-btn"
                                                onClick={() => idx < playlist.tracks.length - 1 && reorderTrack(playlist.id, idx, idx + 1)}
                                                disabled={idx === playlist.tracks.length - 1}
                                            >
                                                <ChevronDown size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PlaylistView;
