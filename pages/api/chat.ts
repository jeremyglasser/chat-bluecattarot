import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_RESUME } from '../admin';

Amplify.configure(outputs);

const dataClient = generateClient<Schema>({
  authMode: "apiKey",
});

// Initialize the Google GenAI SDK
const genAI = new GoogleGenAI({});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message, history } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: "I'm sorry, I haven't been configured with an API key yet. Please let Jeremy know!" });
  }
  if (!process.env.GEMINI_MODEL) {
    return res.status(500).json({ reply: "I'm sorry, I haven't been configured with an AI model yet. Please let Jeremy know!" });
  }

  // Fetch dynamic resume data from Amplify
  let dynamicResume = DEFAULT_RESUME;
  let dynamicName = "Jeremy Glasser";
  try {
    const { data: config } = await dataClient.models.ResumeConfig.get({ id: "main" });
    if (config?.content) {
      dynamicResume = config.content;
    }
    if (config?.name) {
      dynamicName = config.name;
    }
  } catch (err) {
    console.error("Error fetching dynamic resume data:", err);
    // Fallback to defaults
  }

  try {
    // Map history to Gemini format, ensuring history starts with a 'user' message
    const formattedHistory = (history || [])
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // Gemini requires chat history to start with a 'user' message
    const firstUserIndex = formattedHistory.findIndex((msg: any) => msg.role === 'user');
    const startHistory = firstUserIndex !== -1 ? formattedHistory.slice(firstUserIndex) : [];

    // Use the newest generation of models
    const response = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: [
        ...startHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: `You are the AI Assistant for ${dynamicName}'s professional portfolio.
        Your goal is to answer questions about ${dynamicName}'s experience, skills, and projects using the provided RESUME_DATA.

        Guidelines:
        1. Be professional, friendly, and concise.
        2. If asked something not in the resume, politely say you don't have that information.
        3. Do not make up facts.
        4. Focus exclusively on ${dynamicName}'s career.

        RESUME_DATA:
        ${dynamicResume}`
      }
    });

    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ||
                  "I'm sorry, I couldn't generate a response. Please try again.";

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `[Dev Error]: ${error.message || error.toString()}`
      : "I'm having a little trouble thinking right now. Could you try asking that again?";
    res.status(500).json({ reply: errorMessage });
  }
}
