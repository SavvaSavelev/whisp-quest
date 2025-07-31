import { Spirit } from '../entities/types';
import { randomPositionInRoom } from './randomPositionInRoom';

/**
 * Анализирует текст и создаёт объект духа.
 * Заметьте: теперь эта функция НЕ помещает духа в архив.
 */
export const generateSpirit = async (text: string): Promise<Spirit | null> => {
  const response = await fetch('http://localhost:4000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const spiritData = await response.json();

  const spirit: Spirit = {
    id: crypto.randomUUID(),
    name: spiritData.essence || 'Безымянный дух',
    mood: spiritData.mood,
    color: spiritData.color || '#ffffff',
    rarity: spiritData.rarity || 'обычный',
    essence: spiritData.essence || 'Непознанная сущность',
    dialogue: spiritData.dialogue || 'Я был рождён из тишины...',
    originText: text,
    position: randomPositionInRoom(),
    birthDate: new Date().toISOString(),
  };

  return spirit;
};
