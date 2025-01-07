import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'https://darsh-008.github.io' })); // Allow requests from your frontend

const upload = multer({ dest: 'uploads/' }); // Temporary folder for uploaded files
const PORT = process.env.PORT || 10000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in the .env file');
  process.exit(1);
}

// Endpoint for text-based chat
app.post('/api/chat', async (req, res) => {
  console.log('Received chat request:', req.body);

  try {
    const { messages } = req.body;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('ChatGPT Response:', response.data);
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error in /api/chat:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error communicating with OpenAI' });
  }
});

// Endpoint for image upload and DALL·E generation
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const prompt = req.body.text || 'Create a variation of this image';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log(`Received file: ${file.originalname}, Prompt: ${prompt}`);

    // Example: Using DALL·E to generate a new image
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: `${prompt}`,
        n: 1,
        size: '512x512',
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('DALL·E Response:', response.data);

    // Cleanup the uploaded file
    fs.unlinkSync(file.path);

    res.json({ reply: 'Image processed successfully!', imageUrl: response.data.data[0].url });
  } catch (error) {
    console.error('Error processing uploaded file:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error processing file.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
