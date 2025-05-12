const { YoutubeTranscript } = require('youtube-transcript');

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
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

module.exports = {
  getVideoTranscript
}; 