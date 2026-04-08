export interface SightCoreConfig {
  url: string
  protocols?: string[]
  reconnectIntervalMs?: number
  maxReconnectAttempts?: number
}

export type SightCoreMessage = {
  topic: string
  payload: any
  timestamp: number
}

export class SightCoreWebSocket {
  private socket?: WebSocket
  private url: string
  private protocols?: string[]
  private reconnectInterval: number
  private reconnectAttempts = 0
  private maxReconnectAttempts?: number

  constructor(config: SightCoreConfig) {
    this.url = config.url
    this.protocols = config.protocols
    this.reconnectInterval = config.reconnectIntervalMs ?? 5000
    this.maxReconnectAttempts = config.maxReconnectAttempts
  }

  connect(
    onMessage: (msg: SightCoreMessage) => void,
    onOpen?: () => void,
    onClose?: () => void,
    onError?: (err: Event) => void
  ): void {
    this.socket = this.protocols
      ? new WebSocket(this.url, this.protocols)
      : new WebSocket(this.url)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      onOpen?.()
    }

    this.socket.onmessage = event => {
      try {
        const msg = JSON.parse(event.data) as SightCoreMessage
        onMessage(msg)
      } catch {
        // ignore invalid messages
      }
    }

    this.socket.onclose = () => {
      onClose?.()
      if (
        this.maxReconnectAttempts === undefined ||
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.reconnectAttempts++
        setTimeout(
          () => this.connect(onMessage, onOpen, onClose, onError),
          this.reconnectInterval
        )
      }
    }

    this.socket.onerror = err => {
      onError?.(err)
      this.socket?.close()
    }
  }

  send(topic: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify({ topic, payload, timestamp: Date.now() })
      this.socket.send(msg)
    } else {
      console.warn("Attempted to send on closed WebSocket:", topic, payload)
    }
  }

  disconnect(): void {
    this.socket?.close()
    this.socket = undefined
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN
  }
}
