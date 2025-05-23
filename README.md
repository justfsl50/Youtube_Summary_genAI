# YouTube Timestamp & Summary Generator

A web application that uses Google's Gemini AI to automatically generate timestamps and summaries for YouTube videos.

## Features

- Enter a YouTube video URL and get AI-generated timestamps
- Receive a comprehensive summary of the video content
- Clickable timestamps that open the YouTube video at the specific time
- Modern, responsive UI

## Prerequisites

- Node.js (v14+)
- Google Gemini API key (get one at [https://ai.google.dev/](https://ai.google.dev/))

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/youtube-timestamp-generator.git
   cd youtube-timestamp-generator
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. Start the application:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## How It Works

1. The application extracts the transcript from the YouTube video
2. Gemini AI analyzes the transcript and identifies key moments
3. The AI generates a list of timestamps with descriptive titles
4. The AI also creates a comprehensive summary of the video content
5. Results are displayed in a user-friendly interface

## Technologies Used

- Node.js & Express
- Google Gemini AI
- YouTube Transcript API
- Bootstrap 5
- EJS Templates

## License

MIT #   Y o u t u b e _ S u m m a r y _ g e n A I 
 
 
