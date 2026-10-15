import { EMPTY_PROGRESS, normalizeProgress } from './progress'
import type { LocalProgress } from './types'

const PROFILE_KEY = 'dev-jargon-jungle.profiles.v1'
const KDF_ROUNDS = 310_000
const encoder = new TextEncoder()
const decoder = new TextDecoder()

export interface ProfileSummary { id: string; name: string; salt: string; iv: string; payload: string }
export interface ProfileData { progress: LocalProgress; fontSize: number }
export interface UnlockedProfile { summary: ProfileSummary; key: CryptoKey; data: ProfileData }

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach(byte => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}
function base64ToBytes(value: string): Uint8Array {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0))
}
function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length))
}
function readIndex(): ProfileSummary[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(PROFILE_KEY) ?? '[]') as ProfileSummary[]
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && typeof item.payload === 'string') : []
  } catch { return [] }
}
function writeIndex(profiles: ProfileSummary[]): void { localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)) }

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: KDF_ROUNDS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

async function encrypt(data: ProfileData, id: string, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: encoder.encode(id) }, key, encoder.encode(JSON.stringify(data)))
  return bytesToBase64(new Uint8Array(ciphertext))
}

export function listProfiles(): ProfileSummary[] { return readIndex().map(({ id, name, salt, iv, payload }) => ({ id, name, salt, iv, payload })) }

export async function createProfile(name: string, password: string, data: ProfileData): Promise<UnlockedProfile> {
  const id = crypto.randomUUID()
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = await deriveKey(password, salt)
  const summary: ProfileSummary = { id, name: name.trim(), salt: bytesToBase64(salt), iv: bytesToBase64(iv), payload: await encrypt(data, id, key, iv) }
  writeIndex([...readIndex(), summary])
  return { summary, key, data }
}

export async function unlockProfile(id: string, password: string): Promise<UnlockedProfile> {
  const summary = readIndex().find(profile => profile.id === id)
  if (!summary) throw new Error('Profile not found on this device.')
  try {
    const key = await deriveKey(password, base64ToBytes(summary.salt))
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(summary.iv), additionalData: encoder.encode(id) }, key, base64ToBytes(summary.payload))
    const data = JSON.parse(decoder.decode(plaintext)) as Partial<ProfileData>
    return { summary, key, data: { progress: normalizeProgress(data.progress), fontSize: clampFontSize(data.fontSize) } }
  } catch { throw new Error('That password did not unlock this profile.') }
}

export async function saveProfile(profile: ProfileSummary, key: CryptoKey, data: ProfileData): Promise<void> {
  const profiles = readIndex()
  const iv = randomBytes(12)
  const updated = { ...profile, iv: bytesToBase64(iv), payload: await encrypt(data, profile.id, key, iv) }
  const index = profiles.findIndex(item => item.id === profile.id)
  if (index < 0) throw new Error('This profile is no longer available on this device.')
  profiles[index] = updated
  writeIndex(profiles)
}

export function clampFontSize(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(250, Math.max(50, Math.round(value / 25) * 25)) : 125
}

export const NEW_PROFILE_DATA: ProfileData = { progress: structuredClone(EMPTY_PROGRESS), fontSize: 125 }
