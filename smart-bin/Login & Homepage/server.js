import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Define __dirname manually (ESM fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const ai = new GoogleGenAI(process.env.GOOGLE_API_KEY);

// Gemini endpoint
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

// Serve static files (your frontend)
app.use(express.static(path.join(__dirname, "public")));

// Serve homepage
app.get("/hm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "hm.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
