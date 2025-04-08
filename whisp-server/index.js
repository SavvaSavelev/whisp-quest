import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const HF_TOKEN = process.env.HF_TOKEN;

const HF_URL =
  "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

app.post("/analyze", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    });

    const contentType = response.headers.get("content-type");
    const isJSON = contentType && contentType.includes("application/json");
    const result = isJSON ? await response.json() : await response.text();

    // модель ещё загружается?
    if (
      typeof result === "object" &&
      result.error?.includes("currently loading") ||
      response.status === 503
    ) {
      console.warn("⏳ HuggingFace model is still loading. Try again soon.");
      return res.status(503).json({ error: "model loading, try again soon" });
    }

    // внутренняя ошибка
    if (!response.ok) {
      console.error("❌ HF API ERROR:", response.status, result);
      return res.status(500).json({ error: "huggingface internal error", details: result });
    }

    return res.json(result);
  } catch (e) {
    console.error("❌ SERVER ERROR:", e);
    return res.status(500).json({ error: "server crash", message: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 HF Proxy ready → http://localhost:${PORT}`);
});
