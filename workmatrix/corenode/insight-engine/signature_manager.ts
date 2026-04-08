export class SigningEngine {
  private keyPair?: CryptoKeyPair

  private constructor(keyPair: CryptoKeyPair) {
    this.keyPair = keyPair
  }

  /**
   * Async factory to create a new engine with generated keys.
   */
  static async create(): Promise<SigningEngine> {
    const keyPair = (await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    )) as CryptoKeyPair
    return new SigningEngine(keyPair)
  }

  /**
   * Sign arbitrary data and return a base64 signature.
   */
  async sign(data: string): Promise<string> {
    if (!this.keyPair) throw new Error("Key pair not initialized")
    const enc = new TextEncoder().encode(data)
    const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", this.keyPair.privateKey, enc)
    return Buffer.from(sig).toString("base64")
  }

  /**
   * Verify data against a given base64 signature.
   */
  async verify(data: string, signature: string): Promise<boolean> {
    if (!this.keyPair) throw new Error("Key pair not initialized")
    const enc = new TextEncoder().encode(data)
    const sig = Buffer.from(signature, "base64")
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", this.keyPair.publicKey, sig, enc)
  }

  /**
   * Export the public key in JWK format.
   */
  async exportPublicKey(): Promise<JsonWebKey> {
    if (!this.keyPair) throw new Error("Key pair not initialized")
    return crypto.subtle.exportKey("jwk", this.keyPair.publicKey)
  }

  /**
   * Export the private key in PKCS8 format.
   */
  async exportPrivateKey(): Promise<ArrayBuffer> {
    if (!this.keyPair) throw new Error("Key pair not initialized")
    return crypto.subtle.exportKey("pkcs8", this.keyPair.privateKey)
  }
}
