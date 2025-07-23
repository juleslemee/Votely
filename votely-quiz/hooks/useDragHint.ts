import { useState, useEffect } from 'react'

export function useDragHint(delay: number = 3000) {
  const [showHint, setShowHint] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    if (hasInteracted) {
      setShowHint(false)
      return
    }

    const timer = setTimeout(() => {
      setShowHint(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [hasInteracted, delay])

  const handleInteraction = () => {
    setHasInteracted(true)
    setShowHint(false)
  }

  return { showHint, handleInteraction }
}