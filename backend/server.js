import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyDrScdw4_w_3wTgT356it78f_HjRo3-FaY");

const aspects = ["Readability", "Efficiency", "Best Practices", "Modularity", "Error Handling"];

// Helper function to extract and parse JSON from markdown-style code blocks
function extractJsonFromMarkdown(text) {
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (match) {
    try {
      return JSON.parse(match[1]);
    } catch (err) {
      console.error("JSON parsing failed inside code block:", err.message);
    }
  }
  // fallback if not inside ```json block
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Direct JSON parsing failed:", err.message);
    return null;
  }
}

app.post("/review", async (req, res) => {
  try {
    const { code, language } = req.body;

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });

    const ratingPrompt = (code, label) => `
Rate the following ${language} code based on these aspects: ${aspects.join(", ")}.
Return JSON like this:
{
  "Readability": 7,
  "Efficiency": 8,
  "Best Practices": 6,
  "Modularity": 5,
  "Error Handling": 4
}
Don't explain anything. Just return JSON.
${label} Code:
\`\`\`${language}
${code}
\`\`\`
`;

    const improvePrompt = `
You are an expert ${language} developer. Improve the following code to make it more readable, efficient, modular, and robust with proper error handling:
\`\`\`${language}
${code}
\`\`\`
Return only the improved code inside code block.
`;

    // Step 1: Rate original code
    const originalRatingRes = await model.generateContent(ratingPrompt(code, "Original"));
    const originalRatings = extractJsonFromMarkdown(originalRatingRes.response.text());

    // Step 2: Improve the code
    const improvedRes = await model.generateContent(improvePrompt);
    const improvedCodeBlock = improvedRes.response.text().match(/```(?:\w+)?\n([\s\S]*?)```/);
    const improvedCode = improvedCodeBlock ? improvedCodeBlock[1].trim() : "";

    // Step 3: Rate improved code
    const improvedRatingRes = await model.generateContent(ratingPrompt(improvedCode, "Improved"));
    const improvedRatings = extractJsonFromMarkdown(improvedRatingRes.response.text());

    // Step 4: Final review explanation
    const reviewPrompt = `
You are reviewing ${language} code. Explain the issues in the original code and what improvements were made in the improved version.
Original:
\`\`\`${language}
${code}
\`\`\`
Improved:
\`\`\`${language}
${improvedCode}
\`\`\`
Use clear markdown formatting.
`;
    const finalReviewRes = await model.generateContent(reviewPrompt);
    const explanation = finalReviewRes.response.text();

    res.json({ explanation, originalRatings, improvedRatings, improvedCode });

  } catch (error) {
    console.error("Review Error:", error);
    res.status(500).json({
      explanation: "⚠️ Failed to review code. Try again.",
      originalRatings: {},
      improvedRatings: {}
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
