// 🛡️ Zod валидация схемы для Whisp Quest API
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
  {
    errorMap: () => ({ message: "Неизвестное настроение" }),
  }
);

export const RarityValidator = z.enum(["обычный", "редкий", "легендарный"], {
  errorMap: () => ({ message: "Неизвестная редкость" }),
});

// 🧙‍♂️ Схема для анализа текста (создание духа)
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

// 💬 Схема для чата с духом
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

// 🗣️ Схема для сплетен духов
export const SpiritGossipRequestSchema = z
  .object({
    // Поддерживаем старый формат (from/to)
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

    // Новый формат (spirits array)
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
      // Должен быть либо from/to, либо spirits
      const hasOldFormat = data.from && data.to;
      const hasNewFormat = data.spirits && data.spirits.length === 2;
      return hasOldFormat || hasNewFormat;
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

// 🏥 Схема для health check
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

// 🔧 Утилитарные функции для валидации

/**
 * Валидирует входящий запрос и возвращает валидированные данные
 */
export function validateRequest(schema, data) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      const validationError = new Error(`Ошибка валидации: ${errorMessages}`);
      validationError.name = "ValidationError";
      validationError.details = error.errors;
      throw validationError;
    }
    throw error;
  }
}

/**
 * Middleware для автоматической валидации запросов
 */
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

      // Неожиданная ошибка
      console.error("❌ Ошибка валидации:", error);
      res.status(500).json({
        error: "Внутренняя ошибка сервера при валидации",
      });
    }
  };
}

/**
 * Проверяет ответ перед отправкой (для отладки в development)
 */
export function validateResponse(schema, data) {
  if (process.env.NODE_ENV === "development") {
    try {
      return schema.parse(data);
    } catch (error) {
      console.warn("⚠️ Ответ API не соответствует схеме:", error);
      return data; // Возвращаем как есть, но логируем предупреждение
    }
  }
  return data;
}

console.log("🛡️ Zod валидация схемы загружены");
