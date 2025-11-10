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

function normalizeReview(text) {
  if (!text) return "";
  return text
    .replace(/\r/g, "")                 
    .replace(/[ \t]+\n/g, "\n")       
    .replace(/\n{2,}/g, "\n")         
    .trim();
}


function cleanResponse(text) {
  if (!text) return "";
  return String(text)
    .replace(/^\s*```[a-zA-Z0-9+-]*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

// ==== Gemini ====
async function getGeminiReview(code, language) {
  try {
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert software reviewer.
Review this ${language} code and return JSON strictly in this format:
{
  "review": "Detailed feedback",
  "revisedCode": "CODE_SNIPPET_HERE",
  "ratings": {
    "readability": number,
    "performance": number,
    "security": number,
    "maintainability": number
  }
}

Code:
${code}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    parsed.review = normalizeReview(parsed.review);
    parsed.revisedCode = "```" + language + "\n" + cleanResponse(parsed.revisedCode) + "\n```";
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

// ==== OpenAI Review ====
async function getOpenAIReview(code, language) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `You are an expert software engineer.
Review the following ${language} code thoroughly.
Please format your review with Markdown headers and bullet points for clarity.
Return JSON strictly as:
{
  "review": "Detailed multi-paragraph feedback",
  "revisedCode": "CODE_SNIPPET_HERE",
  "ratings": {
    "readability": number,
    "performance": number,
    "security": number,
    "maintainability": number
  }
}

Code:
${code}`,
        },
      ],
    });

    const text = completion.choices[0].message.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    parsed.review = normalizeReview(parsed.review);
    parsed.revisedCode = "```" + language + "\n" + cleanResponse(parsed.revisedCode) + "\n```";
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

// ==== OpenAI Judge ====
async function getOpenAIJudgement(geminiRes, openaiRes, code, language) {
  try {
    const judgePrompt = `You are an impartial senior software reviewer.
Two AIs (Gemini and ChatGPT) reviewed the same ${language} code. Compare them carefully.

Return ONLY valid JSON — no Markdown, no code fences.

Example Output:
{
  "best": "gemini",
  "reason": "Gemini gave more technical detail and better-structured suggestions."
}

Original code:
${code}

=== Gemini Review ===
${geminiRes.review}

=== Gemini Revised Code ===
${geminiRes.revisedCode}

=== ChatGPT Review ===
${openaiRes.review}

=== ChatGPT Revised Code ===
${openaiRes.revisedCode}

Choose which review is better (gemini or openai) and explain briefly why. Return ONLY JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: judgePrompt }],
      temperature: 0.3,
      max_tokens: 300,
    });

    const raw = completion.choices[0].message.content || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);

    let parsed;
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = { best: "none", reason: "Judging failed: no valid JSON in output" };
    }

    console.log("🧠 OpenAI Judge Result:", parsed);
    return parsed;
  } catch (err) {
    console.error("Judge error:", err.message);
    return { best: "none", reason: "Judging failed: " + err.message };
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

  const openaiJudge = await getOpenAIJudgement(geminiRes, openaiRes, code, language);

  res.json({ gemini: geminiRes, openai: openaiRes, judge: openaiJudge });
});

// ==== Start ====
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
