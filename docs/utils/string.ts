// special cases that can't be handled just by tacking on an `s`
const PLURAL_WORDS: Record<string, string> = {};

/**
 * Pluralizes a word, depending on whether a number is 1.  (e.g., "1 credit",
 * "2 credits")
 *
 * @param word
 * @param num
 */
export const pluralize = (word: string, num: number) => {
  if (num === 1 || num === -1) {
    return word;
  }
  return PLURAL_WORDS[word] || `${word}s`;
};
