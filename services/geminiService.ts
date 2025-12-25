
import { GoogleGenAI } from "@google/genai";

export const enhanceText = async (text: string, action: 'polish' | 'summarize' | 'structure'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompts = {
    polish: "Rewrite the following text to be more professional, clear, and grammatically correct while preserving the original meaning:",
    summarize: "Provide a concise summary of the following text suitable for a document preface or short PDF report:",
    structure: "Format the following text with clear headings, bullet points where appropriate, and a logical structure for a PDF document. Do not use Markdown characters that might look messy in a plain text PDF, just use spacing and standard capitalization for headers:"
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${prompts[action]}\n\n${text}`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    });

    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to enhance text with AI. Please check your connection.");
  }
};
