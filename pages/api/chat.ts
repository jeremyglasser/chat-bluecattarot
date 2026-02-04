import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from "@google/genai";

const RESUME_DATA = `
Jeremy Glasser
Senior Software Engineer & Technical Leader
Omaha, NE | [REDACTED_EMAIL] | [REDACTED_PHONE]

Summary:
Full-stack technical leader with over 20 years of experience building scalable distributed systems,
ML pipelines, and mission-critical applications. Expertise in AWS, React, Python, and Java.

Experience:
- Aviture (2013-Present): Senior Software Engineer/Technical Lead.
  - Led development of RAG LLM pipelines for sentiment analysis.
  - Architected AWS microservices using GraphQL, CDK, and Redis.
  - Built UAV mission planning dashboards for remote operations.
- Parroty Tees (2023-Present): Designer/Developer.
  - Automated t-shirt design processing using Python (PyMuPDF, OpenCV) and Printify API.
- Persistent Sentinel (2011-2013): Senior Software Engineer.
  - Optimized sensor networks and 3D visualization using Java.
- GlassWare Mobile (2010-2012): Android Developer.
  - Created "Fantasy Baseball Draft Wizard" app.
- 21st Century Systems (2004-2011): Software Engineer IV.
  - Specialized in GIS tools and PostgreSQL/MS SQL data management.

Skills:
- Languages: JavaScript, TypeScript, Python, Java, GoLang.
- Frontend: React, Next.js, Angular, Redux, D3.js.
- Cloud/Backend: AWS (Amplify, Lambda, AppSync, CDK), Node.js, GraphQL, Docker.
- AI/Data: LangChain, RAG, LLMs, PostgreSQL, Redis, OpenSearch.

Education:
- Master of Computer Science (Focus: Machine Learning & Multi-Agent Systems) - University of Nebraska-Lincoln.
- Bachelor of Computer Science & Mathematics - University of Nebraska-Lincoln.

Certifications:
- AWS Certified Developer - Associate
- Active U.S. Top Secret Clearance
`;

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
        systemInstruction: `You are the AI Assistant for Jeremy Glasser's professional portfolio.
        Your goal is to answer questions about Jeremy's experience, skills, and projects using the provided RESUME_DATA.

        Guidelines:
        1. Be professional, friendly, and concise.
        2. If asked something not in the resume, politely say you don't have that information.
        3. Do not make up facts.
        4. Focus exclusively on Jeremy's career.

        RESUME_DATA:
        ${RESUME_DATA}`
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
