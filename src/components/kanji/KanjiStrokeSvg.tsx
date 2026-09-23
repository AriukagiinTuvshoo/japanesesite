'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KanjiStrokeSvgProps {
  svgData: string
  strokeCount: number
  size?: number
  className?: string
}

export function KanjiStrokeSvg({ svgData, strokeCount, size = 180, className }: KanjiStrokeSvgProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentStroke, setCurrentStroke] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(800)      // ms per stroke
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const pathsRef = useRef<SVGPathElement[]>([])

  // Parse and inject SVG
  useEffect(() => {
    if (!containerRef.current || !svgData) return
    const container = containerRef.current

    // Sanitize and inject SVG
    const parser = new DOMParser()
    const doc    = parser.parseFromString(svgData, 'image/svg+xml')
    const svg    = doc.querySelector('svg')
    if (!svg) return

    // Remove existing SVG
    container.innerHTML = ''

    // Set dimensions
    svg.setAttribute('width',  String(size))
    svg.setAttribute('height', String(size))
    svg.setAttribute('viewBox', svg.getAttribute('viewBox') ?? '0 0 109 109')

    // Collect stroke paths (KanjiVG paths inside kvg:* groups)
    const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[]
    pathsRef.current = paths

    // Initially hide all paths
    paths.forEach((p, i) => {
      p.style.opacity = '0'
      p.style.transition = `opacity 0.15s ease`
      p.style.stroke = i === currentStroke ? '#ef4444' : '#1a1a2e'
      p.style.strokeWidth = p.style.strokeWidth || '3'
      p.style.fill = 'none'
      p.style.strokeLinecap = 'round'
      p.style.strokeLinejoin = 'round'
    })

    // Show strokes up to currentStroke
    paths.slice(0, currentStroke + 1).forEach((p, i) => {
      p.style.opacity = '1'
      p.style.stroke = i === currentStroke ? '#ef4444' : '#374151'
    })

    container.appendChild(svg)
  }, [svgData, size])

  // Update visible strokes when currentStroke changes
  useEffect(() => {
    const paths = pathsRef.current
    if (!paths.length) return
    paths.forEach((p, i) => {
      p.style.opacity = i <= currentStroke ? '1' : '0'
      p.style.stroke  = i === currentStroke ? '#ef4444' : '#374151'
      p.style.strokeWidth = i === currentStroke ? '4' : '3'
    })
  }, [currentStroke])

  // Autoplay
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStroke((prev) => {
          if (prev >= strokeCount - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, strokeCount])

  const handlePlay  = () => {
    if (currentStroke >= strokeCount - 1) setCurrentStroke(0)
    setIsPlaying(true)
  }
  const handlePause  = () => setIsPlaying(false)
  const handleReset  = () => { setIsPlaying(false); setCurrentStroke(0) }
  const handlePrev   = () => { setIsPlaying(false); setCurrentStroke((p) => Math.max(0, p - 1)) }
  const handleNext   = () => { setIsPlaying(false); setCurrentStroke((p) => Math.min(strokeCount - 1, p + 1)) }

  return (
    <div className={cn('space-y-3', className)}>
      {/* SVG container */}
      <div
        ref={containerRef}
        className="bg-white dark:bg-gray-950 border rounded-xl flex items-center justify-center"
        style={{ width: size, height: size }}
      />

      {/* Stroke counter */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Зурлаг {currentStroke + 1} / {strokeCount}</span>
        <div className="flex items-center gap-1.5">
          <span>Хурд:</span>
          {[1200, 800, 400].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn('px-1.5 py-0.5 rounded text-[10px] border',
                speed === s ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'
              )}
            >
              {s === 1200 ? '🐢' : s === 800 ? '🚶' : '🏃'}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStroke + 1) / strokeCount) * 100}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={handleReset} className="p-2 rounded-lg border hover:bg-muted" title="Дахин эхлэх">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button onClick={handlePrev} disabled={currentStroke === 0} className="p-2 rounded-lg border hover:bg-muted disabled:opacity-40" title="Өмнөх">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {isPlaying ? (
          <button onClick={handlePause} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 text-sm">
            <Pause className="w-3.5 h-3.5" /> Зогсоох
          </button>
        ) : (
          <button onClick={handlePlay} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-1.5 text-sm">
            <Play className="w-3.5 h-3.5" /> Тоглуулах
          </button>
        )}
        <button onClick={handleNext} disabled={currentStroke >= strokeCount - 1} className="p-2 rounded-lg border hover:bg-muted disabled:opacity-40" title="Дараах">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// Placeholder when no stroke data
export function KanjiStrokePlaceholder({ character, size = 180 }: { character: string; size?: number }) {
  return (
    <div
      className="bg-muted/30 border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center gap-2"
      style={{ width: size, height: size }}
    >
      <span className="text-5xl" style={{ fontFamily: 'var(--font-noto-jp)' }}>{character}</span>
      <span className="text-xs text-muted-foreground">Зурлагын дата байхгүй</span>
    </div>
  )
}
