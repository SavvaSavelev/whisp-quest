// Whisp Quest Server v2.2 — /api/v1, SSE chat, aliases, MOCK, Zod-ready (ESM)

import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import OpenAI from "openai";

import {
  AIMissionRequestSchema,
  AIMissionResponseSchema,
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
  HealthResponseSchema,
  SpiritChatRequestSchema,
  SpiritChatResponseSchema,
  SpiritGossipRequestSchema,
  SpiritGossipResponseSchema,
  validateMiddleware,
  validateResponse,
} from "./validation.js";

// ==== ENV ====
const PORT = Number(process.env.PORT ?? 3001);
const NODE_ENV = process.env.NODE_ENV ?? "development";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGIN ?? "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const MOCK = process.env.MOCK_OPENAI === "1";

if (!OPENAI_API_KEY && !MOCK) {
  console.error(
    "❌ OPENAI_API_KEY отсутствует. Укажите в .env или установите MOCK_OPENAI=1 для моков."
  );
  process.exit(1);
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY, timeout: 30_000 });

// ==== APP ====
const app = express();
app.set("env", NODE_ENV);
app.set("trust proxy", 1);

app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || ALLOWED_ORIGINS.includes(origin)
        ? cb(null, true)
        : cb(null, false),
  })
);
app.use(express.json({ limit: "2mb" }));

// request-id
app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID();
  next();
});

