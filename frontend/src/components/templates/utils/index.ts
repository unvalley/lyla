export const sumBetween = (l: any[], start: number, end: number) =>
  l.slice(start, end).reduce((acc, curr, _) => (acc = acc + curr), 0)

/**
 * ハイライト対象の文章のindexを受け取って，ハイライトの開始文字数と終了文字数を返す
 */
export const getHighlighPositionNumbers = (
  sentenceCharacterCounts: number[],
  highlighIndex: number
) => {
  if (highlighIndex === 0) {
    return {
      start: 0,
      end: sentenceCharacterCounts[0]
    }
  }

  const highlightStart = sumBetween(sentenceCharacterCounts, 0, highlighIndex)
  const highlightEnd = highlightStart + sentenceCharacterCounts[highlighIndex]
  return { start: highlightStart, end: highlightEnd }
}
