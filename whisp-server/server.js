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
  AnalyzeRequestSchema,
  AnalyzeResponseSchema,
  HealthResponseSchema,
  SpiritChatRequestSchema,
  SpiritChatResponseSchema,
  SpiritGossipRequestSchema,
  SpiritGossipResponseSchema,
  AIMissionRequestSchema,
  AIMissionResponseSchema,
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
  if (!mood) return "печальный";
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
  return "печальный";
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
      const result = {
        mood: "радостный",
        color: "#33cc99",
        rarity: "редкий",
        essence: "искрящийся комар доверия",
        dialogue: "Ну давай, удиви меня ещё одним шедевром самокритики.",
        timestamp: isoNow(),
        cached: false,
      };
      setCache(key, result);
      return json(res, result, AnalyzeResponseSchema);
    }

    const system = `Ты — древний духоанализатор. Верни ровно JSON:
{
  "mood": "...",
  "color": "#RRGGBB",
  "rarity": "обычный|редкий|легендарный",
  "essence": "...",
  "dialogue": "..."
}`;
    const user = `Вот слова человека: "${text}"`;

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
      return json(
        res,
        {
          mood: "печальный",
          color: "#808080",
          rarity: "обычный",
          essence: "дух ошибки",
          dialogue: "Что-то пошло не так при моем рождении...",
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

    const missionId = `mission_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

    if (MOCK) {
      const moodsPool = desiredMoods.length
        ? desiredMoods
        : ["вдохновлённый", "радостный", "спокойный"];
      const mockTeam = Array.from({ length: Math.max(2, Math.min(5, teamSize)) }).map(
        (_, i) => ({
          essence: spiritHints[i]?.essence || `дух #${i + 1}`,
          mood: normalizeMood(spiritHints[i]?.mood || moodsPool[i % moodsPool.length]),
          role: ["аналитик", "скептик", "мотиватор", "исследователь", "организатор"][i % 5],
          rationale: "Подходит по настрою и роли для данной миссии",
        })
      );

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
            { speaker: mockTeam[0].essence, content: `Предлагаю начать: ${topic}` },
            { speaker: mockTeam[1].essence, content: "Проверим риски и слабые места" },
            { speaker: mockTeam[2].essence, content: "Соберу мысли в план" },
          ],
          finalAnswer:
            "Итог: команда духов составила план и дала рекомендации. Готово к следующему шагу.",
          timestamp: isoNow(),
        },
        AIMissionResponseSchema
      );
    }

    // OpenAI режим — сформируем системный запрос на командную работу
    const system = `Ты — фасилитатор команды духов. На вход тема миссии, ограничения и подсказки по духам.
Выбирай ${teamSize} духов с подходящими ролями, обсуждай шаги и дай финальный ответ.
Верни JSON с полями missionId, selectedSpirits[{ essence, mood, role, rationale }], plan[string[]], steps[{ speaker, content }], finalAnswer, timestamp.`;

    const rules = `Соблюдай:
- Краткость, ясность, практичность
- Максимум 7 шагов плана, 10 предложений финального ответа
- Учитывай ограничения: ${constraints.join("; ") || "нет"}`;

    const hints = spiritHints
      .map((h, i) => `#${i + 1}: mood=${h.mood || "?"}, essence=${h.essence || "?"}`)
      .join("; ");

    const user = `Тема: ${topic}
Контекст: ${context}
Желаемые настроения: ${desiredMoods.join(", ") || "не указаны"}
Подсказки духов: ${hints || "нет"}
История: ${(history || []).slice(-6).join(" | ")}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: `${system}\n\n${rules}` },
          { role: "user", content: user },
        ],
        temperature: 0.6,
        max_tokens: 700,
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
        steps: (parsed.steps || []).map((st) => ({
          speaker: String(st.speaker || "дух"),
          content: String(st.content || "...")
        })).slice(0, 20),
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
          selectedSpirits: [],
          plan: ["Сформулировать тему", "Собрать духов", "Согласовать шаги"],
          steps: [{ speaker: "система", content: "Возникла ошибка, попробуйте позже" }],
          finalAnswer: "Сейчас духи недоступны. Повторите попытку позже.",
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

    const prompt = `Создай короткий диалог-сплетню.
Дух 1: "${a.essence}" (настроение: ${normalizeMood(a.mood)}) ${
      a.originText ? `; из текста: "${a.originText}"` : ""
    }
Дух 2: "${b.essence}" (настроение: ${normalizeMood(b.mood)}) ${
      b.originText ? `; из текста: "${b.originText}"` : ""
    }

Формат — строго JSON: { "question": "...", "answer": "..." }
Стиль: сарказм, чёрный юмор, допустим лёгкий мат — без токсичности.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Ты создаёшь остроумные диалоги между духами-сплетниками.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 300,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? "";
      let obj;
      try {
        obj = JSON.parse(text);
      } catch {}

      return json(
        res,
        {
          question: (obj?.question || "Что думаешь о нашем хозяине?")
            .toString()
            .slice(0, 300),
          answer: (obj?.answer || "Думаю, ему не помешало бы больше фантазии…")
            .toString()
            .slice(0, 300),
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
  res
    .status(404)
    .json({
      error: "Endpoint не найден",
      path: req.originalUrl,
      method: req.method,
      suggestion: "Проверьте правильность URL",
    });
});

// error handler
app.use((err, _req, res, _next) => {
  console.error("💥 Internal error:", err?.message);
  res
    .status(500)
    .json({
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
