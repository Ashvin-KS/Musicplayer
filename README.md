# Music Streaming Web App

This is a music streaming web application with a React frontend and a Flask backend. It uses YouTube as a source for audio content, allowing users to search for music, manage playlists, and stream audio directly in the browser.

## Features

-   **YouTube Search:** Search for music and playlists on YouTube.
-   **Playlist Management:** View and manage playlists.
-   **Audio Streaming:** Stream audio from YouTube videos with a Spotify-style playbar that includes play, pause, next, previous, and a draggable progress bar.
-   **Responsive UI:** A modern and responsive user interface.

## Setup and Installation

To run this application, you need to set up both the backend and the frontend.

### Backend (Flask)

1.  **Navigate to the project directory:**
    ```sh
    cd webdev/music_app
    ```

2.  **Create a Python virtual environment:**
    ```sh
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    *   On Windows:
        ```sh
        venv\Scripts\activate
        ```
    *   On macOS and Linux:
        ```sh
        source venv/bin/activate
        ```

4.  **Install the required Python packages:**
    ```sh
    pip install Flask Flask-Cors yt-dlp requests
    ```

5.  **Run the backend server:**
    ```sh
    python app.py
    ```
    The backend server will start on `http://127.0.0.1:5000`.

### Frontend (React)

1.  **Navigate to the project directory** (if you're not already there):
    ```sh
    cd webdev/music_app
    ```

2.  **Install the required Node.js packages:**
    ```sh
    npm install
    ```

3.  **Run the frontend development server:**
    ```sh
    npm run dev
    ```
    The frontend development server will start, typically on `http://localhost:5173`.

## Running the Application

1.  Start the backend server first by running `python app.py`.
2.  Then, start the frontend server by running `npm run dev`.
3.  Open your browser and navigate to the URL provided by the frontend development server (e.g., `http://localhost:5173`).