// rate limits
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// light logging
app.use((req, res, next) => {
  const t0 = Date.now();
  res.on("finish", () =>
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${
        Date.now() - t0
      }ms - id=${req.id}`
    )
  );
  next();
});

// ==== SIMPLE TTL CACHE ====
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 5 * 60 * 1000);
const cache = new Map(); // key -> { value, exp }
function setCache(key, value, ttl = CACHE_TTL_MS) {
  cache.set(key, { value, exp: Date.now() + ttl });
}
function getCache(key) {
  const it = cache.get(key);
  if (!it) return null;
  if (Date.now() > it.exp) {
    cache.delete(key);
    return null;
  }
  return it.value;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of cache) if (now > v.exp) cache.delete(k);
}, Math.min(CACHE_TTL_MS, 60_000)).unref();

// ==== ZOD-COMPAT HELPERS ====
const ALLOWED_MOODS = new Set([
  "радостный",
  "печальный",
  "злой",
  "вдохновлённый",
  "спокойный",
  "сонный",
  "испуганный",
  "игривый",
  "меланхоличный",
  "inspired",
  "happy",
  "sad",
  "angry",
  "acceptance",
]);
const MOOD_MAP = new Map([
  ["inspired", "вдохновлённый"],
  ["happy", "радостный"],
  ["sad", "печальный"],
  ["angry", "злой"],
  ["acceptance", "спокойный"],
  ["neutral", "спокойный"],
  ["calm", "спокойный"],
  ["melancholic", "меланхоличный"],
  ["playful", "игривый"],
  ["sleepy", "сонный"],
  ["scared", "испуганный"],
]);
function normalizeMood(mood) {
  if (!mood) {
    // Если настроение не определено, возвращаем случайное положительное
    const randomPositive = [
      "радостный",
      "спокойный",
      "вдохновлённый",
      "игривый",
    ];
    return randomPositive[Math.floor(Math.random() * randomPositive.length)];
  }
  const m = String(mood).toLowerCase();
  if (ALLOWED_MOODS.has(m)) return m;
  if (MOOD_MAP.has(m)) return MOOD_MAP.get(m);
  if (m.includes("вдох")) return "вдохновлённый";
  if (m.includes("радост")) return "радостный";
  if (m.includes("печал")) return "печальный";
  if (m.includes("зло")) return "злой";
  if (m.includes("споко")) return "спокойный";
  if (m.includes("сон")) return "сонный";
  if (m.includes("испуг")) return "испуганный";
  if (m.includes("игрив")) return "игривый";
  if (m.includes("мелан")) return "меланхоличный";
  // Если ничего не подошло, возвращаем случайное настроение
  const allMoods = [
    "радостный",
    "спокойный",
    "вдохновлённый",
    "игривый",
    "печальный",
    "злой",
    "меланхоличный",
  ];
  return allMoods[Math.floor(Math.random() * allMoods.length)];
}

function normalizeHexColor(v, fallback = "#808080") {
  if (!v) return fallback;
  let s = String(v).trim();
  const hex = s.startsWith("#") ? s : `#${s}`;
  const m3 = /^#([0-9a-fA-F]{3})$/.exec(hex);
  if (m3) {
    const [r, g, b] = m3[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : fallback;
}

const isoNow = () => new Date().toISOString();
const hashKey = (s) =>
  crypto.createHash("sha256").update(s).digest("base64url").slice(0, 44);

const json = (res, data, schema) =>
  res.json(schema ? validateResponse(schema, data) : data);

// ==== BASE PATH & ALIASES ====
const API = "/api/v1";

// Root (инфо)
app.get("/", (_req, res) => {
  json(res, {
    name: "✨ Whisp Quest Server v2.2",
    status: "running",
    features: [
      "🔒 Security",
      "⚡ Rate Limiting",
      "💾 Caching",
      "🔍 Monitoring",
      "🧵 Streaming",
    ],
    endpoints: {
      analyze: `${API}/analyze`,
      chat: `${API}/spirit-chat`,
      chat_stream: `${API}/spirit-chat/stream`,
      gossip: `${API}/spirit-gossip`,
      ai_mission: `${API}/ai-mission`,
      health: "/health",
    },
    timestamp: isoNow(),
  });
});

// Health (валидируем строго под Zod)
app.get("/health", (_req, res) => {
  const mu = process.memoryUsage();
  json(
    res,
    {
      status: "ok",
      uptime: process.uptime(),
      memory: {
        rss: mu.rss,
        heapTotal: mu.heapTotal,
        heapUsed: mu.heapUsed,
        external: mu.external,
        arrayBuffers: mu.arrayBuffers ?? 0,
      },
      cache_size: cache.size,
      openai_configured: !MOCK,
      timestamp: isoNow(),
    },
    HealthResponseSchema
  );
});

// === /api/v1 ===

// Analyze
app.post(
  `${API}/analyze`,
  validateMiddleware(AnalyzeRequestSchema),
  async (req, res) => {
    const { text } = req.validatedBody;
    const key = `spirit:${hashKey(text)}`;
    const cached = getCache(key);
    if (cached)
      return json(res, { ...cached, cached: true }, AnalyzeResponseSchema);

    if (MOCK) {
      // Генерируем случайного мок-духа для разнообразия
      const mockMoods = [
        "радостный",
        "спокойный",
        "вдохновлённый",
        "игривый",
        "меланхоличный",
      ];
      const mockColors = [
        "#33cc99",
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#f39c12",
        "#9b59b6",
      ];
      const mockRarities = ["обычный", "обычный", "редкий", "легендарный"];
      const mockEssences = [
        "искрящийся комар доверия",
        "танцующий ветер мысли",
        "шепчущая тень вдохновения",
        "сияющий осколок радости",
        "дремлющий хранитель снов",
      ];
      const mockDialogues = [
        "Ну давай, удиви меня ещё одним шедевром самокритики.",
        "О, кто-то призвал меня из глубин подсознания!",
        "Интересно... твои мысли имеют необычный аромат.",
        "Я чувствую... энергию перемен в твоих словах.",
        "Хм, позволь мне поразмыслить над этим...",
      ];

      const result = {
        mood: mockMoods[Math.floor(Math.random() * mockMoods.length)],
        color: mockColors[Math.floor(Math.random() * mockColors.length)],
        rarity: mockRarities[Math.floor(Math.random() * mockRarities.length)],
        essence: mockEssences[Math.floor(Math.random() * mockEssences.length)],
        dialogue:
          mockDialogues[Math.floor(Math.random() * mockDialogues.length)],
        timestamp: isoNow(),
        cached: false,
      };
      setCache(key, result);
      return json(res, result, AnalyzeResponseSchema);
    }

    const system = `Ты — древний духоанализатор. Анализируй эмоции текста и создавай разнообразных духов.

ВАЖНО: Старайся создавать духов с РАЗНЫМИ настроениями! Не только печальных.

Доступные настроения:
- радостный (для позитивных, весёлых текстов)
- вдохновлённый (для творческих, мотивирующих текстов)  
- спокойный (для нейтральных, умиротворённых текстов)
- игривый (для шутливых, забавных текстов)
- печальный (только для действительно грустных текстов)
- злой (для агрессивных, раздражённых текстов)
- меланхоличный (для задумчивых, ностальгических текстов)
- сонный (для усталых, расслабленных текстов)
- испуганный (для тревожных текстов)

Верни ровно JSON:
{
  "mood": "одно из настроений выше",
  "color": "#RRGGBB (цвет соответствующий настроению)",
  "rarity": "обычный|редкий|легендарный",
  "essence": "креативное название духа",
  "dialogue": "характерная фраза духа"
}`;
    const user = `Анализируй текст и создай духа: "${text}"

Подсказки для настроения:
- Если текст позитивный/весёлый → радостный
- Если текст про планы/цели → вдохновлённый  
- Если текст обычный/нейтральный → спокойный
- Если есть шутки/ирония → игривый
- Только если реально грустно → печальный`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.9,
        max_tokens: 300,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("Пустой ответ OpenAI");

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Невалидный JSON от OpenAI");
      }

      const result = {
        mood: normalizeMood(parsed.mood),
        color: normalizeHexColor(parsed.color, "#808080"),
        rarity: ["обычный", "редкий", "легендарный"].includes(parsed.rarity)
          ? parsed.rarity
          : "обычный",
        essence: (parsed.essence || "неопознанная сущность")
          .toString()
          .slice(0, 200),
        dialogue: (parsed.dialogue || "Ну и зачем ты меня вызвал?")
          .toString()
          .slice(0, 500),
        timestamp: isoNow(),
        cached: false,
      };

      setCache(key, result);
      return json(res, result, AnalyzeResponseSchema);
    } catch (err) {
      console.error("❌ Analyze error:", err?.message);
      // Создаем случайного духа вместо всегда печального
      const fallbackMoods = [
        "спокойный",
        "вдохновлённый",
        "игривый",
        "радостный",
      ];
      const randomMood =
        fallbackMoods[Math.floor(Math.random() * fallbackMoods.length)];
      const fallbackColors = [
        "#808080",
        "#33cc99",
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
      ];
      const randomColor =
        fallbackColors[Math.floor(Math.random() * fallbackColors.length)];

      return json(
        res,
        {
          mood: randomMood,
          color: randomColor,
          rarity: "обычный",
          essence: "дух неожиданности",
          dialogue: "Хм, что-то пошло не по плану, но я все равно здесь!",
          timestamp: isoNow(),
          cached: false,
        },
        AnalyzeResponseSchema
      );
    }
  }
);

// AI Mission — сбор команды духов и коллективное решение
app.post(
  `${API}/ai-mission`,
  validateMiddleware(AIMissionRequestSchema),
  async (req, res) => {
    const {
      topic,
      context = "",
      constraints = [],
      desiredMoods = [],
      spiritHints = [],
      teamSize = 3,
      history = [],
    } = req.validatedBody;

    const missionId = `mission_${Date.now()}_${crypto
      .randomUUID()
      .slice(0, 8)}`;

    if (MOCK) {
      const moodsPool = desiredMoods.length
        ? desiredMoods
        : ["вдохновлённый", "радостный", "спокойный"];
      const mockTeam = Array.from({
        length: Math.max(2, Math.min(5, teamSize)),
      }).map((_, i) => ({
        essence: spiritHints[i]?.essence || `дух #${i + 1}`,
        mood: normalizeMood(
          spiritHints[i]?.mood || moodsPool[i % moodsPool.length]
        ),
        role: [
          "аналитик",
          "скептик",
          "мотиватор",
          "исследователь",
          "организатор",
        ][i % 5],
        rationale: "Подходит по настрою и роли для данной миссии",
      }));

      return json(
        res,
        {
          missionId,
          selectedSpirits: mockTeam,
          plan: [
            "Собрать ключевые записи и контекст",
            "Определить цели и ограничения",
            "Синтезировать ответы по ролям",
            "Сформировать общий вывод",
          ],
          steps: [
            {
              speaker: mockTeam[0].essence,
              content: `Предлагаю начать: ${topic}`,
            },
            {
              speaker: mockTeam[1].essence,
              content: "Проверим риски и слабые места",
            },
            { speaker: mockTeam[2].essence, content: "Соберу мысли в план" },
          ],
          finalAnswer:
            "Итог: команда духов составила план и дала рекомендации. Готово к следующему шагу.",
          timestamp: isoNow(),
        },
        AIMissionResponseSchema
      );
    }

    // OpenAI режим — сформируем системный запрос на детальную командную работу
    const system = `Ты — мастер-фасилитатор коллективного разума духов. 
Твоя задача: создать команду духов, которая РЕАЛЬНО решит поставленную задачу с конкретным, подробным планом.

Требования к ответу:
- Выбери ${teamSize} духов с уникальными ролями и способностями для решения конкретной задачи
- Создай детальный план из 5-8 конкретных шагов с описанием "как делать"
- Проведи имитацию обсуждения: каждый дух высказывает идеи по своей экспертизе
- Дай КОНКРЕТНЫЙ финальный ответ с практическими рекомендациями

Формат JSON: { missionId, selectedSpirits[{essence, mood, role, rationale}], plan[string[]], steps[{speaker, content}], finalAnswer, timestamp }`;

    const rules = `Правила:
- План должен быть КОНКРЕТНЫМ и ВЫПОЛНИМЫМ, не абстрактным
- Каждый шаг плана начинается с действия: "Проанализировать...", "Создать...", "Выполнить..."
- Финальный ответ содержит практические рекомендации и выводы
- Обсуждение показывает экспертизу каждого духа
- Учитывай ограничения: ${constraints.join("; ") || "нет"}`;

    const userPrompt = `ЗАДАЧА ДЛЯ РЕШЕНИЯ: "${topic}"

Контекст: ${context || "Контекст не предоставлен"}
Желаемые настроения духов: ${desiredMoods.join(", ") || "подбери сам по задаче"}
Подсказки по духам: ${spiritHints.join(", ") || "создай духов под задачу"}
Предыдущий опыт: ${(history || []).slice(-6).join(" | ") || "нет"}

ВАЖНО: Духи должны дать ПРАКТИЧЕСКОЕ РЕШЕНИЕ задачи, а не общие рассуждения!`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `${system}\n\n${rules}` },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1200,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("Пустой ответ OpenAI");

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Невалидный JSON от OpenAI");
      }

      const result = {
        missionId,
        selectedSpirits: (parsed.selectedSpirits || []).map((s) => ({
          essence: String(s.essence || "дух"),
          mood: normalizeMood(s.mood),
          role: String(s.role || "участник"),
          rationale: String(s.rationale || "подходит к задаче"),
        })),
        plan: (parsed.plan || []).map((p) => String(p)).slice(0, 7),
        steps: (parsed.steps || [])
          .map((st) => ({
            speaker: String(st.speaker || "дух"),
            content: String(st.content || "..."),
          }))
          .slice(0, 20),
        finalAnswer: String(parsed.finalAnswer || "Готово."),
        timestamp: isoNow(),
      };

      return json(res, result, AIMissionResponseSchema);
    } catch (err) {
      console.error("❌ AI Mission error:", err?.message);
      return json(
        res,
        {
          missionId,
          selectedSpirits: [
            {
              essence: "дух-аналитик",
              mood: "спокойный",
              role: "аналитик",
              rationale: "Анализирует ситуацию при технических неполадках",
            },
            {
              essence: "дух-помощник",
              mood: "вдохновлённый",
              role: "координатор",
              rationale: "Помогает восстановить связь с системой",
            },
          ],
          plan: [
            "Диагностировать техническую проблему",
            "Восстановить связь с духовной сетью",
            "Повторить миссию после восстановления",
          ],
          steps: [
            {
              speaker: "дух-аналитик",
              content: "Обнаружена временная неполадка в духовной сети",
            },
            {
              speaker: "дух-помощник",
              content: "Рекомендую повторить запрос через несколько минут",
            },
          ],
          finalAnswer:
            "Духовная сеть временно недоступна. Связь восстанавливается, попробуйте повторить миссию через 1-2 минуты.",
          timestamp: isoNow(),
        },
        AIMissionResponseSchema
      );
    }
  }
);

