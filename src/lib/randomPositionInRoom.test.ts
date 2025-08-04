import { randomPositionInRoom } from './randomPositionInRoom';

describe('randomPositionInRoom', () => {
  it('returns position array with 3 coordinates', () => {
    const position = randomPositionInRoom();
    expect(position).toHaveLength(3);
    expect(Array.isArray(position)).toBe(true);
  });

  it('returns valid x coordinate range (-6 to 6)', () => {
    // Тестируем много раз для проверки диапазона
    for (let i = 0; i < 100; i++) {
      const [x] = randomPositionInRoom();
      expect(x).toBeGreaterThanOrEqual(-6);
      expect(x).toBeLessThanOrEqual(6);
    }
  });

  it('returns valid y coordinate range (1.5 to 6.5)', () => {
    for (let i = 0; i < 100; i++) {
      const [, y] = randomPositionInRoom();
      expect(y).toBeGreaterThanOrEqual(1.5);
      expect(y).toBeLessThanOrEqual(6.5);
    }
  });

  it('returns valid z coordinate range (-4 to 4)', () => {
    for (let i = 0; i < 100; i++) {
      const [,, z] = randomPositionInRoom();
      expect(z).toBeGreaterThanOrEqual(-4);
      expect(z).toBeLessThanOrEqual(4);
    }
  });

  it('returns different positions on multiple calls', () => {
    const position1 = randomPositionInRoom();
    const position2 = randomPositionInRoom();
    
    // Очень маловероятно, что две случайные позиции будут одинаковыми
    expect(position1).not.toEqual(position2);
  });

  it('all coordinates are numbers', () => {
    const [x, y, z] = randomPositionInRoom();
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
    expect(typeof z).toBe('number');
    expect(Number.isFinite(x)).toBe(true);
    expect(Number.isFinite(y)).toBe(true);
    expect(Number.isFinite(z)).toBe(true);
  });
});
