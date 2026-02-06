import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import outputs from "@/amplify_outputs.json";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_RESUME, DEFAULT_SYSTEM_PROMPT } from '../admin';

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

  const { message, history, accessKey } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ reply: "I'm sorry, I haven't been configured with an API key yet. Please let Jeremy know!" });
  }
  if (!process.env.GEMINI_MODEL) {
    return res.status(500).json({ reply: "I'm sorry, I haven't been configured with an AI model yet. Please let Jeremy know!" });
  }

  // Fetch dynamic resume data from Amplify
  let dynamicResume = DEFAULT_RESUME;
  let dynamicName = "Jeremy Glasser";
  let systemPrompt = DEFAULT_SYSTEM_PROMPT;
  try {
    const { data: config } = await dataClient.models.ResumeConfig.get({ id: "main" });
    if (config?.content) {
      dynamicResume = config.content;
    }
    if (config?.name) {
      dynamicName = config.name;
    }
    if (config?.systemPrompt) {
      systemPrompt = config.systemPrompt;
    }
  } catch (err) {
    console.error("Error fetching dynamic resume data:", err);
    // Fallback to defaults
  }

  // Replace placeholders in system prompt
  const finalSystemInstruction = systemPrompt
    .replace(/{{name}}/g, dynamicName)
    .replace(/{{resume}}/g, dynamicResume);

  try {
    // Map history to Gemini format, ensuring history starts with a 'user' message
    const formattedHistory = (history || [])
      .map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    // If we have an access key, persist the conversation
    if (accessKey) {
      try {
        // If this is the first real message, save the initial greeting if it's in history
        if (history && history.length === 1 && history[0].role === 'assistant') {
          await dataClient.models.ChatMessage.create({
            accessKey,
            role: 'assistant',
            content: history[0].content
          });
        }

        // Save user message
        await dataClient.models.ChatMessage.create({
          accessKey,
          role: 'user',
          content: message
        });
      } catch (dbErr) {
        console.error("Error persisting user message:", dbErr);
      }
    }

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
        systemInstruction: finalSystemInstruction
      }
    });

    const reply = response.candidates?.[0]?.content?.parts?.[0]?.text ||
                  "I'm sorry, I couldn't generate a response. Please try again.";

    // Save assistant reply if we have an access key
    if (accessKey && reply) {
      try {
        await dataClient.models.ChatMessage.create({
          accessKey,
          role: 'assistant',
          content: reply
        });
      } catch (dbErr) {
        console.error("Error persisting assistant reply:", dbErr);
      }
    }

    res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    const errorMessage = process.env.NODE_ENV === 'development'
      ? `[Dev Error]: ${error.message || error.toString()}`
      : "I'm having a little trouble thinking right now. Could you try asking that again?";
    res.status(500).json({ reply: errorMessage });
  }
}
