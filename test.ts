import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});
import { GoogleGenAI } from "@google/genai";

console.log(
  "KEY:",
  process.env.GEMINI_API_KEY?.slice(0, 12)
);
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function test() {
  const res = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: "Say hello",
  });

  console.log(res.text);
}

test();