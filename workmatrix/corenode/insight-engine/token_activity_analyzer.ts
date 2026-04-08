/**
 * Token Activity Analyzer
 * Enhanced tool to fetch, process, and summarize on-chain token transfers with additional insights.
 */

export interface ActivityRecord {
  timestamp: number
  signature: string
  source: string
  destination: string
  amount: number
  slot?: number
  err?: any
}

export interface TransferSummary {
  totalTransfers: number
  totalVolume: number
  uniqueSources: Set<string>
  uniqueDestinations: Set<string>
}

export class TokenActivityAnalyzer {
  constructor(private rpcEndpoint: string) {}

  async fetchRecentSignatures(mint: string, limit = 100): Promise<string[]> {
    const url = `${this.rpcEndpoint}/getSignaturesForAddress/${mint}?limit=${limit}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch signatures: ${res.status}`)
    const json = await res.json()
    return json.map((e: any) => e.signature)
  }

  async fetchTransaction(signature: string): Promise<any | null> {
    const txRes = await fetch(`${this.rpcEndpoint}/getTransaction/${signature}`)
    if (!txRes.ok) return null
    return await txRes.json()
  }

  async analyzeActivity(mint: string, limit = 50): Promise<ActivityRecord[]> {
    const sigs = await this.fetchRecentSignatures(mint, limit)
    const out: ActivityRecord[] = []
    for (const sig of sigs) {
      const tx = await this.fetchTransaction(sig)
      if (!tx || !tx.meta) continue

      const pre = tx.meta.preTokenBalances || []
      const post = tx.meta.postTokenBalances || []

      for (let i = 0; i < post.length; i++) {
        const p = post[i]
        const q = pre[i] || { uiTokenAmount: { uiAmount: 0 }, owner: null }
        const delta =
          (p.uiTokenAmount.uiAmount || 0) -
          (q.uiTokenAmount.uiAmount || 0)

        if (delta !== 0) {
          out.push({
            timestamp: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
            signature: sig,
            source: q.owner || "unknown",
            destination: p.owner || "unknown",
            amount: Math.abs(delta),
            slot: tx.slot,
            err: tx.meta.err || null,
          })
        }
      }
    }
    return out
  }

  summarizeTransfers(records: ActivityRecord[]): TransferSummary {
    const summary: TransferSummary = {
      totalTransfers: records.length,
      totalVolume: records.reduce((acc, r) => acc + r.amount, 0),
      uniqueSources: new Set(records.map(r => r.source)),
      uniqueDestinations: new Set(records.map(r => r.destination)),
    }
    return summary
  }

  async analyzeAndSummarize(mint: string, limit = 50) {
    const records = await this.analyzeActivity(mint, limit)
    return {
      transfers: records,
      summary: this.summarizeTransfers(records),
    }
  }
}