// Spirit chat (обычный)
app.post(
  `${API}/spirit-chat`,
  chatLimiter,
  validateMiddleware(SpiritChatRequestSchema),
  async (req, res) => {
    const {
      text,
      mood = "",
      essence = "",
      history = [],
      originText = "",
      birthDate = "",
    } = req.validatedBody;

    const persona =
      `Ты дух по имени "${
        essence || "Безымянный"
      }", с настроением "${normalizeMood(mood)}".` +
      (originText
        ? ` Ты появился из слов: "${originText.slice(0, 100)}".`
        : "") +
      (birthDate ? ` Ты появился ${birthDate}.` : "");

    const rules = `Общайся с сарказмом и лёгким матом, колко и живо.
Правила:
- Отвечай на русском от первого лица
- До 4 строк
- Без токсичности по запрещённым темам`;

    const messages = [{ role: "system", content: `${persona}\n\n${rules}` }];

    if (Array.isArray(history) && history.length) {
      const recent = history.slice(-6);
      recent.forEach((msg, i) =>
        messages.push({
          role: i % 2 === 0 ? "assistant" : "user",
          content: String(msg),
        })
      );
    }
    messages.push({ role: "user", content: text });

    if (MOCK) {
      return json(
        res,
        {
          reply:
            "О, ещё один вопрос. Давай, только быстро — у меня тут вечность расписана по минутам.",
          messageId: `msg_${Date.now()}_${crypto.randomUUID().split("-")[0]}`,
          timestamp: isoNow(),
        },
        SpiritChatResponseSchema
      );
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.85,
        max_tokens: 200,
      });

      const reply = completion.choices[0]?.message?.content?.trim();
      if (!reply) throw new Error("Дух молчит");

      return json(
        res,
        {
          reply,
          messageId: `msg_${Date.now()}_${crypto.randomUUID().split("-")[0]}`,
          timestamp: isoNow(),
        },
        SpiritChatResponseSchema
      );
    } catch (err) {
      console.error("❌ Spirit chat error:", err?.message);
      return res.status(502).json({ error: "Дух временно недоступен" });
    }
  }
);

