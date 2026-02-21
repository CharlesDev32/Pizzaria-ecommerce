export function pageParams(page = 1, limit = 12): Record<string, number> {
  return { page, limit };
}
