export type GameMode = 'bingo' | 'survival' | 'match' | 'jeopardy' | 'scenario'

const games: { id: GameMode; title: string; icon: string; copy: string; flavor: string }[] = [
  { id:'bingo', title:'Bingo', icon:'▦', copy:'Read a team moment. Name the term. Fill the board.', flavor:'Find the pattern' },
  { id:'survival', title:'Survival', icon:'♡', copy:'Uncover the hidden phrase before your tries run out.', flavor:'Hangman-style' },
  { id:'match', title:'Match Pieces', icon:'◈', copy:'Connect terms to their everyday meanings.', flavor:'Pair them up' },
  { id:'jeopardy', title:'Jeopardy', icon:'▤', copy:'Pick a topic and challenge level. Score points.', flavor:'Choose a clue' },
  { id:'scenario', title:'Scenario', icon:'◉', copy:'Read what happened on the team. Choose the best term.', flavor:'Read the room' },
]

export function GameHub({ onStart, onTrail, termCount }: { onStart: (mode: GameMode) => void; onTrail: () => void; termCount: number }) {
  return <section className="feature-page games-page"><div className="feature-heading"><div><span className="eyebrow">SIDE TRAILS AND CHALLENGES</span><h1>Choose a <em>game</em></h1><p>Challenges draw only from the {termCount} terms you have reached.</p></div><button className="button-secondary light-button" onClick={onTrail}>Study flashcards ↗</button></div><div className="game-card-grid">{games.map((game, index) => { const minimum = game.id === 'bingo' ? 4 : 2; const available = termCount >= minimum; return <button className="game-card" key={game.id} disabled={!available} onClick={() => onStart(game.id)}><span className="game-index">0{index + 1} · {game.flavor}</span><span className="game-icon">{game.icon}</span><h2>{game.title}</h2><p>{available ? game.copy : `Reach ${minimum - termCount} more trail term${minimum - termCount === 1 ? '' : 's'} to open this game.`}</p><small>{available ? 'PLAY NOW' : 'ON THE TRAIL AHEAD'} <span>{available ? '↗' : '↗'}</span></small></button> })}</div><p className="game-note">Games and scenarios are practice stops. Flashcards remain the main trail.</p></section>
}
