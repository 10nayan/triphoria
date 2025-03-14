import React, { useState } from 'react';
import config from '../config';

function YouTubeLinkForm() {
  const [link, setLink] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/youtube-transcript/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ link }),
      });
      const data = await response.json();
      console.log('Generated Blog:', data.blog);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  return (
    <div>
      <h2>Enter YouTube Video Link</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter YouTube link"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default YouTubeLinkForm;
