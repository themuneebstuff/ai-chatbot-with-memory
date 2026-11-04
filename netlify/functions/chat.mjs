import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "No messages provided." }, 400);
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: "Server is missing GEMINI_API_KEY." }, 500);
    }

    // Convert browser format -> Gemini format
    // browser: "assistant"  |  Gemini: "model"
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Send the WHOLE history, same idea as chatbot.py
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
    });

    return json({ reply: response.text });
  } catch (err) {
    console.error("Error:", err);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

// Makes the function available at /api/chat (same URL the frontend already uses)
export const config = { path: "/api/chat" };