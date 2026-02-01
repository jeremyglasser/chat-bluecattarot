import type { NextApiRequest, NextApiResponse } from 'next';

const RESUME_DATA = `
Jeremy Glasser
Senior Software Engineer & Technical Leader
Omaha, NE | [REDACTED_EMAIL] | [REDACTED_PHONE]

Experience:
- Aviture (2013-Present): Senior Software Engineer/Technical Lead. JSF, RAG LLM pipeline, AWS microservices, GraphQL, Redis, Angular, UAV mission planning.
- Parroty Tees (2023-Present): Designer/Developer. Python (PyMuPDF, OpenCV, NumPy), Printify API.
- Persistent Sentinel (2011-2013): Senior Software Engineer. Sensor optimization, 3D visualization, Java, Eclipse.
- GlassWare Mobile (2010-2012): Android Developer. Fantasy baseball app.
- 21st Century Systems (2004-2011): Software Engineer IV. PostgreSQL, MS SQL, Spring framework, GIS tools.

Skills:
- Languages: JavaScript, TypeScript, Python, Java, Scala, C++, GoLang, Perl.
- Web: GraphQL, React, Redux, Angular, Node.js, FastAPI, Flask, Amplify.
- Cloud/DevOps: AWS, CloudFormation, CDK, Docker, Kubernetes, Jenkins, CircleCI.
- AI/Data: PyTorch, HuggingFace, LangChain, OpenSearch, Elasticsearch, PostgreSQL, Redis.
- Education: Master of Computer Science (ML focus), Bachelor of CS & Math - University of Nebraska-Lincoln.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { message } = req.body;
  const input = message.toLowerCase();

  // Simple simulated AI logic based on resume keywords
  let reply = "";

  if (input.includes("experience") || input.includes("work") || input.includes("history")) {
    reply = "Jeremy has over 20 years of experience, most recently as a Senior Technical Lead at Aviture since 2013. He's led major projects involving AWS microservices, RAG LLM pipelines, and drone mission planning systems.";
  } else if (input.includes("skill") || input.includes("tech") || input.includes("know")) {
    reply = "He is highly proficient in a wide stack including JavaScript/TypeScript, Python, and Java. On the frontend, he uses React and Angular, and on the backend, he's an expert in AWS, GraphQL, and various database systems like PostgreSQL and Redis.";
  } else if (input.includes("education") || input.includes("degree") || input.includes("study")) {
    reply = "Jeremy holds both a Master's and a Bachelor's degree in Computer Science from the University of Nebraska-Lincoln, with a specialized focus on Machine Learning and Multi-Agent Systems.";
  } else if (input.includes("suitable") || input.includes("candidate") || input.includes("hire")) {
    reply = "Absolutely. With his deep technical expertise, leadership experience, and Master's focus in ML/AI, he's an ideal candidate for senior engineering or technical leadership roles, especially those involving cloud architecture or AI integration.";
  } else if (input.includes("aws") || input.includes("cloud")) {
    reply = "He has extensive AWS experience, including CloudFormation, CDK, and building cloud-centric microservices for financial risk and data ingestion applications.";
  } else if (input.includes("ai") || input.includes("ml") || input.includes("machine learning") || input.includes("llm")) {
    reply = "AI is a core strength. He recently built a RAG LLM pipeline for sentiment analysis and has a Master's degree specifically focused on Machine Learning.";
  } else if (input.includes("hello") || input.includes("hi")) {
    reply = "Hello! I can tell you all about Jeremy's professional background. What would you like to know?";
  } else {
    reply = "That's a great question about Jeremy's background! Based on his resume, he has a deep expertise in " +
            (input.length % 2 === 0 ? "distributed systems and cloud architecture." : "full-stack development and AI integration.") +
            " Is there a specific project or skill you'd like me to elaborate on?";
  }

  // Artificial delay to feel "real"
  await new Promise(resolve => setTimeout(resolve, 800));

  res.status(200).json({ reply });
}
