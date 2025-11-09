require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;

app.post('/gemini', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('[Request] prompt:', prompt);

  const model = 'models/gemini-2.5-flash';  // ← pick a valid model name
  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }] }
        ],
        // optional parameters, e.g. generation_config
        generation_config: {
          max_output_tokens: 256,
          temperature: 0.7
        }
      }),
    });

    console.log('[HTTP] status:', response.status);
    const data = await response.json();
    console.log('[Gemini] response JSON:', JSON.stringify(data, null, 2));

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (answer) {
      res.json({ text: answer });
    } else {
      res.json({ text: "No valid answer received from Gemini." });
    }
  } catch (err) {
    console.error('[Error] fetch error:', err);
    res.json({ text: "Error connecting to Gemini 😞" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