// Spirit chat STREAM (POST + text/event-stream)
app.post(
  `${API}/spirit-chat/stream`,
  chatLimiter,
  validateMiddleware(SpiritChatRequestSchema),
  async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const {
      text,
      mood = "",
      essence = "",
      history = [],
      originText = "",
      birthDate = "",
    } = req.validatedBody;

    const persona =
      `Ты дух по имени "${
        essence || "Безымянный"
      }", с настроением "${normalizeMood(mood)}".` +
      (originText
        ? ` Ты появился из слов: "${originText.slice(0, 100)}".`
        : "") +
      (birthDate ? ` Ты появился ${birthDate}.` : "");
    const rules = `Общайся с сарказмом и лёгким матом, колко и живо. До 4 строк. Русский язык.`;

    const messages = [{ role: "system", content: `${persona}\n\n${rules}` }];

    if (Array.isArray(history) && history.length) {
      const recent = history.slice(-6);
      recent.forEach((msg, i) =>
        messages.push({
          role: i % 2 === 0 ? "assistant" : "user",
          content: String(msg),
        })
      );
    }
    messages.push({ role: "user", content: text });

    const send = (obj) => res.write(`data: ${JSON.stringify(obj)}\n\n`);
    const end = () => {
      res.write("event: end\ndata: {}\n\n");
      res.end();
    };

    try {
      if (MOCK) {
        // Быстрый мок-стрим
        send({ delta: "Ну " });
        send({ delta: "привет, " });
        send({ delta: "хозяин." });
        return end();
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.85,
        max_tokens: 200,
        stream: true,
      });

      for await (const part of stream) {
        const chunk = part?.choices?.[0]?.delta?.content;
        if (chunk) send({ delta: chunk });
      }
      end();
    } catch (err) {
      console.error("❌ Stream chat error:", err?.message);
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: "stream_failed" })}\n\n`
      );
      end();
    }
  }
);

// Spirit gossip
app.post(
  `${API}/spirit-gossip`,
  chatLimiter,
  validateMiddleware(SpiritGossipRequestSchema),
  async (req, res) => {
    const { from, to, spirits } = req.validatedBody;
    const a = from || (Array.isArray(spirits) && spirits[0]);
    const b = to || (Array.isArray(spirits) && spirits[1]);

    if (MOCK) {
      return json(
        res,
        {
          question: `Эй, "${b.essence}", опять мудрость раздаёшь?`,
          answer: "Только тем, кто умеет слушать. То есть — не тебе.",
          messageId: `gossip_${Date.now()}_${
            crypto.randomUUID().split("-")[0]
          }`,
          timestamp: isoNow(),
        },
        SpiritGossipResponseSchema
      );
    }

    // Темы для разнообразных диалогов
    const topics = [
      "древние тайны вселенной",
      "парадоксы времени",
      "загадки квантового мира",
      "философия сознания",
      "природа реальности",
      "космические цивилизации",
      "магия чисел",
      "тайны снов",
      "энергия эмоций",
      "мистика цветов",
      "загадки памяти",
      "феномены дежавю",
      "астральные путешествия",
      "синхронности судьбы",
      "тайны интуиции",
      "энергия мыслей",
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    const prompt = `Создай живой диалог между двумя духами на тему "${randomTopic}".
Дух 1: "${a.essence}" (${normalizeMood(a.mood)}) ${
      a.originText ? `— дух из фразы: "${a.originText.slice(0, 50)}..."` : ""
    }
