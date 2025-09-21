# app.py

from flask import Flask, send_from_directory, request, jsonify, Response
import os
from flask_cors import CORS
import yt_dlp
import requests

app = Flask(__name__)
CORS(app)

# In-memory cache for audio URLs
audio_url_cache = {}

def search_youtube(query):
    """Searches YouTube for videos and playlists."""
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': 'in_playlist',
        'default_search': 'ytsearch20',  # Search for 20 items
        'match_filter': yt_dlp.utils.match_filter_func('duration > 60')
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(query, download=False)
            entries = result.get('entries', [])
            
            search_results = []
            for entry in entries:
                is_playlist = entry.get('_type') == 'playlist'
                search_results.append({
                    'id': entry['id'],
                    'title': entry.get('title', 'Untitled'),
                    'is_playlist': is_playlist,
                    'thumbnail': entry.get('thumbnails', [{}])[-1].get('url') if entry.get('thumbnails') else f'https://i.ytimg.com/vi/{entry["id"]}/hqdefault.jpg'
                })
            return search_results
    except Exception as e:
        print(f"Error in search_youtube: {e}")
        return []

def get_playlist_items(playlist_id):
    """Fetches all video entries from a given YouTube playlist ID."""
    ydl_opts = {
        'quiet': True,
        'skip_download': True,
        'extract_flat': True,
        'playlist_items': '1-100'  # Limit to first 100 items to prevent abuse
    }
    url = f'https://www.youtube.com/playlist?list={playlist_id}'
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=False)
            entries = result.get('entries', [])
            return [
                {
                    'id': entry['id'],
                    'title': entry.get('title', 'Untitled'),
                    'thumbnail': f'https://i.ytimg.com/vi/{entry["id"]}/mqdefault.jpg'
                }
                for entry in entries if entry  # Filter out potential None entries
            ]
    except Exception as e:
        print(f"Error in get_playlist_items: {e}")
        return []

@app.route('/')
def serve_index():
    return send_from_directory('dist', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('dist', filename)

@app.route('/search')
def search():
    query = request.args.get('q')
    if not query:
        return jsonify([])
    results = search_youtube(query)
    return jsonify(results)

@app.route('/get_playlist_items/<playlist_id>')
def fetch_playlist(playlist_id):
    results = get_playlist_items(playlist_id)
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 10000)))