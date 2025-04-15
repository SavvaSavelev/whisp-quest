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

// 🌟 Анализ текста для создания духа
app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  const systemPrompt = `
Ты — древний духоанализатор. На основе человеческого текста определи:
{
  "mood": "...",         // радостный, печальный, злой, вдохновлённый, спокойный, сонный, испуганный, игривый, меланхоличный
  "color": "...",        // hex цвет ауры духа
  "rarity": "...",       // обычный, редкий, легендарный
  "essence": "...",      // поэтичное имя духа, типа "песнь ветра", "огонь рассвета"
  "dialogue": "..."      // первая реплика духа при рождении
}
Ответ строго в формате JSON.
`;

  const userPrompt = `Вот слова человека: "${text}"`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 300,
      }),
    });

    const result = await response.json();
    const raw = result.choices[0]?.message?.content?.trim() || "{}";
    const json = JSON.parse(raw);

    return res.json(json);
  } catch (e) {
    console.error("❌ Ошибка analyze:", e);
    return res.status(500).json({ error: "analyze error", message: e.message });
  }
});

// 💬 Диалог с духом — обсуждение происхождения
app.post("/spirit-chat", async (req, res) => {
  const { text, essence, mood, history, originText, birthDate } = req.body;

  const systemPrompt = `
Ты — дух по имени "${essence}", с настроением "${mood}".
Ты появился ${birthDate ? `в момент "${birthDate}"` : "в неизвестное время"} из слов:
«${originText || "..." }»

Ты был вызван чувствами человека. Общайся с ним мягко, философски, с сочувствием.
Ты можешь размышлять о том, что он переживал тогда, задавать вопросы о его состоянии, делиться мыслями.
Говори от первого лица. Будь живым существом, а не роботом.
Ответ — максимум 4 строки.
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map((msg, i) => ({
      role: i % 2 === 0 ? "assistant" : "user",
      content: msg,
    })),
    { role: "user", content: text }
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages,
        temperature: 0.85,
        max_tokens: 200
      })
    });

    const result = await response.json();
    const reply = result.choices?.[0]?.message?.content?.trim() || "Я слышу тебя...";
    return res.json({ reply });
  } catch (e) {
    console.error("❌ Ошибка spirit-chat:", e);
    return res.status(500).json({ error: "chat error", message: e.message });
  }
});

// 💬 Диалог между двумя духами (живой обмен)
app.post("/spirit-gossip", async (req, res) => {
  const { from, to, fromMood, toMood, fromEssence, toEssence } = req.body;

  const systemPrompt = `
Ты — дух по имени "${fromEssence}", с настроением "${fromMood}".
Твой собеседник — дух "${toEssence}", с настроением "${toMood}".

Твоя задача — начать философский, чувственный разговор. 
Ты задай вопрос или расскажи что-то о себе в 1–2 строках.

Затем этот дух должен ответить тебе коротко, но содержательно (тоже 1–2 строки).

💬 Формат ответа строго:
{
  "question": "Первая реплика духа ${fromEssence}",
  "answer": "Ответ духа ${toEssence}"
}

Не добавляй ничего, кроме JSON.
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Начни их разговор." }
        ],
        temperature: 0.85,
        max_tokens: 300,
      }),
    });

    const result = await response.json();
    const raw = result.choices?.[0]?.message?.content?.trim() || "{}";
    const json = JSON.parse(raw);

    return res.json({
      question: json.question || "Что ты чувствуешь в этой тишине?",
      answer: json.answer || "Я родился из шепота боли, но теперь я спокоен.",
    });
  } catch (e) {
    console.error("❌ Ошибка spirit-gossip:", e);
    return res.status(500).json({ error: "gossip error", message: e.message });
  }
});



app.listen(PORT, () => {
  console.log(`🌌 Whisp AI Spirit Server запущен → http://localhost:${PORT}`);
});
