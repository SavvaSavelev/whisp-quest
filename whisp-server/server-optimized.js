// Whisp Quest Server v2.1.1 — Zod-compatible hardened build (ESM)

import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import crypto from "node:crypto";
import OpenAI from "openai";

import {
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

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY отсутствует. Укажите в .env");
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

function normalizeOpenAIError(err) {
  const code = err?.status ?? err?.statusCode;
  const message = err?.message ?? "OpenAI error";
  if (err?.code === "insufficient_quota" || code === 429) {
    return {
      http: 503,
      body: { error: "Превышена квота OpenAI API", code: "QUOTA_EXCEEDED" },
    };
  }
  if (code === 400)
    return { http: 400, body: { error: "Некорректный запрос к OpenAI" } };
  if (code === 401)
    return { http: 502, body: { error: "Неверный OPENAI_API_KEY" } };
  return { http: 502, body: { error: message } };
}

const json = (res, data, schema) =>
  res.json(schema ? validateResponse(schema, data) : data);

// ==== ROUTES ====

// Root
app.get("/", (_req, res) => {
  json(res, {
    name: "✨ Whisp Quest Server v2.1.1",
    status: "running",
    features: [
      "🔒 Security",
      "⚡ Rate Limiting",
      "💾 Caching",
      "🔍 Monitoring",
    ],
    endpoints: {
      analyze: "POST /analyze",
      chat: "POST /spirit-chat",
      gossip: "POST /spirit-gossip",
      health: "GET /health",
    },
    timestamp: isoNow(),
  });
});

// Health
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
      openai_configured: true,
      timestamp: isoNow(),
    },
    HealthResponseSchema
  );
});

app.get("/health/detailed", (_req, res) => {
  const mu = process.memoryUsage();
  json(res, {
    server: {
      status: "ok",
      uptime: Math.floor(process.uptime()),
      port: PORT,
      node_version: process.version,
    },
    memory: {
      ...mu,
      usage_percent: Math.round((mu.heapUsed / mu.heapTotal) * 100),
    },
    cache: { size: cache.size, ttl_sec: Math.round(CACHE_TTL_MS / 1000) },
    openai: { configured: true },
    timestamp: isoNow(),
  });
});

// Analyze
app.post(
  "/analyze",
  validateMiddleware(AnalyzeRequestSchema),
  async (req, res) => {
    const { text } = req.validatedBody;
    const key = `spirit:${hashKey(text)}`;
    const cached = getCache(key);
    if (cached)
      return json(res, { ...cached, cached: true }, AnalyzeResponseSchema);

    const system = `Ты — древний духоанализатор. Верни ровно JSON:
{
  "mood": "...",         // одно слово, можно RU или en из списка
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

// Spirit chat
app.post(
  "/spirit-chat",
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

// Spirit gossip
app.post(
  "/spirit-gossip",
  chatLimiter,
  validateMiddleware(SpiritGossipRequestSchema),
  async (req, res) => {
    const { from, to, spirits } = req.validatedBody;
    const a = from || (Array.isArray(spirits) && spirits[0]);
    const b = to || (Array.isArray(spirits) && spirits[1]);

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

// start/stop
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Whisp Quest Server v2.1.1 запущен`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(
    `📋 Endpoints: GET /, GET /health, POST /analyze, POST /spirit-chat, POST /spirit-gossip`
  );
});
function shutdown(sig) {
  console.log(`🛑 ${sig}`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
