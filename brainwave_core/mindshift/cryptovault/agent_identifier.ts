/**
 * Unique identifier for the Solana Knowledge Agent.
 * Used across the system for routing and action resolution.
 */
export const SOLANA_KNOWLEDGE_AGENT_ID = "solana-knowledge-agent" as const

/**
 * Type definition derived from the constant.
 * Guarantees that only the valid agent id is used in calls.
 */
export type SolanaKnowledgeAgentId = typeof SOLANA_KNOWLEDGE_AGENT_ID

/**
 * Utility: quick guard to check if a given string matches the agent id.
 */
export function isSolanaKnowledgeAgent(id: string): id is SolanaKnowledgeAgentId {
  return id === SOLANA_KNOWLEDGE_AGENT_ID
}
