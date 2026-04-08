import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Toolkit exposing liquidity-related actions:
 * – fetch raw pool data
 * – run health / risk analysis on a liquidity pool
 *
 * Each action is wrapped with `toolkitBuilder` for uniform
 * registration and execution in the agent system.
 */
export const LIQUIDITY_ANALYSIS_TOOLS: Record<string, Toolkit> = Object.freeze({
  /** Retrieve on-chain pool state and metrics */
  [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: toolkitBuilder(new FetchPoolDataAction()),

  /** Perform structural + risk analysis on pool data */
  [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: toolkitBuilder(new AnalyzePoolHealthAction()),
})

/**
 * Utility: quick list of supported liquidity tool keys.
 */
export const SUPPORTED_LIQUIDITY_TOOL_KEYS = Object.keys(LIQUIDITY_ANALYSIS_TOOLS)
