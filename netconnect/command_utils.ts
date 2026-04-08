import { exec } from "child_process"

/**
 * Execute a shell command and return stdout or throw on error.
 * @param command Shell command to run (e.g., "ls -la")
 * @param timeoutMs Optional timeout in milliseconds
 * @param cwd Optional working directory
 */
export function execCommand(
  command: string,
  timeoutMs: number = 30_000,
  cwd?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { timeout: timeoutMs, cwd }, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new Error(`Command failed: ${stderr?.toString().trim() || error.message}`)
        )
      }
      resolve(stdout.trim())
    })

    proc.on("error", err => {
      reject(new Error(`Execution error: ${err.message}`))
    })
  })
}

/**
 * Execute a command and capture both stdout and stderr.
 */
export function execWithOutput(
  command: string,
  timeoutMs: number = 30_000,
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = exec(command, { timeout: timeoutMs, cwd }, (error, stdout, stderr) => {
      if (error) {
        return reject(
          new Error(`Command failed: ${stderr?.toString().trim() || error.message}`)
        )
      }
      resolve({ stdout: stdout.trim(), stderr: stderr.trim() })
    })

    proc.on("error", err => {
      reject(new Error(`Execution error: ${err.message}`))
    })
  })
}

/**
 * Try executing a command and never throw.
 */
export async function safeExecCommand(
  command: string,
  timeoutMs: number = 30_000,
  cwd?: string
): Promise<{ success: boolean; output?: string; error?: string }> {
  try {
    const output = await execCommand(command, timeoutMs, cwd)
    return { success: true, output }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
