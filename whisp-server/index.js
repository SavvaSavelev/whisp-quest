import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// 💬 Диалог между духами
app.post("/spirit-gossip", async (req, res) => {
  try {
    const { from, to, text } = req.body;

    // 🔒 Проверка входных данных
    if (!from || !to || !text) {
      return res.status(400).json({ error: "Missing 'from', 'to' or 'text' in request body" });
    }

    const systemPrompt = `
Ты — дух "${from}", говоришь с духом "${to}".
Обсудите происходящее в мире духов, будьте поэтичны и загадочны.
Не упоминай человека. Ответ — 2–3 строки.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.8,
        max_tokens: 120
      })
    });

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error("No response from OpenAI");

    return res.json({ reply });
  } catch (error) {
    console.error("❌ Ошибка spirit-gossip:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🌌 Whisp AI Spirit Server запущен → http://localhost:${PORT}`);
});
