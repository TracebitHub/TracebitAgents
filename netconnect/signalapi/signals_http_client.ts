export interface Signal {
  id: string
  type: string
  timestamp: number
  payload: Record<string, any>
  source?: string
  severity?: "low" | "medium" | "high"
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  receivedAt?: number
}

/**
 * HTTP client for fetching and managing signals.
 */
export class SignalApiClient {
  constructor(private baseUrl: string, private apiKey?: string) {}

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`
    return headers
  }

  async fetchAllSignals(): Promise<ApiResponse<Signal[]>> {
    try {
      const res = await fetch(`${this.baseUrl}/signals`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}`, receivedAt: Date.now() }
      }
      const data = (await res.json()) as Signal[]
      return { success: true, data, receivedAt: Date.now() }
    } catch (err: any) {
      return { success: false, error: err.message, receivedAt: Date.now() }
    }
  }

  async fetchSignalById(id: string): Promise<ApiResponse<Signal>> {
    try {
      const res = await fetch(`${this.baseUrl}/signals/${encodeURIComponent(id)}`, {
        method: "GET",
        headers: this.getHeaders(),
      })
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}`, receivedAt: Date.now() }
      }
      const data = (await res.json()) as Signal
      return { success: true, data, receivedAt: Date.now() }
    } catch (err: any) {
      return { success: false, error: err.message, receivedAt: Date.now() }
    }
  }

  /**
   * Delete a signal by id.
   */
  async deleteSignalById(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await fetch(`${this.baseUrl}/signals/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}`, receivedAt: Date.now() }
      }
      return { success: true, data: null, receivedAt: Date.now() }
    } catch (err: any) {
      return { success: false, error: err.message, receivedAt: Date.now() }
    }
  }

  /**
   * Post a new signal to the API.
   */
  async createSignal(signal: Signal): Promise<ApiResponse<Signal>> {
    try {
      const res = await fetch(`${this.baseUrl}/signals`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(signal),
      })
      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}`, receivedAt: Date.now() }
      }
      const data = (await res.json()) as Signal
      return { success: true, data, receivedAt: Date.now() }
    } catch (err: any) {
      return { success: false, error: err.message, receivedAt: Date.now() }
    }
  }
}
