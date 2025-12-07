import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeProjectHealth = async (tasks: Task[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please configure the environment.";
  }

  // Sanitize data to send to AI
  const taskSummary = tasks.map(t => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    due: t.dueDate,
    owner: t.ownerName
  }));

  const prompt = `
    Analyze the following project tasks and provide a concise executive summary (max 150 words).
    Identify bottlenecks, risk areas based on priority/due dates, and overall progress.
    Format the response as raw text, no markdown.
    
    Tasks:
    ${JSON.stringify(taskSummary)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate AI insights. Please try again later.";
  }
};