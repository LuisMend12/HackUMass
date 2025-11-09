import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/gemini", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    res.json({ text: result.response.text() });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ text: "Error connecting to Gemini 😞" });
  }
});

app.listen(3000, () => {
  console.log("Gemini server running on http://localhost:3000");
});
