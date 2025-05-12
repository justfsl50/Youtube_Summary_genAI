# How to Use the YouTube Timestamp Generator

## Setting Up the App

1. **Get a Gemini API Key**
   - Go to [Google AI Studio](https://ai.google.dev/)
   - Sign in and navigate to the API keys section
   - Create a new API key
   - Copy the key for the next step

2. **Configure the Application**
   - Create a file named `.env` in the root of the project
   - Add the following content to the file:
     ```
     GEMINI_API_KEY=your_gemini_api_key_here
     PORT=3000
     ```
   - Replace `your_gemini_api_key_here` with the API key you obtained

3. **Start the Application**
   - Run the following command in your terminal:
     ```
     npm start
     ```
   - You should see a message: `Server running on http://localhost:3000`

## Using the Application

1. **Open the Application**
   - Go to [http://localhost:3000](http://localhost:3000) in your web browser

2. **Enter a YouTube URL**
   - Paste a YouTube video URL in the input field
   - Click the "Generate" button

3. **Wait for Processing**
   - The application will fetch the video transcript
   - Gemini AI will analyze the content
   - This process may take 10-30 seconds depending on the video length

4. **View Results**
   - Once processing is complete, you'll see:
     - A list of timestamps with descriptions
     - A comprehensive summary of the video
   - Click on any timestamp to open the YouTube video at that exact moment

## Troubleshooting

- **"No transcript found" Error**
  - Make sure the video has captions/subtitles available
  - Some videos have disabled transcripts or don't have any captions

- **API Key Issues**
  - Verify your API key is correct in the `.env` file
  - Check that you have sufficient quota in your Gemini AI account

- **Slow Processing**
  - Longer videos take more time to process
  - The Gemini API may have rate limits that slow down processing 