import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { content, targetLanguage, systemInstruction, provider } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "會議記錄內容不可為空白" });
  }

  const prompt = `翻譯目標語系：${targetLanguage || "繁體中文"}\n\n會議材料與逐字稿內容：\n${content}`;

  try {
    if (provider === "nvidia") {
      const apiKey = process.env.NVIDIA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "伺服器未設定 NVIDIA_API_KEY 環境變數，請確認環境變數設定。"
        });
      }

      const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-mini-4b-instruct",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `NVIDIA API responded with status ${response.status}`);
      }

      const data = await response.json();
      const resultText = data.choices?.[0]?.message?.content;
      if (!resultText) {
        throw new Error("NVIDIA API 回傳的結果格式不正確。");
      }

      return res.status(200).json({ result: resultText });

    } else {
      // Default to Gemini
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "伺服器未設定 GEMINI_API_KEY 環境變數，請確認環境變數設定。"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.3,
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini API 未能生成任何內容。");
      }

      return res.status(200).json({ result: text });
    }
  } catch (error: any) {
    console.error("AI API Error:", error);
    return res.status(500).json({
      error: error.message || "處理會議記錄時發生未知錯誤"
    });
  }
}
