export function mapLabels<T extends string>(
  labels: T[],
  dictionary: Record<string, string>
): string[] {
  return labels.map((label) => dictionary[label] ?? label)
}
