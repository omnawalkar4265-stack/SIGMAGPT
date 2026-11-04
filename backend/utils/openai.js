import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getOpenAIResponse = async (message) => {
    const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: message
    });
    return response.text;
};