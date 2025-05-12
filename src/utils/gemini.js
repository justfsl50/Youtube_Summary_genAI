const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Gemini API with key from environment variables
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyACPhYe_LDjNFJhG7-sy-gLBU_l_YgGqGc"; // Fallback to hardcoded key if env var not found
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate timestamps from transcript
 * @param {Array} transcript - Video transcript
 * @returns {Promise<Array>} - Array of timestamps with titles
 */
async function generateTimestamps(transcript) {
  try {
    const transcriptText = transcript.map(item =>
      `${formatTime(item.offset / 1000)}: ${item.text}`
    ).join('\n');

    const prompt = `
      You are a smart assistant that generates clear, engaging YouTube timestamps from video transcripts.

Your task:

Read the full transcript and extract 5–10 meaningful segments or topic changes.

Assign each segment a concise title (under 60 characters) that accurately reflects the content.

Determine the exact timestamp (in mm:ss or h:mm:ss format) where each topic begins.

Ensure timestamps are spread throughout the video and not clustered at the beginning.

Avoid vague titles like "Topic 1" or "Discussion" — be specific and helpful to viewers.

Output format:

Return a JSON array of objects with the following format:

[
  {"time": "0:00", "title": "Video Introduction"},
  {"time": "2:13", "title": "How the Algorithm Works"},
  ...
]
Here's the transcript:
      ${transcriptText}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Raw Gemini response:", text);

    // Try to extract JSON from the response, with improved error handling
    let timestamps = [];
    try {
      // First attempt: Try to parse the whole response as JSON
      timestamps = JSON.parse(text);
    } catch (parseError) {
      console.log("Couldn't parse full response as JSON, trying to extract JSON portion...");

      // Second attempt: Try to extract JSON array using regex
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          timestamps = JSON.parse(jsonMatch[0]);
        } catch (nestedError) {
          console.log("Extracted text still not valid JSON:", jsonMatch[0]);
        }
      }

      // Third attempt: Manually extract and format the data
      if (timestamps.length === 0) {
        // Look for patterns like "time": "0:00", "title": "Introduction"
        const timeMatches = text.match(/"time"\s*:\s*"([^"]*)"/g);
        const titleMatches = text.match(/"title"\s*:\s*"([^"]*)"/g);

        if (timeMatches && titleMatches && timeMatches.length === titleMatches.length) {
          for (let i = 0; i < timeMatches.length; i++) {
            const time = timeMatches[i].match(/"time"\s*:\s*"([^"]*)"/)[1];
            const title = titleMatches[i].match(/"title"\s*:\s*"([^"]*)"/)[1];
            timestamps.push({ time, title });
          }
        }
      }
    }

    // Check if all timestamps are 0:00 or empty and fix if needed
    if (timestamps.length > 0) {
      let allZeroTimestamps = true;
      for (const ts of timestamps) {
        if (ts.time !== "0:00" && ts.time !== "") {
          allZeroTimestamps = false;
          break;
        }
      }

      // If all timestamps are 0:00, distribute them evenly across the video
      if (allZeroTimestamps) {
        console.log("All timestamps are 0:00, redistributing...");
        const videoDuration = transcript[transcript.length - 1].offset / 1000;
        const segmentSize = videoDuration / (timestamps.length + 1);

        for (let i = 0; i < timestamps.length; i++) {
          const timePosition = Math.floor(segmentSize * (i + 1));
          timestamps[i].time = formatTime(timePosition);
        }
      }
    }

    // If we still have no timestamps, create a default set
    if (timestamps.length === 0) {
      console.log("Failed to extract timestamps, creating default set");
      const videoDuration = transcript[transcript.length - 1].offset / 1000;

      return [
        { time: "0:00", title: "Introduction" },
        { time: formatTime(videoDuration * 0.2), title: "First Key Point" },
        { time: formatTime(videoDuration * 0.4), title: "Second Key Point" },
        { time: formatTime(videoDuration * 0.6), title: "Third Key Point" },
        { time: formatTime(videoDuration * 0.8), title: "Fourth Key Point" },
        { time: formatTime(videoDuration * 0.95), title: "Conclusion" }
      ];
    }

    return timestamps;
  } catch (error) {
    console.error('Error generating timestamps:', error);
    throw error;
  }
}

/**
 * Generate a summary from transcript
 * @param {Array} transcript - Video transcript
 * @returns {Promise<string>} - Summary text
 */
async function generateSummary(transcript) {
  try {
    const transcriptText = transcript.map(item => item.text).join(' ');

    const prompt = `
      You are a helpful assistant that creates concise, informative summaries of YouTube videos.
      
      I'll provide you with a video transcript. Your task is to:
      1. Analyze the transcript and identify the main topics and key points
      2. Create a comprehensive summary (300-500 words) that captures the essence of the video
      3. Make the summary easy to read with clear paragraphs and structure
      
      Here's the transcript:
      ${transcriptText}
    `;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error in Gemini API response for summary:', error);

      // Provide a fallback summary based on the transcript
      const wordCount = transcriptText.split(' ').length;
      const videoLengthMinutes = Math.floor(transcript[transcript.length - 1].offset / 60000);

      return `This video is approximately ${videoLengthMinutes} minutes long and contains ${wordCount} words of transcript. 
      
The transcript begins with: "${transcript[0].text} ${transcript[1].text} ${transcript[2].text}..."

And concludes with: "...${transcript[transcript.length - 3].text} ${transcript[transcript.length - 2].text} ${transcript[transcript.length - 1].text}"

Unable to generate a complete AI summary. Please try again later or check the timestamps for key moments in the video.`;
    }
  } catch (error) {
    console.error('Error generating summary:', error);
    return "Unable to generate summary due to an error. Please try again later.";
  }
}

/**
 * Format seconds into a time string (MM:SS or HH:MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

module.exports = {
  generateTimestamps,
  generateSummary
}; 