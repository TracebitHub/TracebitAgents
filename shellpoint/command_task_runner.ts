import { execCommand, execWithOutput } from "./execCommand"

export interface ShellTask {
  id: string
  command: string
  description?: string
  cwd?: string
  env?: NodeJS.ProcessEnv
}

export interface ShellResult {
  taskId: string
  output?: string
  stderr?: string
  error?: string
  executedAt: number
  durationMs: number
}

export class ShellTaskRunner {
  private tasks: ShellTask[] = []

  /**
   * Schedule a shell task for execution.
   */
  scheduleTask(task: ShellTask): void {
    this.tasks.push(task)
  }

  /**
   * Execute all scheduled tasks in sequence.
   */
  async runAll(): Promise<ShellResult[]> {
    const results: ShellResult[] = []
    for (const task of this.tasks) {
      const start = Date.now()
      try {
        const { stdout, stderr } = await execWithOutput(
          task.command,
          30_000,
          task.cwd,
          task.env
        )
        results.push({
          taskId: task.id,
          output: stdout,
          stderr,
          executedAt: start,
          durationMs: Date.now() - start,
        })
      } catch (err: any) {
        results.push({
          taskId: task.id,
          error: err.message,
          executedAt: start,
          durationMs: Date.now() - start,
        })
      }
    }
    this.tasks = []
    return results
  }

  /**
   * Run a single task immediately.
   */
  async runTask(task: ShellTask): Promise<ShellResult> {
    const start = Date.now()
    try {
      const output = await execCommand(task.command, 30_000, task.cwd, task.env)
      return {
        taskId: task.id,
        output,
        executedAt: start,
        durationMs: Date.now() - start,
      }
    } catch (err: any) {
      return {
        taskId: task.id,
        error: err.message,
        executedAt: start,
        durationMs: Date.now() - start,
      }
    }
  }

  /**
   * Remove all scheduled tasks without running them.
   */
  clear(): void {
    this.tasks = []
  }
}
