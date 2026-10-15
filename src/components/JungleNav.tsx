export type Destination = 'park' | 'trail' | 'games' | 'guide' | 'progress'

const links: { id: Destination; label: string; icon: string }[] = [
  { id:'park', label:'Park map', icon:'⌂' },
  { id:'trail', label:'Flashcard trail', icon:'▤' },
  { id:'games', label:'Games', icon:'✳' },
  { id:'guide', label:'Term guide', icon:'⌕' },
  { id:'progress', label:'My progress', icon:'↗' },
]

export function JungleNav({ current, level, onNavigate }: { current: Destination; level: string; onNavigate: (destination: Destination) => void }) {
  return <>
    <aside className="jungle-sidebar">
      <button className="jungle-brand" onClick={() => onNavigate('park')}><span className="brand-mark">J</span><span><b>Dev Jargon<br />Jungle</b><small>LEARN THE LANGUAGE</small></span></button>
      <nav aria-label="Main navigation">{links.map(link => <button key={link.id} className={current === link.id ? 'selected' : ''} onClick={() => onNavigate(link.id)}><span>{link.icon}</span>{link.label}</button>)}</nav>
      <div className="sidebar-note"><span>✦</span><p><b>New explorer?</b><br />Take the trail one card at a time.</p><small>9E · 4E + 5E</small></div>
    </aside>
    <nav className="jungle-mobile-nav" aria-label="Main navigation">{links.map(link => <button key={link.id} className={current === link.id ? 'selected' : ''} onClick={() => onNavigate(link.id)}><span>{link.icon}</span><small>{link.label}</small></button>)}</nav>
    <span className="sr-only" aria-live="polite">Current learner level: {level}</span>
  </>
}
