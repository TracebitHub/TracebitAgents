/**
 * Task execution engine: registers and runs tasks by type.
 */
type Handler = (params: any) => Promise<any>

export interface Task {
  id: string
  type: string
  params: any
}

export interface TaskResult {
  id: string
  result?: any
  error?: string
  startedAt: number
  finishedAt: number
  durationMs: number
}

export class ExecutionEngine {
  private handlers: Record<string, Handler> = {}
  private queue: Task[] = []

  /**
   * Register a handler for a given task type.
   */
  register(type: string, handler: Handler): void {
    this.handlers[type] = handler
  }

  /**
   * Add a new task to the execution queue.
   */
  enqueue(id: string, type: string, params: any): void {
    if (!this.handlers[type]) throw new Error(`No handler for ${type}`)
    this.queue.push({ id, type, params })
  }

  /**
   * Run all queued tasks sequentially.
   */
  async runAll(): Promise<TaskResult[]> {
    const results: TaskResult[] = []
    while (this.queue.length) {
      const task = this.queue.shift()!
      const start = Date.now()
      try {
        const data = await this.handlers[task.type](task.params)
        const end = Date.now()
        results.push({
          id: task.id,
          result: data,
          startedAt: start,
          finishedAt: end,
          durationMs: end - start,
        })
      } catch (err: any) {
        const end = Date.now()
        results.push({
          id: task.id,
          error: err.message,
          startedAt: start,
          finishedAt: end,
          durationMs: end - start,
        })
      }
    }
    return results
  }

  /**
   * Run a single task immediately without affecting the queue.
   */
  async runTask(type: string, params: any): Promise<any> {
    if (!this.handlers[type]) throw new Error(`No handler for ${type}`)
    return this.handlers[type](params)
  }

  /**
   * Clear all queued tasks without executing them.
   */
  clearQueue(): void {
    this.queue = []
  }
}
