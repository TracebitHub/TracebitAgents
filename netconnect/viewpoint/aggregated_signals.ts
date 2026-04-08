import type { SightCoreMessage } from "./WebSocketClient"

export interface AggregatedSignal {
  topic: string
  count: number
  lastPayload: any
  lastTimestamp: number
  firstTimestamp?: number
}

export class SignalAggregator {
  private counts: Record<string, AggregatedSignal> = {}

  processMessage(msg: SightCoreMessage): AggregatedSignal {
    const { topic, payload, timestamp } = msg
    const existing = this.counts[topic]

    const entry: AggregatedSignal = existing
      ? {
          ...existing,
          count: existing.count + 1,
          lastPayload: payload,
          lastTimestamp: timestamp,
        }
      : {
          topic,
          count: 1,
          lastPayload: payload,
          lastTimestamp: timestamp,
          firstTimestamp: timestamp,
        }

    this.counts[topic] = entry
    return entry
  }

  getAggregated(topic: string): AggregatedSignal | undefined {
    return this.counts[topic]
  }

  getAllAggregated(): AggregatedSignal[] {
    return Object.values(this.counts)
  }

  /**
   * Returns aggregated topics sorted by activity (highest count first).
   */
  getSortedByCount(): AggregatedSignal[] {
    return this.getAllAggregated().sort((a, b) => b.count - a.count)
  }

  /**
   * Returns total count across all topics.
   */
  getTotalCount(): number {
    return Object.values(this.counts).reduce((sum, e) => sum + e.count, 0)
  }

  /**
   * Remove a specific topic from aggregation.
   */
  removeTopic(topic: string): void {
    delete this.counts[topic]
  }

  reset(): void {
    this.counts = {}
  }
}
