'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CircleHelp, Grid3X3, ListPlus, Play, Settings2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Mode = 'grid' | 'slot'

type Word = {
  id: number
  text: string
  used: boolean
  isProp?: boolean
  category?: 'unprepared' | 'banned' | 'listener' | 'sns' | 'props'
}

const initialWords = [
  'スクワット10回', '腹筋10回', '腕立て伏せ10回', 'プランク1分間', '足つぼマット足踏み1分', '全力のイケボで愛の告白',
  '3分間語尾に「にゃん」', '3分間ツンデレ', '3分間メンヘラ', '3分間赤ちゃん言葉', '3分間リスナーが決めた語尾', '5分間英語禁止',
  'ガチの黒歴史を暴露', '直近の検索履歴を3つ言う', '全力で投げキッス3回', '好きな歌のサビ熱唱', '即興で1分間架空の商品を売り込む',
  'リスナー1人を本気でベタ褒め', '今すぐXで「私は天才です」とポスト', '3分間一切笑ってはいけない', '今1番欲しいものを全力おねだり',
  'スマホに保存した最新画像を詳細に説明', '次来た人に全力ぶりっ子挨拶', '3分間テンションMAX', '自分の好きなところを3つ発表',
  '恥ずかしい本気ポエムを即興で詠む', '指で思いっきり鼻毛を抜く', '性癖を1つ言う', 'なにもしない', 'セーフ', '10分間飲み物禁止',
  '1回だけ罰ゲームをスルー出来る権利を得る', 'こよりでくしゃみをする', '6時間麺類禁止', '3時間煙草禁止', '6時間コーヒー禁止',
  '6時間飲酒禁止', '6時間魚禁止', '6時間肉禁止', '重複消化されたものをリセットする',
]

const initialPropWords = [
  '激辛焼きそばを食べる', '激辛スナックを食べる', 'タバスコを3滴舐める', 'デスソースを3滴舐める', 'ねりわさびを1cm食べる',
  'ねりからしを1cm食べる', '梅干しをひとつ食べる', 'レモンをかじる', '噛まずに氷を3つ食べる', '炭酸水コップ一杯飲んでゲップを我慢',
  '顔に洗濯バサミを1つつける', '手首で思い切りゴムパッチン', '足つぼマットの上で5回ジャンプ', '足つぼマット足踏み1分', '風船を膨らませて目の前で割る',
]

const initialBannedWords = '6時間麺類禁止/3時間煙草禁止/6時間コーヒー禁止/6時間飲酒禁止/6時間魚禁止/6時間肉禁止/6時間お米禁止/'
const initialListenerWords = 'ギフターの良いところ5個言う/今反応するリスナーの良いところを1つずつ言う/3分間ギフターが決めた語尾/1分間ギフターをベタ褒め/ギフターが次の罰ゲームをする/直近で10ｃ投げた人に追加をおねだり/今から10分間全員江戸時代/今から10分間全員同じ高校生/今から10分間全員同じ職場の社員/今から10分間全員爺さん婆さん/今から5分間全員原始人/'
const initialSnsWords = 'Xおすすめの一番上に出たものをRT/Xにガチポエムを投稿/Xでかまってちゃん発言投稿/'
const TERMS_TEXT = `第1条（適用）
本規約は、[Tosh1：X / @Tosh1000950]（以下「運営者」）が提供する本サービスの利用条件を定めます。ユーザーは本サービスを利用することで本規約に同意したものとみなされます。

第2条（本サービスの性質と結果の取り扱い）
本サービスは娯楽や日常の簡易的な意思決定の補助を目的としたツールです。抽選等はプログラム上の疑似乱数を用いており、厳密な無作為性や確率の均等性を保証しません。結果の利用と、それに基づく行動や第三者とのトラブルはユーザーの責任とし、運営者は責任を負いません。

第3条（知的財産権）
本サービスのプログラム、デザイン、テキスト等の著作権は運営者または正当な権利者に帰属します。個人的な利用やSNS等でのスクリーンショット・動画共有は自由ですが、無断複製、再配布、商用目的での直接利用は禁止します。

第4条（禁止事項）
法令または公序良俗に違反する行為、本サービスのサーバーやネットワークを妨害する行為、不正アクセス、スクレイピング、リバースエンジニアリング等を禁止します。

第5条（サービスの変更・停止・終了）
運営者は事前通知なく本サービスの内容を変更、停止、終了できるものとします。

第6条（免責事項）
運営者は本サービスに安全性、信頼性、正確性、有効性、エラーやバグ、セキュリティ上の欠陥がないことを保証しません。利用により生じた損害について、運営者の故意または重過失による場合を除き責任を負いません。

第7条（規約の変更）
運営者は必要と判断した場合、いつでも本規約を変更できます。

制定日：2026年11月10日`

