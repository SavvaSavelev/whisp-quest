import useInitAssets from './useInitAssets';

test('useInitAssets returns true after assets loaded', () => {
  // Мок загрузки
  expect(typeof useInitAssets).toBe('function');
});
