import type { BaseAgentAction, AgentActionResponse } from "./baseAgentAction"
import { z } from "zod"

interface AgentContext {
  apiEndpoint: string
  apiKey: string
}

/**
 * Central Agent: routes calls to registered actions.
 */
export class Agent {
  private actions = new Map<string, BaseAgentAction<any, any, AgentContext>>()

  register<S, R>(action: BaseAgentAction<S, R, AgentContext>): void {
    this.actions.set(action.id, action)
  }

  async invoke<R>(
    actionId: string,
    payload: unknown,
    ctx: AgentContext
  ): Promise<AgentActionResponse<R>> {
    const action = this.actions.get(actionId)
    if (!action) throw new Error(`Unknown action "${actionId}"`)
    // @ts-ignore
    return action.execute({ payload, context: ctx }) as Promise<AgentActionResponse<R>>
  }

  listActions(): string[] {
    return Array.from(this.actions.keys())
  }

  hasAction(id: string): boolean {
    return this.actions.has(id)
  }
}
