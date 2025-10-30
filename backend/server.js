// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

dotenv.config();
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ==== Initialize APIs ====
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ==== Gemini ====
async function getGeminiReview(code, language) {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Review this ${language} code:\n${code}\n
Return JSON strictly in this format:
{
  "review": "feedback text",
  "revisedCode": "CODE_SNIPPET_HERE",
  "ratings": { "readability": number, "performance": number, "security": number, "maintainability": number }
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed= JSON.parse(text);

    parsed.revisedCode = `\`\`\`${language}\n${parsed.revisedCode}\n\`\`\``;
    return parsed;

  } catch (err) {
    console.error("Gemini error:", err.message);
    return {
      review: "Gemini failed",
      revisedCode: "",
      ratings: {},
      error: err.message,
    };
  }
}

// ==== OpenAI ====
async function getOpenAIReview(code, language) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are an expert software engineer and technical reviewer.
Analyze and review the following ${language} code thoroughly.
Write a detailed, structured review covering correctness, performance, readability, and maintainability.
Then return the response strictly as JSON:
{
  "review": "A rich, multi-paragraph explanation with technical details and suggestions for improvement.",
  "revisedCode": "CODE_SNIPPET_HERE",
  "ratings": { "readability": number, "performance": number, "security": number, "maintainability": number }
}

Code:
${code}`
        }
      ],
    });

    const text = completion.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed= JSON.parse(text);

    parsed.revisedCode = `\`\`\`${language}\n${parsed.revisedCode}\n\`\`\``;
    return parsed;
  } catch (err) {
    console.error("OpenAI error:", err.message);
    return {
      review: "OpenAI failed",
      revisedCode: "",
      ratings: {},
      error: err.message,
    };
  }
}

// ==== Route ====
app.post("/review", async (req, res) => {
  const { code, language } = req.body;
  if (!code) return res.status(400).json({ error: "Code input required" });

  const [geminiRes, openaiRes] = await Promise.all([
    getGeminiReview(code, language),
    getOpenAIReview(code, language),
  ]);

  res.json({ gemini: geminiRes, openai: openaiRes });
});

// ==== Start ====
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
