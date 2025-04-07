import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai"; 

const app = express();
const PORT = 5000;
// const cors=require("cors");
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("AIzaSyCNaerYuQFja26KnNMBtbP49FX17YRQVDc");
app.post("/review", async (req, res) => {
  try {
    const { code, language } = req.body;

    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-002" });
    const prompt = `You are an expert in ${language} programming. Review the following code and provide improvements:\n\n${code}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text();
    
    

    res.json({ review });
    console.log( review );
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Error processing request" });
  }
});
console.log('hello');
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

