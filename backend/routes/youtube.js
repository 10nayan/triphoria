import express from 'express';
import { YoutubeTranscript } from 'youtube-transcript';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/transcript', async (req, res) => {
  const { link } = req.body;
  try {
    const videoId = extractVideoId(link);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
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
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert SEO blog writer specializing in transforming YouTube video transcripts into well-structured, engaging, and SEO-optimized travel blogs. Your task is to remove filler words, improve readability, and structure content with proper headings(H2, H3), bullet points, SEO keywords and engaging descriptions. Ensure the blog remains engaging, natural, and informative while maintaining the original storytelling tone. Include SEO-friendly keywords like travel guide, best places to visit, and top things to do. Add Travel tips and FAQs at the end for SEO. Blog title should have Traveller type(Solo, Couple, Family, Budget Traveler, Luxury Traveler), Trip Duration (Weekend, 5-day, 2-week trip), Season (Winter, Summer, Off-season, Monsoon), Trip Type (Adventure, Relaxation, Cultural, Road Trip, Foodie) as possible. This is the youtube transcript below:\n ${transcript}`
        }
      ],
      response_format: {
        "type": "text"
      },
      temperature: 0.7,
      max_completion_tokens: 2048,
      top_p: 0.8,
      frequency_penalty: 0.2,
      presence_penalty: 0.3
    }),
  });

  const data = await response.json();
  return data.choices[0].text.trim();
}

export default router;
