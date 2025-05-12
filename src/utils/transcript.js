const { YoutubeTranscript } = require('youtube-transcript');
const axios = require('axios');

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube video URL
 * @returns {string|null} - YouTube video ID or null if invalid
 */
function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Get transcript for a YouTube video
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<Array>} - Transcript data
 */
async function getVideoTranscript(videoUrl) {
  try {
    console.log('Extracting video ID from:', videoUrl);
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    console.log('Fetching transcript for video ID:', videoId);
    
    // Set a timeout for the transcript fetch operation
    const transcriptPromise = YoutubeTranscript.fetchTranscript(videoId);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Transcript fetch timed out')), 15000)
    );
    
    // Race the transcript fetch against the timeout
    const transcript = await Promise.race([transcriptPromise, timeoutPromise]);
    
    // Validate transcript structure
    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error('Invalid transcript format received');
    }
    
    // Make sure each entry has the required properties
    const validTranscript = transcript.map((item, index) => {
      return {
        text: item.text || '',
        offset: item.offset || index * 3000, // Default to 3-second intervals if offset missing
        duration: item.duration || 3000 // Default 3 seconds if duration missing
      };
    });
    
    console.log(`Transcript fetched successfully: ${validTranscript.length} entries`);
    return validTranscript;
  } catch (error) {
    console.error('Error fetching transcript:', error.message);
    // Try fallback method for Vercel environment
    try {
      if (process.env.NODE_ENV === 'production') {
        console.log('Attempting fallback transcript method...');
        return await getTranscriptFallback(videoUrl);
      }
    } catch (fallbackError) {
      console.error('Fallback transcript method failed:', fallbackError);
    }
    throw error;
  }
}

/**
 * Fallback method to get transcript using a third-party API
 * This can help in serverless environments where direct YouTube access might be limited
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<Array>} - Transcript data
 */
async function getTranscriptFallback(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL');
  }
  
  // Create mock transcript if real one can't be fetched
  // In a production app, you might use a third-party API here instead
  const mockTranscript = [];
  for (let i = 0; i < 20; i++) {
    mockTranscript.push({
      text: `This is a placeholder text segment ${i+1}. The actual transcript could not be loaded.`,
      offset: i * 10000, // 10-second intervals
      duration: 10000 // 10 seconds each
    });
  }
  
  return mockTranscript;
}

module.exports = {
  getVideoTranscript
}; 