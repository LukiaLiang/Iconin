export interface SuggestionTrigger {
  start: number;
  end: number;
  query: string;
}

export function findSuggestionTrigger(
  lineBeforeCursor: string,
): SuggestionTrigger | null {
  const match = /(?:^|[\s([{>"'])::([a-zA-Z0-9-]*)$/.exec(lineBeforeCursor);
  if (!match) return null;

  const query = match[1];
  return {
    start: lineBeforeCursor.length - query.length - 2,
    end: lineBeforeCursor.length,
    query,
  };
}
