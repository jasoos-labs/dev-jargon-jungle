import { useState, type FormEvent } from 'react'
import type { ProfileSummary } from '../domain/profiles'

interface Props {
  profiles: ProfileSummary[]
  legacyTerms: number
  onUnlock: (id: string, password: string) => Promise<void>
  onCreate: (name: string, password: string) => Promise<void>
}

export function ProfileGate({ profiles, legacyTerms, onUnlock, onCreate }: Props) {
  const [selected, setSelected] = useState<string | null>(profiles[0]?.id ?? null)
  const [creating, setCreating] = useState(profiles.length === 0)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (creating) {
        if (password !== confirm) throw new Error('The passwords do not match.')
        if (!name.trim()) throw new Error('Enter a profile name.')
        await onCreate(name, password)
      } else if (selected) await onUnlock(selected, password)
      else throw new Error('Choose a profile or create a new one.')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not open that profile.') }
    finally { setBusy(false) }
  }

  return <div className="profile-gate-wrap"><section className="profile-gate" aria-labelledby="profile-title">
    <span className="eyebrow">PRIVATE · ON THIS DEVICE</span><h1 id="profile-title">Your trail, <em>your profile.</em></h1>
    <p>Each profile keeps its own progress in password-protected, encrypted browser storage. There are no accounts or cloud sync.</p>
    {!creating && profiles.length > 0 && <div className="profile-list" role="group" aria-label="Choose a local profile">{profiles.map(profile => <button type="button" key={profile.id} className={selected === profile.id ? 'profile-choice active' : 'profile-choice'} onClick={() => setSelected(profile.id)}><span>♙</span><b>{profile.name}</b><small>Encrypted on this device</small></button>)}</div>}
    <form onSubmit={submit}>
      {creating && <label>Profile name<input autoComplete="nickname" value={name} onChange={event => setName(event.target.value)} maxLength={32} placeholder="e.g., Pradeep" /></label>}
      <label>Password (any length)<input type="password" autoComplete={creating ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} /></label>
      {creating && <label>Confirm password (must match)<input type="password" autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /></label>}
      {creating && legacyTerms > 0 && <p className="profile-migration">Your earlier local trail has {legacyTerms} learned terms. It will be moved into this encrypted profile.</p>}
      {error && <p className="profile-error" role="alert">{error}</p>}
      <button className="button-primary profile-submit" disabled={busy}>{busy ? 'Opening…' : creating ? 'Create encrypted profile' : 'Unlock profile'} <span>→</span></button>
    </form>
    {profiles.length > 0 && <button className="profile-mode" type="button" onClick={() => { setCreating(value => !value); setError(''); setPassword(''); setConfirm('') }}>{creating ? 'Back to existing profiles' : 'Create another profile'}</button>}
    <small className="profile-warning">Keep the password safe. It cannot be reset, and this device cannot recover encrypted progress without it.</small>
  </section></div>
}
