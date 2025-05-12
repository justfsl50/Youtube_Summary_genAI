const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const { getVideoTranscript } = require('./utils/transcript');
const { generateTimestamps, generateSummary } = require('./utils/gemini');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Get video transcript
    const transcript = await getVideoTranscript(videoUrl);
    
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: 'No transcript found for this video' });
    }

    // Generate timestamps and summary using Gemini
    const timestamps = await generateTimestamps(transcript);
    const summary = await generateSummary(transcript);

    res.json({ timestamps, summary });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to process video' });
  }
});

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app; 