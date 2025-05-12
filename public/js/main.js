document.addEventListener('DOMContentLoaded', () => {
  const videoUrlInput = document.getElementById('videoUrl');
  const generateBtn = document.getElementById('generateBtn');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const errorMessage = document.getElementById('errorMessage');
  const results = document.getElementById('results');
  const timestampList = document.getElementById('timestampList');
  const summaryContent = document.getElementById('summaryContent');

  generateBtn.addEventListener('click', handleGenerate);
  videoUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  });

  async function handleGenerate() {
    const videoUrl = videoUrlInput.value.trim();
    
    if (!isValidYoutubeUrl(videoUrl)) {
      showError('Please enter a valid YouTube URL');
      return;
    }

    // Reset UI
    resetUI();
    showLoading(true);

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate content');
      }

      displayResults(data);
    } catch (error) {
      showError(error.message);
    } finally {
      showLoading(false);
    }
  }

  function displayResults(data) {
    // Display timestamps
    timestampList.innerHTML = '';
    if (data.timestamps && data.timestamps.length > 0) {
      data.timestamps.forEach(timestamp => {
        const item = document.createElement('a');
        item.href = getYouTubeUrlWithTimestamp(videoUrlInput.value, timestamp.time);
        item.target = '_blank';
        item.className = 'list-group-item list-group-item-action';
        item.innerHTML = `<span class="timestamp-time">${timestamp.time}</span> ${timestamp.title}`;
        timestampList.appendChild(item);
      });
    } else {
      timestampList.innerHTML = '<div class="p-3">No timestamps could be generated.</div>';
    }

    // Display summary
    if (data.summary) {
      summaryContent.innerHTML = data.summary.split('\n').map(para => `<p>${para}</p>`).join('');
    } else {
      summaryContent.innerHTML = '<p>No summary could be generated.</p>';
    }

    // Show results
    results.classList.remove('d-none');
  }

  function isValidYoutubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
    return pattern.test(url);
  }

  function getYouTubeUrlWithTimestamp(url, timestamp) {
    // Extract video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    
    // Convert timestamp to seconds
    let seconds = 0;
    if (timestamp.includes(':')) {
      const parts = timestamp.split(':').map(Number);
      if (parts.length === 2) {
        // MM:SS format
        seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        // HH:MM:SS format
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    } else {
      seconds = parseInt(timestamp);
    }
    
    return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
  }

  function showLoading(isLoading) {
    if (isLoading) {
      loadingSpinner.classList.remove('d-none');
    } else {
      loadingSpinner.classList.add('d-none');
    }
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('d-none');
    results.classList.add('d-none');
  }

  function resetUI() {
    errorMessage.classList.add('d-none');
    results.classList.add('d-none');
    errorMessage.textContent = '';
  }
}); 