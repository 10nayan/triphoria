import express, { json } from 'express';
import fetch from 'node-fetch';

const router = express.Router();

router.post('/transcript', async (req, res) => {
  const { link } = req.body;
  try {
    const isValidYoutubeLink = checkIfValidYoutubeLink(link);
    if (!isValidYoutubeLink) {
      throw new Error('Invalid YouTube link. Please provide a valid URL.');
    }
    const transcriptText = await getYoutubeTranscript(link);
    
    const blog = await generateBlogFromTranscript(transcriptText);
    
    // Include the video ID in the response for thumbnail generation
    res.json({ 
      blog
    });
  } catch (error) {
    console.error('Error processing YouTube link:', error);
    res.status(500).json({ error: 'Failed to generate blog from YouTube link' });
  }
});

async function generateBlogFromTranscript(transcript) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: [{type: 'text', text: `You are an expert SEO blog writer specializing in transforming YouTube video transcripts into well-structured, engaging, and SEO-optimized travel blogs. 
          Your task is to:
          1. Remove filler words and improve readability
          2. Structure content with proper HTML formatting including:
            - Use <h1> for the main title
            - Use <h2> and <h3> for section headings
            - Use <ul> and <li> for bullet points
            - Use <p> for paragraphs
            - Use <strong> or <b> for emphasis
            - Use <em> or <i> for italics
            - Add appropriate spacing between sections
          3. Include SEO-friendly keywords like "travel guide", "best places to visit", and "top things to do"
          4. Add a "Travel Tips" section with practical advice
          5. Add a "FAQs" section at the end for SEO
          6. Make the blog title descriptive with elements like:
            - Traveller type (Solo, Couple, Family, Budget Traveler, Luxury Traveler)
            - Trip Duration (Weekend, 5-day, 2-week trip)
            - Season (Winter, Summer, Off-season, Monsoon)
            - Trip Type (Adventure, Relaxation, Cultural, Road Trip, Foodie)

          IMPORTANT: Return ONLY the HTML content without any markdown code block markers (do NOT include \`\`\`html or \`\`\` in your response). The response should be pure HTML that can be directly rendered in a web page.

          Ensure the blog remains engaging, natural, and informative while maintaining the original storytelling tone.

          This is the youtube transcript below:\n ${transcript}`
        }]
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
  if (!response.ok) {
    const data = await response.json();
    console.error(data);
    throw new Error('Failed to generate blog from transcript');
  }
  else {
    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    
    // Remove markdown code block markers if they exist
    if (content.startsWith('```html') || content.startsWith('```HTML')) {
      content = content.replace(/^```html\n|^```HTML\n/, '');
      content = content.replace(/\n```$/, '');
    }
    
    return content;
  }
}

async function getYoutubeTranscript(youtubeLink) {
  const response = await fetch(`https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(youtubeLink)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': `${process.env.SUPADATA_AI_API_KEY}`,
    }
  });
  if (!response.ok) {
    const data = await response.json();
    console.error(data);
    throw new Error('Failed to get the transcript from Youtube');
  }
  else {
    const data = await response.json();
    let content = data.content;
    // Extract only the text from each transcript object and join them
    const transcriptText = content.map(item => item.text).join(' ');
    return transcriptText;
  }
}

function checkIfValidYoutubeLink(youtubeLink) {
    // Validate the YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    if (!youtubeRegex.test(youtubeLink)) {
      return false;
    }
    return true;
}

export default router;
