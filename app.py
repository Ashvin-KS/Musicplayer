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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists("dist/" + path):
        return send_from_directory('dist', path)
    else:
        return send_from_directory('dist', 'index.html')

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

@app.route('/play/<video_id>')
def play(video_id):
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'noplaylist': True,
    }
    url = f'https://www.youtube.com/watch?v={video_id}'
    try:
        from time import time
        cache_entry = audio_url_cache.get(video_id)
        if cache_entry and cache_entry['expires_at'] > time():
            audio_url = cache_entry['url']
        else:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                audio_url = info.get('url')
                print(f"Audio URL for {video_id}: {audio_url}")
                if not audio_url:
                    print(f"No audio URL found for video {video_id}")
                    return Response(status=404)
                audio_url_cache[video_id] = {'url': audio_url, 'expires_at': time() + 2*60*60}

        # Handle Range requests for seeking
        range_header = request.headers.get('Range', None)
        headers = {}
        import requests
        with requests.get(audio_url, stream=True) as r:
            total_length = int(r.headers.get('content-length', 0))
        if audio_url.endswith('.m4a') or '.m4a?' in audio_url:
            mimetype = 'audio/mp4'
        else:
            mimetype = 'audio/webm'

        if range_header:
            # Parse Range header
            import re
            m = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if m:
                start = int(m.group(1))
                end = int(m.group(2)) if m.group(2) else total_length - 1
                headers['Range'] = f'bytes={start}-{end}'
                length = end - start + 1
                def generate():
                    with requests.get(audio_url, headers=headers, stream=True) as r:
                        for chunk in r.iter_content(chunk_size=4096):
                            if chunk:
                                yield chunk
                rv = Response(generate(), status=206, mimetype=mimetype)
                rv.headers.add('Content-Range', f'bytes {start}-{end}/{total_length}')
                rv.headers.add('Accept-Ranges', 'bytes')
                rv.headers.add('Content-Length', str(length))
                return rv
        # No Range header, stream whole file
        def generate():
            with requests.get(audio_url, stream=True) as r:
                for chunk in r.iter_content(chunk_size=4096):
                    if chunk:
                        yield chunk
        rv = Response(generate(), mimetype=mimetype)
        rv.headers.add('Accept-Ranges', 'bytes')
        rv.headers.add('Content-Length', str(total_length))
        return rv
    except Exception as e:
        print(f"Error playing video {video_id}: {e}")
        return Response(status=500, response=f"Error fetching audio stream: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