export function PenaltyRoulette() {
  const [mode, setMode] = useState<Mode>('grid')
  const [words, setWords] = useState<Word[]>(() => [
    ...initialWords.map((text, id) => ({ id, text, used: false, category: 'unprepared' as const })),
    ...initialBannedWords.split('/').filter(Boolean).map((text, index) => ({ id: 1000 + index, text, used: false, category: 'banned' as const })),
    ...initialListenerWords.split('/').filter(Boolean).map((text, index) => ({ id: 2000 + index, text, used: false, category: 'listener' as const })),
    ...initialSnsWords.split('/').filter(Boolean).map((text, index) => ({ id: 3000 + index, text, used: false, category: 'sns' as const })),
    ...initialPropWords.map((text, index) => ({ id: 4000 + index, text, used: false, isProp: true, category: 'props' as const })),
  ])
  const [noRepeat, setNoRepeat] = useState(true)
  const [isSpinning, setIsSpinning] = useState(false)
  const [highlightId, setHighlightId] = useState<number | null>(null)
  const [winner, setWinner] = useState<Word | null>(null)
  const [spinCount, setSpinCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [consent, setConsent] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [showResult, setShowResult] = useState<Word | null>(null)
  const [isBlinking, setIsBlinking] = useState(false)
  const [isAwaitingResult, setIsAwaitingResult] = useState(false)
  const [useProps, setUseProps] = useState(false)
  const [gridColumns, setGridColumns] = useState(8)
  const [gridRows, setGridRows] = useState(4)
  const [isMobile, setIsMobile] = useState(false)
  const [wordInput, setWordInput] = useState(initialWords.join('/'))
  const [propWordInput, setPropWordInput] = useState(initialPropWords.join('/'))
  const [listenerWordInput, setListenerWordInput] = useState(initialListenerWords)
  const [snsWordInput, setSnsWordInput] = useState(initialSnsWords)
  const [bannedWordInput, setBannedWordInput] = useState(initialBannedWords)
  const [openWordGroup, setOpenWordGroup] = useState<string | null>(null)
  const [groupEnabled, setGroupEnabled] = useState({ unprepared: true, banned: true, listener: true, sns: true, props: false })
  const [timers, setTimers] = useState<Array<{ id: number; label: string; remaining: number; paused: boolean }>>([])
  const [countdowns, setCountdowns] = useState<Array<{ id: number; label: string; remaining: number; minutes: number; postponed: boolean }>>([])
  const [volume, setVolume] = useState(0.65)
  const completedCountdownsRef = useRef(new Set<number>())
  const countdownToneRef = useRef(new Set<string>())
  const spinTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  useEffect(() => {
    const saved = window.localStorage.getItem('penalty-roulette-terms-consent')
    if (saved === 'accepted' || saved === 'declined') setConsent(saved)
  }, [])

  function chooseConsent(value: 'accepted' | 'declined') {
    window.localStorage.setItem('penalty-roulette-terms-consent', value)
    setConsent(value)
  }

  function playClip(name: 'start' | 'start_g' | 'move' | 'select' | 'select2') {
    if (typeof window === 'undefined') return
    const audio = new Audio(`/audio/${name}.mp3`)
    audio.volume = volume
    void audio.play().catch(() => undefined)
  }

  function timerKey(label: string) {
    return label.normalize('NFKC').replace(/\s+/g, '').replace(/開始まで$/, '')
  }

  function addTimerDuration(label: string, seconds: number, paused = false, id = Date.now()) {
    setTimers((current) => {
      const key = timerKey(label)
      const match = current.find((timer) => timerKey(timer.label) === key)
      if (match) return current.map((timer) => timer.id === match.id ? { ...timer, remaining: timer.remaining + seconds, paused: timer.paused || paused } : timer)
      return [...current, { id, label: label.replace(/\s*開始まで$/, ''), remaining: seconds, paused }]
    })
  }

  function postponeCountdown(countdownId: number) {
    const countdown = countdowns.find((item) => item.id === countdownId)
    if (!countdown) return
    const label = countdown.label.replace(/ 開始まで$/, '')
    setCountdowns((current) => current.filter((item) => item.id !== countdownId))
    addTimerDuration(label, countdown.minutes * 60, true, countdownId)
  }

  function playCountdownTone(finalTone = false) {
    if (typeof window === 'undefined') return
    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = finalTone ? 'sawtooth' : 'square'
    oscillator.frequency.setValueAtTime(finalTone ? 740 : 880, context.currentTime)
    if (finalTone) oscillator.frequency.exponentialRampToValueAtTime(1480, context.currentTime + 0.7)
    gain.gain.setValueAtTime(Math.max(volume * 0.12, 0.001), context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + (finalTone ? 0.7 : 0.16))
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + (finalTone ? 0.7 : 0.16))
    window.setTimeout(() => void context.close(), finalTone ? 800 : 250)
  }

  function sound(kind: 'start' | 'tick' | 'win' | 'slot' | 'stop') {
    if (typeof window === 'undefined') return
    const AudioCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtor) return
    const ctx = audioContext.current ?? new AudioCtor()
    audioContext.current = ctx
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    const frequencies = { start: 220, tick: kind === 'tick' ? 520 : 220, win: 660, slot: 140, stop: 330 }
    oscillator.frequency.value = frequencies[kind]
    oscillator.type = kind === 'slot' ? 'sawtooth' : 'square'
    gain.gain.setValueAtTime(0.045, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (kind === 'slot' ? 0.08 : 0.18))
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.2)
  }

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.matchMedia('(max-width: 700px)').matches)
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const effectiveColumns = isMobile ? Math.min(Math.max(gridColumns, 3), 4) : Math.min(Math.max(gridColumns, 4), 8)
  const effectiveRows = isMobile ? Math.min(Math.max(gridRows, 4), 8) : Math.min(Math.max(gridRows, 3), 6)
  const visibleWords = words
    .filter((word) => groupEnabled[word.category ?? (word.isProp ? 'props' : 'unprepared')])
    .slice(0, effectiveColumns * effectiveRows)
  const availableWords = useMemo(() => visibleWords
    .filter((word) => !noRepeat || !word.used), [visibleWords, noRepeat])
  const selectedIndex = availableWords.findIndex((word) => word.id === highlightId)
  const slotWords = winner ? [winner] : availableWords
  const slotIndex = winner ? 0 : selectedIndex

  useEffect(() => () => {
    if (spinTimer.current) clearInterval(spinTimer.current)
  }, [])

  useEffect(() => {
    if (!timers.length && !countdowns.length) return
    const interval = window.setInterval(() => {
      setTimers((current) => current.map((item) => item.paused ? item : { ...item, remaining: item.remaining - 1 }).filter((item) => item.remaining > 0))
      setCountdowns((current) => current.map((item) => item.postponed ? item : { ...item, remaining: item.remaining - 1 }).filter((item) => item.remaining >= 0))
    }, 1000)
    return () => window.clearInterval(interval)
  }, [timers.length, countdowns.length])

  useEffect(() => {
    countdowns.forEach((item) => {
      const toneKey = `${item.id}:${item.remaining}`
      if (!item.postponed && !countdownToneRef.current.has(toneKey)) {
        countdownToneRef.current.add(toneKey)
        playCountdownTone(item.remaining === 0)
      }
      if (item.remaining === 0 && !completedCountdownsRef.current.has(item.id)) {
        completedCountdownsRef.current.add(item.id)
        addTimerDuration(item.label, item.minutes * 60, false, item.id)
        setCountdowns((current) => current.filter((countdown) => countdown.id !== item.id))
      }
    })
  }, [countdowns])

  function applyWordInput(event: React.FormEvent) {
    event.preventDefault()
    const parse = (value: string) => value.split('/').map((text) => text.trim()).filter(Boolean)
    const parsedWords = parse(wordInput)
    const parsedBanned = parse(bannedWordInput)
    const parsedListener = parse(listenerWordInput)
    const parsedSns = parse(snsWordInput)
    const parsedProps = parse(propWordInput)
    if (!parsedWords.length && !parsedProps.length) return
    const now = Date.now()
    setWords([
      ...parsedWords.map((text, index) => ({ id: now + index, text, used: false, category: 'unprepared' as const })),
      ...parsedBanned.map((text, index) => ({ id: now + 1000 + index, text, used: false, category: 'banned' as const })),
      ...parsedListener.map((text, index) => ({ id: now + 2000 + index, text, used: false, category: 'listener' as const })),
      ...parsedSns.map((text, index) => ({ id: now + 3000 + index, text, used: false, category: 'sns' as const })),
      ...parsedProps.map((text, index) => ({ id: now + 4000 + index, text, used: false, isProp: true, category: 'props' as const })),
    ])
    setWordInput(parsedWords.join('/'))
    setBannedWordInput(parsedBanned.join('/'))
    setListenerWordInput(parsedListener.join('/'))
    setSnsWordInput(parsedSns.join('/'))
    setPropWordInput(parsedProps.join('/'))
    setWinner(null)
    setHighlightId(null)
  }

  function resolveSelection(selected: Word) {
    setWinner(selected)
    setHighlightId(selected.id)
    setIsBlinking(mode === 'grid')
    setIsAwaitingResult(true)
    playClip(mode === 'slot' ? 'select2' : 'select')
    window.setTimeout(() => {
      setIsBlinking(false)
      setShowResult(selected)
      const durationMatch = selected.text.match(/(\d+)\s*分間/)
      if (durationMatch) {
        const minutes = Number(durationMatch[1])
        setCountdowns((current) => [...current, { id: Date.now(), label: `${selected.text} 開始まで`, remaining: 10, minutes, postponed: false }])
      }
    }, 3000)
    if (selected.text.startsWith('重複消化されたものをリセットする')) setWords((current) => current.map((word) => ({ ...word, used: false })))
    setIsSpinning(false)
  }

  function debugSelectWord(word: Word) {
    if (!debugMode || mode !== 'grid' || isSpinning || showResult || isAwaitingResult) return
    resolveSelection(word)
  }

  function spin() {
    const spinPool = noRepeat && winner ? availableWords.filter((word) => word.id !== winner.id) : availableWords
    if (isSpinning || spinPool.length === 0) return
    if (noRepeat && winner) setWords((current) => current.map((word) => word.id === winner.id ? { ...word, used: true } : word))
    setIsSpinning(true)
    setWinner(null)
    setShowResult(null)
    playClip(mode === 'slot' ? 'start' : 'start_g')
    setSpinCount((value) => value + 1)
    let tick = 0
    const duration = mode === 'slot' ? 5200 : (() => {
      const roll = Math.random() * 100
      if (roll < 18) return 4000
      if (roll < 36) return 5000
      if (roll < 54) return 6000
      if (roll < 72) return 7000
      if (roll < 90) return 8000
      if (roll < 97) return 9000
      return 10000
    })()
    const startedAt = Date.now()
    const chosenIndex = Math.floor(Math.random() * spinPool.length)

    spinTimer.current = setInterval(() => {
      tick += 1
      const elapsed = Date.now() - startedAt
      const progress = Math.min(elapsed / duration, 1)
      const nextIndex = progress >= 0.96
        ? chosenIndex
        : Math.floor(Math.random() * spinPool.length)
      setHighlightId(spinPool[nextIndex]?.id ?? null)
      if (mode === 'slot') sound('slot')
      else playClip('move')
      if (progress >= 1) {
        if (spinTimer.current) clearInterval(spinTimer.current)
        const selected = spinPool[chosenIndex]
        resolveSelection(selected)
      }
    }, mode === 'slot' ? 95 : 115)
  }

  function rerollWinner() {
    if (isSpinning || visibleWords.length < 2) return
    const candidates = visibleWords.filter((word) => (groupEnabled.props || !word.isProp) && groupEnabled.unprepared && word.id !== winner?.id)
    if (!candidates.length) return
    const next = candidates[Math.floor(Math.random() * candidates.length)]
    setWinner(next)
    setIsBlinking(false)
    setHighlightId(next.id)
    window.setTimeout(() => setShowResult(next), 2000)
    playClip(mode === 'slot' ? 'select2' : 'select')
  }

  function resetDisplayedWords() {
    if (isSpinning) return
    const enabledWords = words.filter((word) => groupEnabled[word.category ?? (word.isProp ? 'props' : 'unprepared')])
    if (enabledWords.length < 2) return
    const shuffled = [...enabledWords]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
    }
    const enabledIds = new Set(enabledWords.map((word) => word.id))
    setWords((current) => {
      let cursor = 0
      return current.map((word) => enabledIds.has(word.id) ? shuffled[cursor++] : word)
    })
    setWinner(null)
    setHighlightId(null)
    setShowResult(null)
    setIsAwaitingResult(false)
  }

  const canSpin = availableWords.length > 0 && !isSpinning && !showResult && !isAwaitingResult

  return (
    <main className="roulette-page">
      <div className="noise-layer" aria-hidden="true" />
      <header className="topbar">
        <div className="brand-mark"><span>罰</span><span>ゲ</span><span>ーム</span></div>
        <div className="topbar-copy">
          <p className="eyebrow">STREAMING GAME TOOL / LIVE EDITION</p>
          <h1>恐怖の罰ゲーム <span>ルーレット / スロット</span></h1>
        </div>
        <div className="live-badge"><span className="live-dot" /> LIVE READY</div>
      </header>

      <div className="content-shell">
        <section className="control-row" aria-label="表示モード">
          <div className="mode-toggle" role="group" aria-label="表示モード">
            <button className={cn('mode-button', mode === 'grid' && 'is-active')} onClick={() => setMode('grid')} type="button">
              <Grid3X3 /> グリッドモード
            </button>
            <button className={cn('mode-button', mode === 'slot' && 'is-active')} onClick={() => setMode('slot')} type="button">
              <ListPlus /> スロットモード
            </button>
          </div>
          <div className="credit-line control-credit">Created by Tosh1 · <a href="https://x.com/Tosh1000950" target="_blank" rel="noreferrer">X / @Tosh1000950</a></div>
        </section>
        {showSettings && <div className="settings-backdrop" role="presentation" onClick={() => setShowSettings(false)}>
          <section className="settings-panel" aria-label="罰ゲームワード設定" onClick={(event) => event.stopPropagation()}>
            <div><p className="eyebrow">PENALTY LIST</p><h2>罰ゲームワード</h2><p>すべてのワードを「ワード/ワード/ワード/」の形式で入力してください。</p></div>
            <form className="bulk-form" onSubmit={applyWordInput}>
              <div className="debug-setting">
                <span><strong>デバッグモード</strong><small>グリッドのワードをクリックして即時確定</small></span>
                <button className={cn('switch', debugMode && 'on')} aria-pressed={debugMode} onClick={() => setDebugMode((value) => !value)} type="button"><span /></button>
                <strong>{debugMode ? 'ON' : 'OFF'}</strong>
              </div>
              <div className="word-group-list" aria-label="ワードカテゴリー">
                {[
                  ['unprepared', '無準備ワード'],
                  ['banned', '禁止ワード'],
                  ['listener', 'リスナー参加型ワード'],
                  ['sns', 'SNS関連ワード'],
                  ['props', '小道具ありワード'],
                ].map(([key, label]) => <div className="word-group-row" key={key}>
                  <button className="word-group-button" type="button" onClick={() => setOpenWordGroup(openWordGroup === key ? null : key)}>{label}</button>
                  <button className={cn('switch', groupEnabled[key as keyof typeof groupEnabled] && 'on')} aria-pressed={groupEnabled[key as keyof typeof groupEnabled]} onClick={() => setGroupEnabled((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))} type="button"><span /></button>
                  <strong>{groupEnabled[key as keyof typeof groupEnabled] ? 'ON' : 'OFF'}</strong>
                </div>)}
              </div>
              {openWordGroup === 'unprepared' && <>
                <label htmlFor="penalty-words">無準備ワード</label>
                <textarea id="penalty-words" value={wordInput} onChange={(event) => setWordInput(event.target.value)} aria-label="無準備ワード一括入力" rows={8} />
              </>}
              {openWordGroup === 'banned' && <>
                <label htmlFor="banned-words">禁止ワード</label>
                <textarea id="banned-words" value={bannedWordInput} onChange={(event) => setBannedWordInput(event.target.value)} rows={6} />
              </>}
              {openWordGroup === 'listener' && <>
                <label htmlFor="listener-words">リスナー参加型ワード</label>
                <textarea id="listener-words" value={listenerWordInput} onChange={(event) => setListenerWordInput(event.target.value)} rows={6} />
              </>}
              {openWordGroup === 'sns' && <>
                <label htmlFor="sns-words">SNS関連ワード</label>
                <textarea id="sns-words" value={snsWordInput} onChange={(event) => setSnsWordInput(event.target.value)} rows={6} />
              </>}
              {openWordGroup === 'props' && <>
                <label htmlFor="prop-words">小道具ありワード</label>
                <textarea id="prop-words" value={propWordInput} onChange={(event) => setPropWordInput(event.target.value)} aria-label="小道具が必要な罰ゲーム一括入力" rows={6} />
              </>}
              <div className="volume-setting">
                <label htmlFor="volume-control">音量</label>
                <input id="volume-control" type="range" min="0" max="1" step="0.05" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
                <output htmlFor="volume-control">{Math.round(volume * 100)}%</output>
              </div>
              <div className="grid-size-settings">
                <label>グリッドサイズ</label>
                <div className="grid-size-fields">
                  <label>横<select value={gridColumns} onChange={(event) => setGridColumns(Number(event.target.value))}>{Array.from({ length: isMobile ? 2 : 5 }, (_, index) => <option key={index + (isMobile ? 3 : 4)} value={index + (isMobile ? 3 : 4)}>{index + (isMobile ? 3 : 4)}</option>)}</select></label>
                  <span>×</span>
                  <label>縦<select value={gridRows} onChange={(event) => setGridRows(Number(event.target.value))}>{Array.from({ length: isMobile ? 5 : 4 }, (_, index) => <option key={index + (isMobile ? 4 : 3)} value={index + (isMobile ? 4 : 3)}>{index + (isMobile ? 4 : 3)}</option>)}</select></label>
                  <small>{isMobile ? 'スマホ: 横3–4 / 縦4–8' : 'PC: 横4–8 / 縦3–6'}</small>
                </div>
              </div>
              <Button type="submit">反映する</Button>
            </form>
            <button className="settings-close" type="button" onClick={() => setShowSettings(false)}>閉じる</button>
          </section>
        </div>}

        <section className="stage-layout">
          <div className="stage-panel">
            <div className="settings-line" aria-label="設定と重複設定">
              <button className="settings-button" type="button" onClick={() => setShowSettings((value) => !value)} aria-expanded={showSettings}><Settings2 /> 設定</button>
              <span>重複:</span>
              <button className={cn('switch', noRepeat && 'on')} aria-pressed={noRepeat} onClick={() => setNoRepeat((value) => !value)} type="button"><span /></button>
              <strong>{noRepeat ? 'なし' : 'あり'}</strong>
              <button className="help-button" type="button" aria-label="重複設定の説明"><CircleHelp /></button>
            </div>
            <div className={cn('stage-heading', isSpinning && 'is-drawing', winner && 'is-confirmed')}>
              <div className="spin-counter">ROUND <b>{String(spinCount).padStart(2, '0')}</b></div>
              <div className="status-display"><span className="status-lamp" aria-hidden="true" /><h2>{isSpinning ? '抽選中' : winner ? '確定' : '罰ゲームルーレット'}</h2></div>
            </div>
            <div className={cn('roulette-stage', mode === 'slot' && 'slot-stage')}>
              <div className="stage-corner tl" /><div className="stage-corner tr" /><div className="stage-corner bl" /><div className="stage-corner br" />
              {mode === 'grid' ? (
                <div className="grid-board" aria-live="polite" style={{ gridTemplateColumns: `repeat(${effectiveColumns}, minmax(0, 1fr))` }}>
                  {visibleWords.map((word) => <div key={word.id} className={cn('grid-cell-container', debugMode && 'debug-clickable', word.used && noRepeat && 'is-used', highlightId === word.id && 'is-highlighted', isBlinking && highlightId === word.id && 'is-blinking')} onClick={() => debugSelectWord(word)} role={debugMode ? 'button' : undefined} tabIndex={debugMode ? 0 : undefined} onKeyDown={(event) => { if (debugMode && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); debugSelectWord(word) } }}><div className="grid-cell">{word.text}</div></div>)}
                </div>
              ) : (
                <div className="slot-machine-frame" aria-live="polite">
                  <div className="slot-lights"><i /><i /><i /><i /><i /><i /><i /></div>
                  <div className="slot-window">
                    <div className={cn('slot-drum', isSpinning && 'is-spinning')} style={{ transform: `translateY(-${Math.max(slotIndex, 0) * 46}px)` }}>
                      {(slotWords.length ? slotWords : words).map((word, index) => <div key={word.id} className={cn('slot-drum-item', index === slotIndex && word.id === (winner?.id ?? highlightId) && 'is-highlighted')}>{word.text}</div>)}
                    </div>
                    <div className="slot-focus-line" />
                  </div>
                  <div className="slot-machine-label">PENALTY SELECTOR</div>
                </div>
              )}
            </div>
            <div className="spin-area">
              <Button className="spin-button" onClick={spin} disabled={!canSpin}><Play data-icon="inline-start" fill="currentColor" /> {isSpinning ? '抽選中...' : 'ルーレットスタート'}</Button>
              <Button className="reroll-button" variant="outline" onClick={resetDisplayedWords} disabled={isSpinning || isAwaitingResult}>罰ゲーム全リセット</Button>
              <p className="spin-hint">{availableWords.length ? `${availableWords.length}個の候補から抽選` : '候補を追加してください'}</p>
            </div>
            {showResult && <div className="result-backdrop" onClick={() => { setShowResult(null); setIsAwaitingResult(false) }} role="presentation"><div className="winner-banner" onClick={(event) => event.stopPropagation()}><span>今回の罰ゲーム</span><strong>{showResult.text}</strong><button onClick={() => { setShowResult(null); setIsAwaitingResult(false) }} aria-label="結果を閉じる">×</button></div></div>}
            {!!countdowns.length && <div className="timer-stack countdown-stack" aria-live="polite">{countdowns.map((timer) => <div className="penalty-timer countdown-timer" key={timer.id}><span>開始まで</span><strong>{timer.remaining > 0 ? timer.remaining : 'START'}</strong><button type="button" onClick={() => postponeCountdown(timer.id)}>後でやる</button></div>)}</div>}
            {!!timers.length && <div className="timer-stack" aria-live="polite">{timers.map((timer) => <div className={cn('penalty-timer', timer.paused && 'is-paused')} key={timer.id}><span>{timer.label}</span><strong>{Math.floor(timer.remaining / 60)}:{String(timer.remaining % 60).padStart(2, '0')}</strong><button type="button" onClick={() => setTimers((current) => current.map((item) => item.id === timer.id ? { ...item, paused: !item.paused } : item))}>{timer.paused ? '再開' : '停止'}</button></div>)}</div>}
          </div>


        </section>
        <footer className="page-footer"><span>DESIGNED FOR STREAMERS</span><span className="footer-line" /><span>NO DATABASE · ALL LOCAL</span></footer>
        {consent !== 'accepted' && <div className="terms-backdrop" role="presentation"><section className="terms-modal" role="dialog" aria-modal="true" aria-labelledby="terms-title">
          <p className="eyebrow">TERMS OF USE</p>
          <h2 id="terms-title">利用規約</h2>
          <pre>{TERMS_TEXT}</pre>
          {consent === 'declined' && <p className="terms-declined">利用規約に同意しない場合、本サービスは利用できません。</p>}
          <div className="terms-actions"><button type="button" onClick={() => chooseConsent('declined')}>同意しない</button><button type="button" onClick={() => chooseConsent('accepted')}>同意する</button></div>
        </section></div>}
      </div>
    </main>
  )
}
