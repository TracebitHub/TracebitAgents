import type { TaskFormInput } from "./taskFormSchemas"
import { TaskFormSchema } from "./taskFormSchemas"

/**
 * Processes a Typeform webhook payload to schedule a new task.
 */
export async function handleTypeformSubmission(
  raw: unknown
): Promise<{ success: boolean; message: string; taskId?: string }> {
  const parsed = TaskFormSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      message: `Validation error: ${parsed.error.issues
        .map(i => i.message)
        .join("; ")}`,
    }
  }

  const { taskName, taskType, parameters, scheduleCron } = parsed.data as TaskFormInput

  const taskId = `${taskType}-${Date.now()}`
  const summary = [
    `Task Name: ${taskName}`,
    `Task Type: ${taskType}`,
    `Parameters: ${JSON.stringify(parameters)}`,
    `Schedule: ${scheduleCron || "none"}`,
  ].join(" | ")

  // simulate persistence or scheduling logic
  console.log("Scheduling Task:", summary)

  return {
    success: true,
    message: `Task "${taskName}" scheduled successfully`,
    taskId,
  }
}

/**
 * Utility to validate and normalize raw task data before scheduling.
 */
export function preprocessTaskData(raw: unknown): TaskFormInput | null {
  const parsed = TaskFormSchema.safeParse(raw)
  if (!parsed.success) return null
  return {
    ...parsed.data,
    taskName: parsed.data.taskName.trim(),
    scheduleCron: parsed.data.scheduleCron || "",
  }
}
