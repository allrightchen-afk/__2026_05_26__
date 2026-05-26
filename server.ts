import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "15mb" })); // Increase limit for long meeting transcripts

  const PORT = 3000;

  // Initialize Gemini
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API Route - Summarize and Translate Meeting Minutes
  app.post("/api/summarize", async (req, res) => {
    try {
      const { content, targetLanguage, systemInstruction } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: "會議記錄內容不可為空白" });
        return;
      }

      if (!ai) {
        res.status(500).json({ 
          error: "伺服器未設定 GEMINI_API_KEY 環境變數，請在 AI Studio 的 Secrets 點擊設置設定此金鑰。" 
        });
        return;
      }

      const prompt = `翻譯目標語系：${targetLanguage || "繁體中文"}\n\n會議材料與逐字稿內容：\n${content}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3, // Lower temperature for more objective meeting records
        }
      });

      const text = response.text;
      res.json({ result: text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "處理會議記錄時發生未知錯誤" });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