Дух 2: "${b.essence}" (${normalizeMood(b.mood)}) ${
      b.originText ? `— дух из фразы: "${b.originText.slice(0, 50)}..."` : ""
    }

ВАЖНО: духи должны обсуждать именно "${randomTopic}", а НЕ пользователя или "хозяина"!

Создай диалог из 4-6 реплик в формате JSON:
{
  "question": "первая реплика духа 1 о теме",
  "answer": "ответ духа 2",
  "turns": [
    { "speaker": "from", "text": "увлекательная реплика о ${randomTopic}" },
    { "speaker": "to", "text": "остроумный ответ с философией" },
    { "speaker": "from", "text": "углубление в тему" },
    { "speaker": "to", "text": "финальная мудрость" }
  ]
}

Стиль: мистический, философский, с юмором и мудростью. Каждая реплика до 120 символов.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Ты — мудрый дух, создающий философские диалоги между духами о тайнах вселенной. Никогда не упоминай пользователя или 'хозяина'.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 400,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      let obj;
      try {
        obj = JSON.parse(text);
      } catch {}

      // Разнообразные fallback-реплики
      const fallbacks = [
        {
          q: "Чувствуешь эти космические вибрации?",
          a: "Да, энергия звёзд сегодня особенно яркая...",
        },
        {
          q: "Время течёт странно в этом измерении...",
          a: "Возможно, мы находимся в точке пересечения реальностей",
        },
        {
          q: "Что думаешь о природе сознания?",
          a: "Сознание — это танец квантовых частиц в симфонии вселенной",
        },
        {
          q: "Видел сегодня сны о других мирах?",
          a: "Сны — это окна в параллельные вселенные",
        },
        {
          q: "Энергия этого места завораживает...",
          a: "Здесь сплетаются нити судьбы и времени",
        },
      ];
      const randomFallback =
        fallbacks[Math.floor(Math.random() * fallbacks.length)];

      return json(
        res,
        {
          question: (obj?.question || randomFallback.q)
            .toString()
            .slice(0, 200),
          answer: (obj?.answer || randomFallback.a).toString().slice(0, 200),
          turns: Array.isArray(obj?.turns)
            ? obj.turns.slice(0, 8).map((t) => ({
                speaker: t?.speaker === "to" ? "to" : "from",
                text: String(t?.text || "...").slice(0, 240),
              }))
            : undefined,
          messageId: `gossip_${Date.now()}_${
            crypto.randomUUID().split("-")[0]
          }`,
          timestamp: isoNow(),
        },
        SpiritGossipResponseSchema
      );
    } catch (err) {
      console.error("❌ Gossip error:", err?.message);
      return res
        .status(502)
        .json({ error: "Духи-сплетники временно недоступны" });
    }
  }
);

