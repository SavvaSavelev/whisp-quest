export function randomPositionInRoom(): [number, number, number] {
  const x = (Math.random() - 0.5) * 12;
  const y = Math.random() * 5 + 1.5;
  const z = (Math.random() - 0.5) * 8;
  return [x, y, z];
}
