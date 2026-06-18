export function shortOrderId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}
