// 🛡️ Zod валидация схемы для Whisp Quest API (ESM)
import { z } from "zod";

// 📝 Общие валидаторы
export const TextValidator = z
  .string()
  .min(1, "Текст не может быть пустым")
  .max(5000, "Текст слишком длинный (максимум 5000 символов)")
  .trim();

export const ShortTextValidator = z
  .string()
  .min(1, "Текст не может быть пустым")
  .max(1000, "Текст слишком длинный (максимум 1000 символов)")
  .trim();

export const MoodValidator = z.enum(
  [
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
  ],
  { errorMap: () => ({ message: "Неизвестное настроение" }) }
);

export const RarityValidator = z.enum(["обычный", "редкий", "легендарный"], {
  errorMap: () => ({ message: "Неизвестная редкость" }),
});

// 🧙‍♂️ Analyze
export const AnalyzeRequestSchema = z.object({
  text: TextValidator,
});

export const AnalyzeResponseSchema = z.object({
  mood: MoodValidator,
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Неверный формат цвета"),
  rarity: RarityValidator,
  essence: z.string().min(1, "Сущность не может быть пустой"),
  dialogue: z.string().min(1, "Диалог не может быть пустым"),
  timestamp: z.string().datetime(),
  cached: z.boolean(),
});

// 💬 Chat
export const SpiritChatRequestSchema = z.object({
  text: ShortTextValidator,
  mood: MoodValidator.optional(),
  essence: z.string().optional(),
  history: z.array(z.string()).optional().default([]),
  originText: z.string().optional(),
  birthDate: z.string().optional(),
});

export const SpiritChatResponseSchema = z.object({
  reply: z.string().min(1, "Ответ не может быть пустым"),
  messageId: z.string().min(1, "ID сообщения обязателен"),
  timestamp: z.string().datetime(),
});

// 🗣️ Gossip
export const SpiritGossipRequestSchema = z
  .object({
    from: z
      .object({
        essence: z.string().min(1, "Сущность первого духа обязательна"),
        mood: MoodValidator,
        originText: z.string().optional(),
      })
      .optional(),
    to: z
      .object({
        essence: z.string().min(1, "Сущность второго духа обязательна"),
        mood: MoodValidator,
        originText: z.string().optional(),
      })
      .optional(),
    spirits: z
      .array(
        z.object({
          essence: z.string().min(1, "Сущность духа обязательна"),
          mood: MoodValidator,
          originText: z.string().optional(),
        })
      )
      .min(2, "Нужно минимум 2 духа для сплетни")
      .max(2, "Максимум 2 духа для сплетни")
      .optional(),
  })
  .refine(
    (data) => {
      const hasOld = !!(data.from && data.to);
      const hasNew = !!(data.spirits && data.spirits.length === 2);
      return hasOld || hasNew;
    },
    {
      message:
        "Необходимо передать либо from/to, либо spirits массив с 2 духами",
    }
  );

export const SpiritGossipResponseSchema = z.object({
  question: z.string().min(1, "Вопрос не может быть пустым"),
  answer: z.string().min(1, "Ответ не может быть пустым"),
  messageId: z.string().min(1, "ID сообщения обязателен"),
  timestamp: z.string().datetime(),
});

// 🏥 Health
export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  uptime: z.number().positive(),
  memory: z.object({
    rss: z.number(),
    heapTotal: z.number(),
    heapUsed: z.number(),
    external: z.number(),
    arrayBuffers: z.number(),
  }),
  cache_size: z.number().nonnegative(),
  openai_configured: z.boolean(),
  timestamp: z.string().datetime(),
});

// 🔧 Утилиты
export function validateRequest(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      const e = new Error(`Ошибка валидации: ${errorMessages}`);
      e.name = "ValidationError";
      e.details = error.errors;
      throw e;
    }
    throw error;
  }
}

export function validateMiddleware(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = validateRequest(schema, req.body);
      next();
    } catch (error) {
      if (error.name === "ValidationError") {
        return res.status(400).json({
          error: "Некорректные данные запроса",
          details: error.message,
          validation_errors: error.details,
        });
      }
      console.error("❌ Ошибка валидации:", error);
      res
        .status(500)
        .json({ error: "Внутренняя ошибка сервера при валидации" });
    }
  };
}

export function validateResponse(schema, data) {
  if (process.env.NODE_ENV === "development") {
    try {
      return schema.parse(data);
    } catch (error) {
      console.warn("⚠️ Ответ API не соответствует схеме:", error);
      return data;
    }
  }
  return data;
}

console.log("🛡️ Zod валидация схем загружена");
