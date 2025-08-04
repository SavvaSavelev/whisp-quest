import { Spirit } from '../entities/types';
import { randomPositionInRoom } from './randomPositionInRoom';
import { apiClient } from './APIClient';

/**
 * Анализирует текст через whisp-server с OpenAI и создаёт объект духа.
 * Заметьте: теперь эта функция НЕ помещает духа в архив.
 */
export const generateSpirit = async (text: string): Promise<Spirit | null> => {
  try {
    if (!text.trim()) {
      throw new Error('Текст не может быть пустым');
    }

    // Используем API клиент для анализа через ваш whisp-server
    const analysis = await apiClient.analyzeSentiment(text);
    
    // Генерируем имя духа на основе настроения
    const spiritNames = {
      радостный: ['Радостный', 'Светлый', 'Веселый', 'Ликующий', 'Сияющий'],
      печальный: ['Грустный', 'Печальный', 'Тоскующий', 'Унылый', 'Меланхоличный'],
      злой: ['Гневный', 'Яростный', 'Разъяренный', 'Бушующий', 'Неистовый'],
      спокойный: ['Спокойный', 'Безмятежный', 'Умиротворенный', 'Тихий', 'Мирный'],
      вдохновлённый: ['Вдохновенный', 'Творческий', 'Озаренный', 'Воодушевленный', 'Мечтательный'],
      сонный: ['Дремлющий', 'Сонный', 'Засыпающий', 'Дремотный', 'Туманный'],
      испуганный: ['Пугливый', 'Трепещущий', 'Боязливый', 'Настороженный', 'Робкий'],
      игривый: ['Игривый', 'Шаловливый', 'Проказливый', 'Озорной', 'Весёлый'],
      меланхоличный: ['Меланхоличный', 'Задумчивый', 'Ностальгичный', 'Мечтательный', 'Томный']
    };
    
    const moodNames = spiritNames[analysis.mood as keyof typeof spiritNames] || spiritNames.спокойный;
    const randomName = moodNames[Math.floor(Math.random() * moodNames.length)];
    
    const spirit: Spirit = {
      id: crypto.randomUUID(),
      name: `${randomName} дух`,
      mood: analysis.mood,
      color: analysis.color || '#ffffff',
      rarity: analysis.rarity || 'обычный',
      essence: analysis.essence || 'Непознанная сущность',
      dialogue: analysis.dialogue || 'Я был рождён из тишины...',
      originText: text,
      position: randomPositionInRoom(),
      birthDate: new Date().toISOString(),
    };

    return spirit;
  } catch (error) {
    console.error('❌ Ошибка генерации духа:', error);
    return null;
  }
};
