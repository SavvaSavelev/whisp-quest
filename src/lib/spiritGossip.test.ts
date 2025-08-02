describe('spiritGossip', () => {
import { spiritGossip } from './spiritGossip';
import { Spirit } from '../entities/types';

describe('spiritGossip', () => {
  it('should return gossip object for two valid spirits', async () => {
    const spiritA: Spirit = {
      id: '1',
      name: 'SpiritA',
      mood: 'радостный',
      color: '#fff',
      rarity: 'обычный',
      essence: 'light',
      position: [0,0,0]
    };
    const spiritB: Spirit = {
      id: '2',
      name: 'SpiritB',
      mood: 'печальный',
      color: '#000',
      rarity: 'редкий',
      essence: 'dark',
      position: [1,1,1]
    };
    const result = await spiritGossip(spiritA, spiritB);
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('from');
    expect(result).toHaveProperty('to');
    expect(result).toHaveProperty('question');
    expect(result).toHaveProperty('answer');
  });
});
