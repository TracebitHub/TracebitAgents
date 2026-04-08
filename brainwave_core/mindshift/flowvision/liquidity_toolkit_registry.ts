import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Extended liquidity toolkit:
 * - fetch raw pool data
 * - analyze pool health and risk
 * - provides utilities to iterate, reset, and check registry
 */
export class LiquidityToolkitRegistry {
  private readonly tools: Record<string, Toolkit>

  constructor() {
    this.tools = {
      [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: toolkitBuilder(new FetchPoolDataAction()),
      [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: toolkitBuilder(new AnalyzePoolHealthAction()),
    }
  }

  getTool(id: string): Toolkit | undefined {
    return this.tools[id]
  }

  listTools(): string[] {
    return Object.keys(this.tools)
  }

  hasTool(id: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.tools, id)
  }

  reset(): void {
    Object.keys(this.tools).forEach(key => {
      delete this.tools[key]
    })
  }

  entries(): Array<[string, Toolkit]> {
    return Object.entries(this.tools)
  }
}

export const EXTENDED_LIQUIDITY_TOOLS: LiquidityToolkitRegistry = new LiquidityToolkitRegistry()
