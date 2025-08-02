export type SpiritAnalysis = {
  mood: string; // радостный, печальный, злой, вдохновлённый, спокойный, сонный, испуганный, игривый, меланхоличный
  color: string; // hex цвет ауры духа
  rarity: string; // обычный, редкий, легендарный
  essence: string; // поэтичное имя духа, типа "песнь ветра", "огонь рассвета"
  dialogue: string; // первая реплика духа при рождении
};

export async function analyzeSentiment(text: string): Promise<SpiritAnalysis> {
  // Локальный анализ без сервера
  try {
    // Симулируем анализ настроения по ключевым словам
    const positiveWords = ['счастье', 'радость', 'весело', 'хорошо', 'отлично', 'прекрасно', 'любовь', 'смех', 'удача', 'победа'];
    const negativeWords = ['грусть', 'печаль', 'плохо', 'ужасно', 'боль', 'страх', 'слезы', 'одиночество', 'проблема', 'беда'];
    const angryWords = ['злость', 'гнев', 'ярость', 'бесит', 'раздражает', 'ненавижу', 'достало', 'fury', 'mad'];
    const calmWords = ['спокойствие', 'мир', 'тишина', 'медитация', 'гармония', 'баланс', 'релакс', 'покой'];
    const inspiredWords = ['вдохновение', 'творчество', 'идея', 'мечта', 'цель', 'искусство', 'создавать', 'творить'];
    
    const lowerText = text.toLowerCase();
    let mood = 'calm';
    let color = '#87CEEB'; // Спокойный голубой
    let rarity = 'обычный';
    let essence = 'Дух равновесия';
    
    // Подсчитываем совпадения
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    const angryCount = angryWords.filter(word => lowerText.includes(word)).length;
    const calmCount = calmWords.filter(word => lowerText.includes(word)).length;
    const inspiredCount = inspiredWords.filter(word => lowerText.includes(word)).length;
    
    // Определяем доминирующее настроение
    const scores = {
      happy: positiveCount,
      sad: negativeCount,
      angry: angryCount,
      calm: calmCount,
      inspired: inspiredCount
    };
    
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      mood = Object.keys(scores).find(key => scores[key as keyof typeof scores] === maxScore) || 'calm';
    }
    
    // Настройка цвета и редкости в зависимости от настроения
    switch (mood) {
      case 'happy':
        color = '#FFD700'; // Золотой
        essence = 'Дух радости';
        rarity = positiveCount > 2 ? 'редкий' : 'обычный';
        break;
      case 'sad':
        color = '#4682B4'; // Стальной синий
        essence = 'Дух печали';
        rarity = negativeCount > 2 ? 'редкий' : 'обычный';
        break;
      case 'angry':
        color = '#DC143C'; // Малиновый
        essence = 'Дух гнева';
        rarity = angryCount > 1 ? 'эпический' : 'редкий';
        break;
      case 'calm':
        color = '#87CEEB'; // Небесно-голубой
        essence = 'Дух умиротворения';
        rarity = 'обычный';
        break;
      case 'inspired':
        color = '#DA70D6'; // Орхидея
        essence = 'Дух вдохновения';
        rarity = inspiredCount > 1 ? 'легендарный' : 'эпический';
        break;
    }
    
    // Генерируем диалог на основе настроения
    const dialogues = {
      happy: [
        'Какая радость наполняет меня! Я танцую в лучах света...',
        'Счастье течет через меня, как теплый солнечный свет.',
        'Я дарю улыбки всем вокруг!'
      ],
      sad: [
        'Слезы духа стекают в вечность...',
        'Я храню твою печаль, чтобы ты стал сильнее.',
        'В грусти есть своя красота...'
      ],
      angry: [
        'Огонь ярости горит в моей сущности!',
        'Гнев - это сила, которая может изменить мир.',
        'Я несу в себе бурю эмоций!'
      ],
      calm: [
        'Покой... тишина... гармония течет через меня.',
        'Я дарю тебе умиротворение души.',
        'В тишине рождается мудрость.'
      ],
      inspired: [
        'Искры творчества летят из моей сущности!',
        'Я вдохновляю на великие свершения!',
        'Мечты и идеи - моя стихия!'
      ]
    };
    
    const moodDialogues = dialogues[mood as keyof typeof dialogues] || dialogues.calm;
    const dialogue = moodDialogues[Math.floor(Math.random() * moodDialogues.length)];

    return {
      mood,
      color,
      rarity,
      essence,
      dialogue
    };

  } catch (error) {
    console.warn("⚠️ Ошибка анализа настроения:", error);
    return {
      mood: "calm",
      color: "#87CEEB",
      rarity: "обычный",
      essence: "Дух неизвестности",
      dialogue: "Я был рождён из тишины..."
    };
  }
}
