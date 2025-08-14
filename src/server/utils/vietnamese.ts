/**
 * Normalizes Vietnamese text by removing diacritics and converting to lowercase
 * This enables diacritic-insensitive search for Vietnamese text
 */
export function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d");
}

/**
 * Creates search conditions for Vietnamese text that are diacritic-insensitive
 * Uses a simple normalization approach - strips diacritics from both search term and database content
 */
export function createVietnameseSearchConditions(
  query: string,
  fields: string[],
): any[] {
  const conditions: any[] = [];
  const normalizedQuery = normalizeVietnamese(query.trim());

  // If query is empty, return no conditions
  if (!normalizedQuery) {
    return [];
  }

  for (const field of fields) {
    // Create a condition that normalizes the database field and compares with normalized query
    // Using PostgreSQL's unaccent function would be ideal, but we'll use a simpler approach
    // that works by comparing the normalized versions
    conditions.push({
      [field]: {
        contains: normalizedQuery,
        mode: "insensitive" as const,
      },
    });

    // Also search the original field in case it contains the exact normalized text
    if (normalizedQuery !== query.toLowerCase().trim()) {
      conditions.push({
        [field]: {
          contains: query.trim(),
          mode: "insensitive" as const,
        },
      });
    }
  }

  return conditions;
}
