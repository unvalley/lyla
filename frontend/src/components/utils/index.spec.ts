import { getHighlighPositionNumbers } from '.'

describe('getHighlightPositionNumbers', () => {
  it('should calculate correctly', () => {
    const expectedHighlightPositionNumbers = {
      start: 60,
      end: 100
    }
    const sentenceCharacterCounts = [10, 20, 30, 40, 50]
    const highlightIndex = 3

    const highlightPositionNumbers = getHighlighPositionNumbers(
      sentenceCharacterCounts,
      highlightIndex
    )

    expect(highlightPositionNumbers).toStrictEqual(
      expectedHighlightPositionNumbers
    )
  })

  it('should calculate correctly when highlightIndex equals 0', () => {
    const expectedHighlightPositionNumbers = {
      start: 0,
      end: 10
    }
    const sentenceCharacterCounts = [10, 20, 30, 40, 50]
    const highlightIndex = 0

    const highlightPositionNumbers = getHighlighPositionNumbers(
      sentenceCharacterCounts,
      highlightIndex
    )

    expect(highlightPositionNumbers).toStrictEqual(
      expectedHighlightPositionNumbers
    )
  })
})
