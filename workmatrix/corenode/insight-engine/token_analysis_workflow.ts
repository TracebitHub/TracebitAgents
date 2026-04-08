;(async () => {
  // ---- Config ----
  const SOLANA_RPC = process.env.SOLANA_RPC || "https://solana.rpc"
  const DEX_API = process.env.DEX_API || "https://dex.api"
  const MINT = process.env.TOKEN_MINT || "MintPubkeyHere"
  const MARKET = process.env.MARKET_PUBKEY || "MarketPubkeyHere"

  // ---- Helpers ----
  const timed = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const t0 = Date.now()
    try {
      const res = await fn()
      const dt = Date.now() - t0
      console.log(`[step:${label}] ${dt}ms`)
      return res
    } catch (e) {
      const dt = Date.now() - t0
      console.error(`[step:${label}] failed in ${dt}ms:`, (e as Error).message)
      throw e
    }
  }

  const nonNegativeNumbers = (arr: unknown[]): number[] =>
    arr
      .map(v => Number(v))
      .filter(v => Number.isFinite(v) && v >= 0)

  const stringify = (obj: unknown) => JSON.stringify(obj, null, 2)

  // ---- 1) Analyze activity ----
  const activityAnalyzer = new TokenActivityAnalyzer(SOLANA_RPC)
  const records = await timed("activity", async () => {
    const r = await activityAnalyzer.analyzeActivity(MINT, 20)
    if (!Array.isArray(r)) throw new Error("analyzeActivity returned non-array")
    if (r.length === 0) console.warn("[warn] no activity records")
    return r
  })

  // ---- 2) Analyze depth ----
  const depthAnalyzer = new TokenDepthAnalyzer(DEX_API, MARKET)
  const depthMetrics = await timed("depth", async () => {
    const d = await depthAnalyzer.analyze(30)
    if (!d) throw new Error("depthAnalyzer returned empty result")
    return d
  })

  // ---- 3) Detect patterns ----
  const volumes = nonNegativeNumbers(records.map(r => (r as any).amount))
  const patterns = await timed("patterns", async () => detectVolumePatterns(volumes, 5, 100))

  // ---- 4) Execute a custom task ----
  const engine = new ExecutionEngine()
  engine.register("report", async (params: { records: unknown[] }) => ({
    records: Array.isArray(params.records) ? params.records.length : 0,
    patterns: patterns.length,
    timestamp: Date.now(),
  }))
  engine.enqueue("task1", "report", { records })
  const taskResults = await timed("tasks", async () => engine.runAll())

  // ---- 5) Sign the results ----
  const signer = await SigningEngine.create?.() // support async factory if available
  const signingEngine: SigningEngine =
    (signer as SigningEngine) || (new (SigningEngine as any)() as SigningEngine)

  const payloadObj = { depthMetrics, patterns, taskResults }
  const payload = stringify(payloadObj)

  const signature = await timed("sign", async () => signingEngine.sign(payload))
  const signatureValid = await timed("verify", async () => signingEngine.verify(payload, signature))

  // ---- Summary ----
  const summary = {
    activityRecords: records.length,
    patternsCount: patterns.length,
    taskResultsCount: taskResults.length,
    signatureValid,
  }

  console.log("[summary]", stringify(summary))
  console.log("[payload]", payload)
})().catch(err => {
  console.error("[pipeline:error]", (err as Error)?.message || err)
  process.exitCode = 1
})
