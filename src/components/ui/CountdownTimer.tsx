'use client'

import { useState, useEffect } from 'react'

interface TimeLeft {
  jours:   number
  heures:  number
  minutes: number
  secondes: number
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    jours:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    heures:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes:  Math.floor((diff / 1000 / 60) % 60),
    secondes: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

interface Props {
  targetDate: string | Date
  accentColor?: string
}

export function CountdownTimer({ targetDate, accentColor = '#D4A820' }: Props) {
  const target = new Date(targetDate)
  const [time, setTime] = useState<TimeLeft | null>(() => calcTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!time) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <p className="font-display font-bold text-2xl" style={{ color: accentColor }}>
          C'est parti !
        </p>
      </div>
    )
  }

  const units = [
    { label: 'Jours',    value: time.jours },
    { label: 'Heures',   value: time.heures },
    { label: 'Minutes',  value: time.minutes },
    { label: 'Secondes', value: time.secondes },
  ]

  return (
    <div className="flex items-start gap-3 sm:gap-5">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-start gap-3 sm:gap-5">
          <div className="text-center">
            <div
              className="font-display font-black text-4xl sm:text-6xl tabular-nums leading-none"
              style={{ color: accentColor }}
            >
              {pad(value)}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest mt-2 text-[rgba(242,232,213,0.4)]">
              {label}
            </div>
          </div>
          {i < 3 && (
            <span className="font-display font-black text-3xl sm:text-5xl mt-1 text-[rgba(242,232,213,0.2)]">:</span>
          )}
        </div>
      ))}
    </div>
  )
}
