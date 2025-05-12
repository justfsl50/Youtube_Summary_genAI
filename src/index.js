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
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// For debugging on Vercel
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint for Vercel
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!process.env.GEMINI_API_KEY
    }
  });
});

// Routes
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/generate', async (req, res) => {
  try {
    console.log('Generate request received:', JSON.stringify(req.body));
    const { videoUrl } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    console.log('Fetching transcript for:', videoUrl);
    // Get video transcript
    const transcript = await getVideoTranscript(videoUrl);
    
    if (!transcript || transcript.length === 0) {
      console.log('No transcript found for video:', videoUrl);
      return res.status(404).json({ error: 'No transcript found for this video' });
    }

    console.log('Transcript found, length:', transcript.length);
    console.log('Generating timestamps and summary...');
    
    // Generate timestamps and summary using Gemini
    let timestamps, summary;
    try {
      timestamps = await generateTimestamps(transcript);
    } catch (timestampError) {
      console.error('Error generating timestamps:', timestampError);
      timestamps = [
        { time: "0:00", title: "Video Start" },
        { time: "5:00", title: "Main Content" }
      ];
    }

    try {
      summary = await generateSummary(transcript);
    } catch (summaryError) {
      console.error('Error generating summary:', summaryError);
      summary = "Unable to generate summary. Please try again later.";
    }

    console.log('Successfully generated content');
    res.json({ timestamps, summary });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Failed to process video', 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Special route for favicon
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app; 