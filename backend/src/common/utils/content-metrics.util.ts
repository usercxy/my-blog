export function calculateContentMetrics(markdownContent: string) {
  const plainText = markdownContent
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/[#>*_[\]\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = plainText.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));

  return {
    wordCount,
    readingTime,
  };
}