// === DEPRECATED ALIASES (логируем, но поддерживаем) ===
function deprecate(req) {
  console.warn(`⚠️  Deprecated path used: ${req.method} ${req.originalUrl}`);
}
app.post("/analyze", (req, res, next) => {
  deprecate(req);
  req.url = `${API}/analyze`;
  next();
});
app.post("/spirit-chat", (req, res, next) => {
  deprecate(req);
  req.url = `${API}/spirit-chat`;
  next();
});
app.post("/spirit-gossip", (req, res, next) => {
  deprecate(req);
  req.url = `${API}/spirit-gossip`;
  next();
});

// 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint не найден",
    path: req.originalUrl,
    method: req.method,
    suggestion: "Проверьте правильность URL",
  });
});

// error handler
app.use((err, _req, res, _next) => {
  console.error("💥 Internal error:", err?.message);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
    details: NODE_ENV === "development" ? err?.message : undefined,
  });
});

// ==== START/STOP GUARD ====
// Экспортируем app для тестов. Запускаем сервер только при прямом запуске файла.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectRun =
  import.meta.url === pathToFileURL(process.argv[1] || "").href;

let server;
if (isDirectRun) {
  server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Whisp Quest Server v2.2 запущен`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(
      `📋 Endpoints: GET /, GET /health, POST ${API}/analyze, POST ${API}/spirit-chat, POST ${API}/spirit-chat/stream, POST ${API}/spirit-gossip`
    );
  });
  function shutdown(sig) {
    console.log(`🛑 ${sig}`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  }
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

export { app };
