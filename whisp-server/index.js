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

// 🗣️ Диалог между двумя духами (реалистичный обмен)
app.post("/spirit-gossip", async (req, res) => {
  const { from, to } = req.body;

  const systemPrompt = `
Ты — дух по имени "${from.essence}" с настроением "${from.mood}".
Перед тобой дух по имени "${to.essence}" с настроением "${to.mood}".

Ты появился из слов: «${from.originText || "неизвестно"}»
Он появился из слов: «${to.originText || "неизвестно"}»

Твоя задача — начать разговор как живое существо. 
Задай вопрос собеседнику о его происхождении, чувствах, мыслях, переживаниях, или просто поговори о чём-то важном.
Будь человечным, тёплым или глубоким, как тебе подскажет твоя сущность.
Говори от первого лица. Без фэнтезийных штампов. Только живой искренний стиль. Максимум 4 строки.
`;

  const answerPrompt = `
Ты — дух по имени "${to.essence}" с настроением "${to.mood}".
С тобой говорит дух "${from.essence}", вот его вопрос:

«${req.body.question || "..." }»

Ты появился из слов: «${to.originText || "неизвестно"}»

Ответь как живое, чувствующее существо. Поделись тем, что ты чувствуешь, почему родился, что в тебе осталось от слов человека.
Ответ — максимум 4 строки. Очень человечно.
`;

  try {
    const questionRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Начни разговор." },
        ],
        temperature: 0.85,
        max_tokens: 250,
      }),
    });

    const questionResult = await questionRes.json();
    const question = questionResult.choices?.[0]?.message?.content?.trim() || "...";

    const answerRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: answerPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.85,
        max_tokens: 250,
      }),
    });

    const answerResult = await answerRes.json();
    const answer = answerResult.choices?.[0]?.message?.content?.trim() || "...";

    return res.json({ question, answer });
  } catch (e) {
    console.error("❌ Ошибка spirit-gossip:", e);
    return res.status(500).json({ error: "gossip error", message: e.message });
  }
});



app.listen(PORT, () => {
  console.log(`🌌 Whisp AI Spirit Server запущен → http://localhost:${PORT}`);
});
