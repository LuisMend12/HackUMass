require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.post('/gemini', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await response.json();
    res.json({ text: data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response" });
  } catch (err) {
    res.json({ text: "Error connecting to Gemini 😞" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
