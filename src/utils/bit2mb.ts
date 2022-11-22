export function bit2mb(value: number): number {
  return parseFloat((value / 1024 / 1024).toFixed(2));
}