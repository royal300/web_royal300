import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side with metadata tracking
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Full-stack API Route for generating a custom social media marketing package
app.post("/api/generate-package", async (req, res) => {
  try {
    const { platform, goal, frequency, tone } = req.body;

    if (!platform || !goal || !frequency || !tone) {
      return res.status(400).json({ error: "Missing required survey answers: platform, goal, frequency, tone" });
    }

    const prompt = `Generate a highly personalized, high-fidelity custom social media marketing package and execution plan based on the following survey results:
- Primary Platform: ${platform}
- Core Growth Goal: ${goal}
- Posting Frequency: ${frequency}
- Brand Tone & Style: ${tone}

Please produce a comprehensive, realistic, and highly actionable digital playbook. Deliver deep value and premium strategies tailored directly to these choices.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, premium social media strategist and digital marketing growth director. You create tailored growth playbooks, content schedules, and copy templates that drive real results. Avoid generic marketing buzzwords and give highly specific, tactical, and immediately executable ideas. Ensure the weekly schedule strictly matches the user's requested posting frequency (e.g. if they request Once a Day, provide 7 distinct post topics; if they say 3-4 times a week, specify which 3-4 days; if they say Once a week or less, provide 1 premium high-impact post recommendation).",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            profileName: {
              type: Type.STRING,
              description: "A tailored professional role descriptor, e.g., 'Aesthetic Brand Catalyst', 'B2B Trust Authority', 'Viral Velocity Specialist'."
            },
            strategyName: {
              type: Type.STRING,
              description: "A sophisticated marketing strategy name, e.g., 'High-Value Conversion Funnel', 'Dynamic Omni-Reach Engine'."
            },
            strategyOverview: {
              type: Type.STRING,
              description: "A polished, executive-level 2-3 sentence strategic summary outlining exactly how the user will achieve their core goal on their primary platform."
            },
            platformPlaybook: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly platform-specific 'secrets' or elite optimization principles for their chosen platform (e.g. specific algorithm cues, hook formats, or audio trends)."
            },
            weeklySchedule: {
              type: Type.ARRAY,
              description: "Day-by-day content calendar outline aligned with their frequency choice.",
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING, description: "Name of the day, e.g., 'Monday', 'Wednesday'." },
                  contentType: { type: Type.STRING, description: "Format, e.g., 'Short-form Video (Reel/TikTok)', 'Carousel Study', 'Text/Image Story'." },
                  topic: { type: Type.STRING, description: "A magnetic, highly conversion-focused topic tailored to their niche and goal." },
                  description: { type: Type.STRING, description: "Quick tactical instruction on how to execute this post (what to say, what footage to use)." }
                },
                required: ["day", "contentType", "topic", "description"]
              }
            },
            postConcepts: {
              type: Type.ARRAY,
              description: "3 ready-to-post, high-converting copy templates.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A descriptive title for this copy template." },
                  hook: { type: Type.STRING, description: "A scroll-stopping opening line designed for the chosen brand tone." },
                  body: { type: Type.STRING, description: "A high-fidelity structured copy template with blanks/placeholders or ready-to-use narrative structure." },
                  callToAction: { type: Type.STRING, description: "A powerful, single-minded call to action aligned with the core goal." },
                  hashtags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "5 highly relevant trending/niche hashtags."
                  }
                },
                required: ["title", "hook", "body", "callToAction", "hashtags"]
              }
            },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 concrete, tactical tasks they must execute on their profile today (e.g., bios, pinned posts, direct messaging setups)."
            }
          },
          required: [
            "profileName",
            "strategyName",
            "strategyOverview",
            "platformPlaybook",
            "weeklySchedule",
            "postConcepts",
            "actionPlan"
          ]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini Package Generator Error:", error);
    res.status(500).json({ error: "Failed to generate package. Please check that GEMINI_API_KEY is configured in Settings > Secrets." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", time: new Date().toISOString() });
});

// Configure Vite or Static Asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve SPA index.html for all unknown client routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BYOP Server] Full-stack application running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
