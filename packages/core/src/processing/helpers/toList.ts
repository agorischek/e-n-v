/**
 * Convert array of items to natural language list.
 * Examples:
 * - [] => ""
 * - ["one"] => "one"
 * - ["one", "two"] => "one and two"
 * - ["one", "two", "three"] => "one, two, and three"
 */
export function toList(items: string[]): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0]!;
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }
  // 3+ items: use commas and "and" before the last item
  const allButLast = items.slice(0, -1).join(", ");
  return `${allButLast}, and ${items[items.length - 1]}`;
}
