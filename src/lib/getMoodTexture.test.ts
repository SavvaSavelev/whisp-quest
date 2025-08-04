import { getMoodTexture, moodToTexture } from './getMoodTexture';

describe('getMoodTexture', () => {
  it('returns correct texture for known moods', () => {
    expect(getMoodTexture('радостный')).toBe('/whisp-quest/textures/face-happy.png');
    expect(getMoodTexture('печальный')).toBe('/whisp-quest/textures/face-sad.png');
    expect(getMoodTexture('злой')).toBe('/whisp-quest/textures/face-angry.png');
    expect(getMoodTexture('вдохновлённый')).toBe('/whisp-quest/textures/face-inspired.png');
    expect(getMoodTexture('спокойный')).toBe('/whisp-quest/textures/face-acceptance.png');
  });

  it('returns default texture for unknown mood', () => {
    expect(getMoodTexture('неизвестное_настроение')).toBe('/whisp-quest/textures/face-sad.png');
    expect(getMoodTexture('')).toBe('/whisp-quest/textures/face-sad.png');
    expect(getMoodTexture('random_text')).toBe('/whisp-quest/textures/face-sad.png');
  });

  it('handles undefined and null gracefully', () => {
    expect(getMoodTexture(undefined as unknown as string)).toBe('/whisp-quest/textures/face-sad.png');
    expect(getMoodTexture(null as unknown as string)).toBe('/whisp-quest/textures/face-sad.png');
  });

  it('has all mood mappings defined', () => {
    const expectedMoods = [
      'радостный', 'печальный', 'злой', 'вдохновлённый', 'спокойный',
      'сонный', 'испуганный', 'игривый', 'меланхоличный'
    ];
    
    expectedMoods.forEach(mood => {
      expect(moodToTexture).toHaveProperty(mood);
      expect(typeof moodToTexture[mood]).toBe('string');
      expect(moodToTexture[mood]).toMatch(/\.png$/);
    });
  });
});
