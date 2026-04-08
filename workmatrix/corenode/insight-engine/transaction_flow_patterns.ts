/**
 * Volume Pattern Detector
 * Enhanced module to identify and analyze recurring patterns in volume series.
 */

export interface PatternMatch {
  index: number
  window: number
  average: number
  maxValue?: number
  minValue?: number
  volatility?: number
}

export function detectVolumePatterns(
  volumes: number[],
  windowSize: number,
  threshold: number
): PatternMatch[] {
  const matches: PatternMatch[] = []

  for (let i = 0; i + windowSize <= volumes.length; i++) {
    const slice = volumes.slice(i, i + windowSize)
    const avg = slice.reduce((a, b) => a + b, 0) / windowSize
    const maxValue = Math.max(...slice)
    const minValue = Math.min(...slice)
    const volatility =
      slice.length > 1
        ? slice.reduce((acc, v) => acc + Math.abs(v - avg), 0) / slice.length
        : 0

    if (avg >= threshold) {
      matches.push({
        index: i,
        window: windowSize,
        average: avg,
        maxValue,
        minValue,
        volatility,
      })
    }
  }

  return matches
}

export function summarizePatternMatches(matches: PatternMatch[]) {
  const total = matches.length
  const avgOfAverages =
    total > 0
      ? matches.reduce((sum, m) => sum + m.average, 0) / total
      : 0
  const highestAvg = total > 0 ? Math.max(...matches.map(m => m.average)) : 0
  return {
    total,
    avgOfAverages,
    highestAvg,
  }
}
