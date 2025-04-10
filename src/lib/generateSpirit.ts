import { Spirit, SpiritMood } from "../entities/types";
import { analyzeSentiment } from "./sentimentAnalyzer";

// Генерация позиции внутри сферы
function randomPositionInSphere(radius = 2.2): [number, number, number] {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = radius * Math.cbrt(Math.random());

  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);

  return [x, y, z];
}

export async function generateSpirit(text: string): Promise<Spirit> {
  const { label, all } = await analyzeSentiment(text);
  const mood = mapLabelToMood(label, all);
  const color = moodToColor(mood);
  const essence = moodToEssence(mood);
  const rarity = determineRarity(mood);

  return {
    id: crypto.randomUUID(),
    name: generateNameFromMood(mood),
    mood,
    color,
    essence,
    createdAt: Date.now(),
    position: randomPositionInSphere(),
    rarity,
  };
}

// 🧠 Расширенная логика для интерпретации эмоций
function mapLabelToMood(label: string, allLabels: string[]): SpiritMood {
  const clean = (label || "").toLowerCase();

  const fallback = allLabels.find((l) =>
    ["joy", "love", "sadness", "anger", "fear", "surprise", "disgust"].includes(
      l.toLowerCase()
    )
  );

  const mood = ["joy", "love", "optimism", "admiration", "amusement"].includes(clean)
    ? "радостный"
    : clean.includes("sadness")
    ? "печальный"
    : clean.includes("anger")
    ? "злой"
    : clean.includes("fear")
    ? "испуганный"
    : clean.includes("surprise")
    ? "игривый"
    : clean.includes("disgust")
    ? "меланхоличный"
    : clean.includes("neutral")
    ? "спокойный"
    : fallback
    ? mapLabelToMood(fallback, [])
    : "спокойный";

  return mood as SpiritMood;
}

function moodToColor(mood: SpiritMood): string {
  switch (mood) {
    case "радостный":
      return "#FFE066";
    case "печальный":
      return "#89AFCB";
    case "вдохновлённый":
      return "#A78BFA";
    case "злой":
      return "#F87171";
    case "сонный":
      return "#CBD5E1";
    case "испуганный":
      return "#7DD3FC";
    case "спокойный":
      return "#C4F1F9";
    case "игривый":
      return "#FBBF24";
    case "меланхоличный":
      return "#94A3B8";
    default:
      return "#E0E7FF";
  }
}

function moodToEssence(mood: SpiritMood): string {
  switch (mood) {
    case "вдохновлённый":
      return "сияние";
    case "сонный":
      return "туман";
    case "злой":
      return "огонь";
    case "печальный":
      return "дождь";
    case "радостный":
      return "свет";
    case "игривый":
      return "искры";
    case "испуганный":
      return "тень";
    case "спокойный":
      return "вода";
    case "меланхоличный":
      return "листва";
    default:
      return "пыль";
  }
}

function generateNameFromMood(mood: SpiritMood): string {
  const base = {
    радостный: "Люмо",
    печальный: "Морин",
    вдохновлённый: "Идеаликс",
    злой: "Фуро",
    сонный: "Нимбо",
    испуганный: "Шарикс",
    спокойный: "Велли",
    игривый: "Твикс",
    меланхоличный: "Осэо",
  };
  return base[mood] + "-" + Math.floor(Math.random() * 1000);
}

function determineRarity(mood: SpiritMood): Spirit["rarity"] {
  const cursedMoods: SpiritMood[] = ["злой", "испуганный", "печальный"];
  const isCursed = cursedMoods.includes(mood);

  if (isCursed && Math.random() < 0.3) return "проклятый";
  if (Math.random() < 0.1) return "сияющий";
  return "обычный";
}
