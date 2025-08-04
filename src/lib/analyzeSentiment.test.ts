import { analyzeSentiment } from './analyzeSentiment';

describe('analyzeSentiment', () => {
  it('detects positive mood', async () => {
    const result = await analyzeSentiment('Это было прекрасно, счастье и радость!');
    expect(result.mood).toBe('happy');
  });

  it('detects negative mood', async () => {
    const result = await analyzeSentiment('Меня одолела грусть и печаль.');
    expect(result.mood).toBe('sad');
  });

  it('detects angry mood', async () => {
    const result = await analyzeSentiment('Меня бесит и раздражает всё вокруг!');
    expect(result.mood).toBe('angry');
  });

  it('detects calm mood', async () => {
    const result = await analyzeSentiment('Я чувствую гармонию и покой.');
    expect(result.mood).toBe('calm');
  });

  it('detects inspired mood', async () => {
    const result = await analyzeSentiment('Меня переполняет вдохновение и творчество!');
    expect(result.mood).toBe('inspired');
  });

  it('returns all required fields', async () => {
    const result = await analyzeSentiment('Любовь и радость');
    expect(result).toHaveProperty('mood');
    expect(result).toHaveProperty('color');
    expect(result).toHaveProperty('rarity');
    expect(result).toHaveProperty('essence');
    expect(result).toHaveProperty('dialogue');
  });
});
