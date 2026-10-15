interface RecognitionResult { 0: { transcript: string } }
interface RecognitionEvent { results: ArrayLike<RecognitionResult> }
interface RecognitionInstance {
  lang: string
  interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}
interface RecognitionConstructor { new(): RecognitionInstance }

export function speechRecognitionAvailable(): boolean {
  const target = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  return Boolean(target.SpeechRecognition || target.webkitSpeechRecognition)
}

export function startSpeechInput(onText: (text: string) => void, onEnd: () => void): RecognitionInstance | null {
  const target = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor }
  const Constructor = target.SpeechRecognition || target.webkitSpeechRecognition
  if (!Constructor) return null
  const recognition = new Constructor()
  recognition.lang = navigator.language || 'en-US'
  recognition.interimResults = false
  recognition.onresult = event => onText(event.results[0][0].transcript)
  recognition.onerror = onEnd
  recognition.onend = onEnd
  recognition.start()
  return recognition
}
