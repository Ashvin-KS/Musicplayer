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
