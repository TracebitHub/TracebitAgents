export interface LaunchConfig {
  contractName: string
  parameters: Record<string, any>
  deployEndpoint: string
  apiKey?: string
  network?: string
}

export interface LaunchResult {
  success: boolean
  address?: string
  transactionHash?: string
  network?: string
  error?: string
  deployedAt?: number
}

export class LaunchNode {
  constructor(private config: LaunchConfig) {}

  /**
   * Deploy a contract using the configured endpoint.
   */
  async deploy(): Promise<LaunchResult> {
    const { deployEndpoint, apiKey, contractName, parameters, network } = this.config
    try {
      const res = await fetch(deployEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ contractName, parameters, network }),
      })
      if (!res.ok) {
        const text = await res.text()
        return { success: false, error: `HTTP ${res.status}: ${text}`, network }
      }
      const json = await res.json()
      return {
        success: true,
        address: json.contractAddress,
        transactionHash: json.txHash,
        network,
        deployedAt: Date.now(),
      }
    } catch (err: any) {
      return { success: false, error: err.message, network }
    }
  }

  /**
   * Validate configuration before deploy.
   */
  validateConfig(): string[] {
    const errors: string[] = []
    if (!this.config.contractName) errors.push("Missing contractName")
    if (!this.config.deployEndpoint) errors.push("Missing deployEndpoint")
    if (!this.config.parameters || Object.keys(this.config.parameters).length === 0) {
      errors.push("Parameters must not be empty")
    }
    return errors
  }
}
