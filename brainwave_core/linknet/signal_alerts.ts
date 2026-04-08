import nodemailer from "nodemailer"

export interface AlertConfig {
  email?: {
    host: string
    port: number
    user: string
    pass: string
    from: string
    to: string[]
  }
  console?: boolean
}

export interface AlertSignal {
  title: string
  message: string
  level: "info" | "warning" | "critical"
}

export class AlertService {
  constructor(private cfg: AlertConfig) {}

  private async sendEmail(signal: AlertSignal) {
    if (!this.cfg.email) return
    const { host, port, user, pass, from, to } = this.cfg.email
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    })
    await transporter.sendMail({
      from,
      to,
      subject: `[${signal.level.toUpperCase()}] ${signal.title}`,
      text: signal.message
    })
  }

  private logConsole(signal: AlertSignal) {
    if (!this.cfg.console) return
    const tag =
      signal.level === "critical"
        ? "[CRITICAL]"
        : signal.level === "warning"
        ? "[WARNING]"
        : "[INFO]"
    console.log(`${tag} ${signal.title}\n${signal.message}`)
  }

  async dispatch(signals: AlertSignal[]) {
    for (const sig of signals) {
      try {
        await this.sendEmail(sig)
      } catch (err) {
        console.error("Failed to send email alert:", (err as Error).message)
      }
      this.logConsole(sig)
    }
  }
}
