const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate-script', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes YouTube video scripts.' },
        { role: 'user', content: `Write a detailed YouTube video script about: ${topic}` },
      ],
      max_tokens: 1000,
    });
    const script = completion.data.choices[0].message.content;
    res.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    res.status(500).json({ error: 'Failed to generate script' });
  }
});

app.post('/api/generate-prompt', async (req, res) => {
  const { task, description } = req.body;
  if (!task || !description) {
    return res.status(400).json({ error: 'Task and description are required' });
  }
  try {
    let systemContent = '';
    if (task === 'thumbnail') {
      systemContent = 'You are an assistant that creates creative prompts for YouTube thumbnails.';
    } else if (task === 'banner') {
      systemContent = 'You are an assistant that creates creative prompts for YouTube banners.';
    } else if (task === 'logo') {
      systemContent = 'You are an assistant that creates creative prompts for YouTube logos.';
    } else {
      return res.status(400).json({ error: 'Invalid task' });
    }
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: `Create a detailed prompt for ${task} based on this description: ${description}` },
      ],
      max_tokens: 500,
    });
    const prompt = completion.data.choices[0].message.content;
    res.json({ prompt });
  } catch (error) {
    console.error('Error generating prompt:', error);
    res.status(500).json({ error: 'Failed to generate prompt' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
