import { generateSpirit } from './generateSpirit';
import { apiClient } from './APIClient';

// Мокаем API клиент
jest.mock('./APIClient', () => ({
  apiClient: {
    analyzeSentiment: jest.fn()
  }
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('generateSpirit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Стандартный мок ответа API
    mockApiClient.analyzeSentiment.mockResolvedValue({
      mood: 'радостный',
      color: '#FFD700',
      rarity: 'обычный',
      essence: 'Сияние утра',
      dialogue: 'Привет! Я рад существовать!'
    });
  });

  it('creates spirit with valid structure', async () => {
    const spirit = await generateSpirit('Это прекрасный день!');
    
    expect(spirit).not.toBeNull();
    expect(spirit).toHaveProperty('id');
    expect(spirit).toHaveProperty('name');
    expect(spirit).toHaveProperty('mood');
    expect(spirit).toHaveProperty('color');
    expect(spirit).toHaveProperty('rarity');
    expect(spirit).toHaveProperty('essence');
    expect(spirit).toHaveProperty('position');
    expect(spirit).toHaveProperty('birthDate');
    expect(spirit).toHaveProperty('dialogue');
  });

  it('calls API with provided text', async () => {
    const testText = 'Тестовый текст для анализа';
    await generateSpirit(testText);
    
    expect(mockApiClient.analyzeSentiment).toHaveBeenCalledWith(testText);
    expect(mockApiClient.analyzeSentiment).toHaveBeenCalledTimes(1);
  });

  it('generates unique IDs for different spirits', async () => {
    const spirit1 = await generateSpirit('Текст 1');
    const spirit2 = await generateSpirit('Текст 2');
    
    expect(spirit1?.id).not.toBe(spirit2?.id);
  });

  it('sets birthDate to current timestamp', async () => {
    const spirit = await generateSpirit('Тест времени');
    
    expect(spirit?.birthDate).toBeDefined();
    expect(typeof spirit?.birthDate).toBe('string');
  });

  it('returns null for empty text', async () => {
    const result1 = await generateSpirit('');
    const result2 = await generateSpirit('   ');
    
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('handles API errors gracefully', async () => {
    mockApiClient.analyzeSentiment.mockRejectedValue(new Error('API Error'));
    
    const spirit = await generateSpirit('Тест ошибки');
    expect(spirit).toBeNull();
  });

  it('generates position within room bounds', async () => {
    const spirit = await generateSpirit('Тест позиции');
    
    expect(spirit?.position).toHaveLength(3);
    const [x, y, z] = spirit?.position || [0, 0, 0];
    
    expect(x).toBeGreaterThanOrEqual(-6);
    expect(x).toBeLessThanOrEqual(6);
    expect(y).toBeGreaterThanOrEqual(1.5);
    expect(y).toBeLessThanOrEqual(6.5);
    expect(z).toBeGreaterThanOrEqual(-4);
    expect(z).toBeLessThanOrEqual(4);
  });
});
