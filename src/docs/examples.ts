export const EXAMPLE_SOURCES = import.meta.glob<string>("./examples/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});
export function exampleSource(id: string): string {
  const source = EXAMPLE_SOURCES[`./examples/${id}.tsx`];
  if (!source) throw new Error(`Missing documentation example: ${id}`);
  return source;
}
