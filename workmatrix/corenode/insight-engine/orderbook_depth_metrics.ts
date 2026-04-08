/**
 * Token Depth Analyzer
 * Extended tool to evaluate orderbook depth, liquidity, and price dynamics for a given market.
 */

export interface Order {
  price: number
  size: number
}

export interface DepthMetrics {
  averageBidDepth: number
  averageAskDepth: number
  spread: number
  totalBidVolume?: number
  totalAskVolume?: number
  midPrice?: number
  imbalanceRatio?: number
}

export class TokenDepthAnalyzer {
  constructor(private rpcEndpoint: string, private marketId: string) {}

  async fetchOrderbook(depth = 50): Promise<{ bids: Order[]; asks: Order[] }> {
    const url = `${this.rpcEndpoint}/orderbook/${this.marketId}?depth=${depth}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Orderbook fetch failed: ${res.status}`)
    return await res.json()
  }

  private computeAverage(orders: Order[]): number {
    if (orders.length === 0) return 0
    return orders.reduce((sum, o) => sum + o.size, 0) / orders.length
  }

  private computeVolume(orders: Order[]): number {
    return orders.reduce((sum, o) => sum + o.size, 0)
  }

  private computeImbalance(bids: Order[], asks: Order[]): number {
    const bidVol = this.computeVolume(bids)
    const askVol = this.computeVolume(asks)
    const denom = bidVol + askVol
    return denom === 0 ? 0 : (bidVol - askVol) / denom
  }

  async analyze(depth = 50): Promise<DepthMetrics> {
    const { bids, asks } = await this.fetchOrderbook(depth)

    const averageBidDepth = this.computeAverage(bids)
    const averageAskDepth = this.computeAverage(asks)
    const bestBid = bids[0]?.price ?? 0
    const bestAsk = asks[0]?.price ?? 0
    const spread = bestAsk - bestBid

    const totalBidVolume = this.computeVolume(bids)
    const totalAskVolume = this.computeVolume(asks)
    const midPrice = bestBid && bestAsk ? (bestBid + bestAsk) / 2 : 0
    const imbalanceRatio = this.computeImbalance(bids, asks)

    return {
      averageBidDepth,
      averageAskDepth,
      spread,
      totalBidVolume,
      totalAskVolume,
      midPrice,
      imbalanceRatio,
    }
  }

  async fetchAndLog(depth = 50): Promise<void> {
    const metrics = await this.analyze(depth)
    console.log("Depth Metrics:", metrics)
  }
}
