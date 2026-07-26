import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY // Must be 32 bytes hex
const IV_LENGTH = 16

export function encrypt(text: string | null | undefined): string | null {
  if (!text) return null
  if (!ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY is missing. Keys will be stored in plaintext. This is insecure.')
    return text
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  } catch (error) {
    console.error('Encryption failed:', error)
    return null
  }
}

export function decrypt(text: string | null | undefined): string | null {
  if (!text) return null
  if (!text.includes(':')) {
    // If it doesn't contain our IV separator, it's either an old plaintext key or invalid
    return text
  }
  if (!ENCRYPTION_KEY) {
    console.warn('ENCRYPTION_KEY is missing. Cannot decrypt keys.')
    return null
  }

  try {
    const [ivHex, encryptedHex] = text.split(':')
    if (!ivHex || !encryptedHex) return null
    const iv = Buffer.from(ivHex, 'hex')
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final()
    ])
    return decrypted.toString()
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}
