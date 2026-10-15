import { useEffect, useMemo, useState } from 'react'
import { JungleNav, type Destination } from '../components/JungleNav'
import { ProfileGate } from '../components/ProfileGate'
import { JunglePark } from '../features/home/JunglePark'
import { FlashcardTrail } from '../features/study/FlashcardTrail'
import { GameHub, type GameMode } from '../features/games/GameHub'
import { GameSession } from '../features/games/GameSession'
import { BingoGame } from '../components/BingoGame'
import { TermGuide } from '../features/lookup/TermGuide'
import { ProgressPage } from '../features/progress/ProgressPage'
import { createEmptyProgress, learnerLevel, PROGRESS_KEY, readProgress } from '../domain/progress'
import { clampFontSize, createProfile, listProfiles, NEW_PROFILE_DATA, saveProfile, unlockProfile, type ProfileSummary } from '../domain/profiles'
import { termsForJourney } from '../domain/trail'
import type { LocalProgress, TrailDifficulty } from '../domain/types'

export default function App() {
  const [destination, setDestination] = useState<Destination>('park')
  const [game, setGame] = useState<GameMode | null>(null)
  const [profiles, setProfiles] = useState<ProfileSummary[]>(() => listProfiles())
  const [activeProfile, setActiveProfile] = useState<ProfileSummary | null>(null)
  const [profileKey, setProfileKey] = useState<CryptoKey | null>(null)
  const [progress, setProgress] = useState<LocalProgress>(() => createEmptyProgress())
  const [fontSize, setFontSize] = useState(100)
  const [saveError, setSaveError] = useState(false)
  const [legacyTerms] = useState(() => Object.values(readProgress().terms).filter(term => term.known).length)
  const [hasLegacyProgress] = useState(() => Boolean(localStorage.getItem(PROGRESS_KEY)))
  const level = learnerLevel(progress)
  const reachedTerms = useMemo(() => termsForJourney(progress, true), [progress.journey.difficulty, progress.journey.reachedStop])
  const locked = !activeProfile || !profileKey

  useEffect(() => { document.documentElement.style.setProperty('--app-zoom', String(fontSize / 100)) }, [fontSize])
  useEffect(() => {
    if (!activeProfile || !profileKey) return
    void saveProfile(activeProfile, profileKey, { progress, fontSize }).then(() => setSaveError(false)).catch(() => setSaveError(true))
  }, [activeProfile, profileKey, progress, fontSize])
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) void navigator.serviceWorker.register('./sw.js')
  }, [])

  const activate = (profile: ProfileSummary, key: CryptoKey, data: { progress: LocalProgress; fontSize: number }) => {
    setActiveProfile(profile); setProfileKey(key); setProgress(data.progress); setFontSize(clampFontSize(data.fontSize)); setSaveError(false)
  }
  const handleUnlock = async (id: string, password: string) => {
    const unlocked = await unlockProfile(id, password)
    activate(unlocked.summary, unlocked.key, unlocked.data)
  }
  const handleCreate = async (name: string, password: string) => {
    // Existing local progress is migrated into the first encrypted profile before its plaintext slot is removed.
    const legacy = readProgress()
    const data = profiles.length === 0 && hasLegacyProgress ? { progress: legacy, fontSize: 125 } : NEW_PROFILE_DATA
    const unlocked = await createProfile(name, password, data)
    if (profiles.length === 0 && hasLegacyProgress) localStorage.removeItem(PROGRESS_KEY)
    const nextProfiles = listProfiles()
    setProfiles(nextProfiles)
    activate(unlocked.summary, unlocked.key, unlocked.data)
  }

  const go = (next: Destination) => { setGame(null); setDestination(next) }
  const startGame = (mode: GameMode) => { setGame(mode); setDestination('games') }
  const changeDifficulty = (difficulty: TrailDifficulty) => setProgress(current => ({ ...current, journey: { ...current.journey, difficulty } }))
  const lockProfile = () => { setGame(null); setActiveProfile(null); setProfileKey(null); setDestination('park') }

  return <div className="jungle-app">
    <JungleNav current={destination} level={level} onNavigate={go} />
    <main className="jungle-main">
      <header className="jungle-topbar"><div className="mobile-title"><span className="brand-mark">J</span><b>Dev Jargon Jungle</b></div><span className="local-note"><i /> {saveError ? 'Save issue · check device storage' : 'Encrypted on this device'}</span><div className="font-size-control" aria-label="Font size"><button onClick={() => setFontSize(value => clampFontSize(value - 25))} aria-label="Decrease font size" disabled={fontSize <= 50}>A−</button><span>{fontSize}%</span><button onClick={() => setFontSize(value => clampFontSize(value + 25))} aria-label="Increase font size" disabled={fontSize >= 250}>A+</button></div><button className="profile-lock" onClick={lockProfile}>{activeProfile ? `${activeProfile.name} · Lock` : 'Profile'}</button><button className="level-pill" onClick={() => go('progress')}>✦ {level}</button></header>
      {!locked && <>
        {destination === 'park' && <JunglePark known={Object.values(progress.terms).filter(term => term.known).length} level={level} reachedStop={progress.journey.reachedStop} difficulty={progress.journey.difficulty} onDifficulty={changeDifficulty} onTrail={() => go('trail')} onGames={() => go('games')} onGuide={() => go('guide')} onProgress={() => go('progress')} />}
        {destination === 'trail' && <FlashcardTrail progress={progress} onProgress={setProgress} />}
        {destination === 'games' && (game === 'bingo' ? <BingoGame progress={progress} terms={reachedTerms} challengeDepth={progress.journey.difficulty === 'easy' ? 1 : progress.journey.difficulty === 'trail' ? 3 : 5} settings={{ music:false, soundEffects:false, voice:false, animations:true, personality:'Coach', preset:'Normal' }} onProgress={setProgress} onExit={() => setGame(null)} /> : game ? <GameSession mode={game} progress={progress} terms={reachedTerms} challengeDepth={progress.journey.difficulty === 'easy' ? 1 : progress.journey.difficulty === 'trail' ? 3 : 5} onProgress={setProgress} onExit={() => setGame(null)} /> : <GameHub onStart={startGame} onTrail={() => go('trail')} termCount={reachedTerms.length} />)}
        {destination === 'guide' && <TermGuide />}
        {destination === 'progress' && <ProgressPage progress={progress} level={level} onReset={() => setProgress(createEmptyProgress())} />}
      </>}
      <footer className="jungle-footer"><span>DEV JARGON JUNGLE</span><span>Journey through the jargon. Juggle the terms. Jump into dev-team life.</span></footer>
    </main>
    {locked && <ProfileGate profiles={profiles} legacyTerms={legacyTerms} onUnlock={handleUnlock} onCreate={handleCreate} />}
  </div>
}
