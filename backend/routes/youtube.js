import express from 'express';
import pkg from 'youtube-transcript';
const { getTranscript } = pkg;
import fetch from 'node-fetch';

const router = express.Router();

router.post('/transcript', async (req, res) => {
  const { link } = req.body;
  try {
    const videoId = extractVideoId(link);
    const transcript = await getTranscript(videoId);
    const blog = await generateBlogFromTranscript(transcript);
    res.json({ blog });
  } catch (error) {
    console.error('Error processing YouTube link:', error);
    res.status(500).json({ error: 'Failed to generate blog from YouTube link' });
  }
});

function extractVideoId(link) {
  const url = new URL(link);
  return url.searchParams.get('v');
}

async function generateBlogFromTranscript(transcript) {
  const response = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      prompt: `Generate a blog post from the following transcript:\n\n${transcript}`,
      max_tokens: 500,
    }),
  });
  const data = await response.json();
  return data.choices[0].text.trim();
}

export default router;
