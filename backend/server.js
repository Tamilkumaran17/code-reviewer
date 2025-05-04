import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
config(); // Load environment variables from .env file

const app = express();
const PORT = 5000;
// const cors=require("cors");
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/review", async (req, res) => {
  try {
    const { code, language } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
You are an expert ${language} developer.

Analyze the following code carefully:
\`\`\`${language}
${code}
\`\`\`

Return output in following JSON format ONLY:

{
  "review": "Explain clearly what mistakes are there, what improvements are needed, and any good points.",
  "alternative_code": "ONLY if code is complex, suggest better/improved version, else say 'Code is basic. No alternative needed.'",
  "ratings": {
    "time_complexity": 1-5,
    "memory_efficiency": 1-5,
    "code_structure": 1-5,
    "readability": 1-5,
    "best_practices": 1-5
  }
}
`;

    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }]
    });

    const response = result.response;
    const rawText = response.text();

    console.log("Raw Gemini Response:", rawText);

    // Gemini should give clean JSON, parse it
    const cleanedText = rawText.trim().replace(/```json|```/g, ""); // Remove markdown backticks
    const parsed = JSON.parse(cleanedText);

    const { review, alternative_code, ratings } = parsed;

    const formattedAlternativeCode = `\`\`\`${language}\n${alternative_code}\n\`\`\``;


    res.json({ review, alternative_code: formattedAlternativeCode, ratings });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


