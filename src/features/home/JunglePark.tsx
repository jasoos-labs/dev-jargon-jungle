import { DIFFICULTIES, TRAIL_STOPS } from '../../domain/trail'
import type { TrailDifficulty } from '../../domain/types'

export function JunglePark({ known, level, reachedStop, difficulty, onDifficulty, onTrail, onGames, onGuide, onProgress }: {
  known: number; level: string; reachedStop: number; difficulty: TrailDifficulty; onDifficulty: (value: TrailDifficulty) => void
  onTrail: () => void; onGames: () => void; onGuide: () => void; onProgress: () => void
}) {
  const everestImage = `${import.meta.env.BASE_URL}everest-base-camp.jpg`
  return <section className="park-page">
    <section className="difficulty-section newcomer-choice" aria-labelledby="challenge-title">
      <span className="eyebrow">START YOUR JOURNEY</span>
      <h1 id="challenge-title">Choose your challenge level</h1>
      <p>New to developer talk? Pick a comfortable starting point. You can change it anytime.</p>
      <div className="difficulty-options">{DIFFICULTIES.map((item, index) => <button key={item.id} className={difficulty === item.id ? 'difficulty-option selected' : 'difficulty-option'} onClick={() => onDifficulty(item.id)} aria-pressed={difficulty === item.id}>
        <span className="challenge-number">{index + 1}</span><b>{item.name}</b><span>{[
          'A gentle start with a few everyday terms.',
          'A steady climb with more terms to explore.',
          'A bigger challenge with the full trail.',
        ][index]}</span>
      </button>)}</div>
    </section>

    <div className="everest-hero" style={{ backgroundImage: `linear-gradient(90deg,#17382fee 0%,#17382fdb 42%,#17382f66 100%),url("${everestImage}")` }}>
      <div className="everest-wash" />
      <div className="everest-copy"><span className="eyebrow">YOUR NEPAL TO EVEREST JOURNEY</span><h2>Learn the language.<br /><em>Follow the trail.</em></h2><p>No experience needed. Learn at your own pace, one stop at a time.</p><button className="button-primary" onClick={onTrail}>{known > 0 ? 'Continue your trail' : 'Start the trail'} <span>↗</span></button></div>
      <div className="route-map" aria-label={`Your journey marker is at ${TRAIL_STOPS[reachedStop]?.name ?? 'Kathmandu'}`}>
        <div className="route-map-top"><span>THE HIMALAYAN ROUTE</span><b>{known} learned</b></div>
        <div className="route-line"><span className="route-progress" style={{ width: `${reachedStop / (TRAIL_STOPS.length - 1) * 100}%` }} />{TRAIL_STOPS.map((stop, index) => <span key={stop.id} className={`route-marker ${index < reachedStop ? 'passed' : ''} ${index === reachedStop ? 'current' : ''}`} style={{ left: `${index / (TRAIL_STOPS.length - 1) * 100}%` }} title={stop.name}>{index === reachedStop ? '◆' : index < reachedStop ? '✓' : '·'}</span>)}</div>
        <div className="route-endpoints"><span>Kathmandu</span><span>Summit Challenge</span></div>
        <span className="image-credit">Photo by <a href="https://commons.wikimedia.org/wiki/File:Everest_Base_Camp.jpg" target="_blank" rel="noreferrer">Tom Simcock</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer">CC BY-SA 3.0</a> · resized</span>
      </div>
    </div>

    <details className="advanced-tools">
      <summary>More ways to learn <span>Games, glossary, and progress</span></summary>
      <div className="advanced-content">
        <div className="explorer-row"><span className="explorer-badge">✦</span><span><b>{level} explorer</b> · Your progress stays with your profile</span><span className="explorer-note">Setbacks never erase learned terms.</span></div>
        <div className="home-tools"><button className="home-tool-card" onClick={onGames}><span>PRACTICE</span><b>Games & scenarios</b><small>Practice with words you've reached. ↗</small></button><button className="home-tool-card" onClick={onGuide}><span>LOOK UP A WORD</span><b>Full glossary</b><small>Search all the developer terms. ↗</small></button><button className="home-tool-card" onClick={onProgress}><span>YOUR JOURNEY</span><b>Progress</b><small>See what you've learned so far. ↗</small></button></div>
      </div>
    </details>

    <section className="nepal-dedication" aria-labelledby="nepal-dedication-title">
      <div className="dedication-heading"><span className="eyebrow">A SMALL REQUEST</span><h2 id="nepal-dedication-title">If this is useful to you, do something for me:</h2><p>Support the people and communities of Nepal, the home of this journey.</p></div>
      <div className="dedication-links"><article className="dedication-card"><span className="dedication-type">ONGOING SUPPORT</span><h3>Nepal Red Cross Society</h3><p>Support humanitarian, health, community, and disaster-response work across Nepal.</p><a href="https://donation.nrcs.org/donate" target="_blank" rel="noreferrer">Visit their donation portal <span aria-hidden="true">↗</span></a></article><article className="dedication-card"><span className="dedication-type">CURRENT NEPAL FLOOD RESPONSE</span><h3>Direct Relief</h3><p>Support medical aid and response work with local partners in flood-affected communities.</p><a href="https://www.directrelief.org/emergency/nepal-floods-2026/" target="_blank" rel="noreferrer">Visit the Nepal response fund <span aria-hidden="true">↗</span></a></article></div>
      <p className="dedication-note">Donations are optional and go directly to the organizations. Dev Jargon Jungle does not collect donations.</p>
    </section>
  </section>
}
