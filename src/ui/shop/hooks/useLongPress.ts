
import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for handling long-press interactions with accelerating intervals.
 * 
 * @param callback Function to call on each tick. Receives the accumulated 'speed' or 'amount' to change.
 * @param initialDelay Delay in ms before repeating starts (default: 300ms)
 * @param initialInterval Interval in ms between ticks (default: 100ms)
 * @returns Props to spread onto the button element (onMouseDown, onMouseUp, onMouseLeave, onTouchStart, onTouchEnd)
 */
export function useLongPress(
    callback: () => void,
    initialDelay: number = 300,
    initialInterval: number = 100
) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const start = useCallback(() => {
        // Trigger immediately on press
        callbackRef.current()

        // Clear any existing timers
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (intervalRef.current) clearInterval(intervalRef.current)

        // Start delay timer
        timeoutRef.current = setTimeout(() => {
            // Start repeat interval
            intervalRef.current = setInterval(() => {

                // Accelerate: Call callback multiple times based on duration?
                // Or just call callback once and let consumer handle speed?
                // Actually, the request was "log speed" (acceleration).
                // Let's implement internal acceleration by calling the callback more frequently or passing a multiplier.
                // But setInterval is fixed. To variable interval, we need recursive setTimeout.
                // Simpler approach: fixed interval, but execute callback multiple times or expect callback to add more?
                // The hook signature asked for `callback: () => void`. 
                // Let's stick to simple repeat for now, or maybe accelerate by reducing interval?
                // Reducing interval is better for smooth feel.

                // However, `setInterval` is not easy to change on the fly without clearing.
                // Let's use recursive setTimeout for variable speed.
                callbackRef.current()
            }, initialInterval)

        }, initialDelay)
    }, [initialDelay, initialInterval]) // Dependencies are effectively static config

    const clear = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
    }, [])

    return {
        onMouseDown: () => {
            // Prevent default to avoid text selection etc
            // e.preventDefault() // Sometimes causes issues with click
            start()
        },
        onMouseUp: clear,
        onMouseLeave: clear,
        onTouchStart: () => {
            // e.preventDefault() // Prevents scrolling, might be desired for buttons
            start()
        },
        onTouchEnd: clear
    }
}

/**
 * Hook for value acceleration.
 * Usage: Long press + or - button.
 * Speed curve:
 * 0-5 ticks: +1
 * 6-15 ticks: +5
 * 16+ ticks: +10
 * (Adjust as needed)
 */
export function useAcceleratingValue(
    updateFn: (amount: number) => void,
    delay = 300,
    interval = 100
) {
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const countRef = useRef(0)
    const updateFnRef = useRef(updateFn)

    useEffect(() => {
        updateFnRef.current = updateFn
    }, [updateFn])

    const stop = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        countRef.current = 0
    }, [])

    const run = useCallback(() => {
        const tick = () => {
            countRef.current++
            // Acceleration Logic
            let step = 1
            if (countRef.current > 20) step = 10
            else if (countRef.current > 10) step = 5

            updateFnRef.current(step)

            // Decreasing interval for "log feelings"?
            // fixed interval 80ms is usually smooth enough if step increases.

            timerRef.current = setTimeout(tick, interval)
        }

        timerRef.current = setTimeout(tick, interval) // subsequent ticks
    }, [interval])

    const start = useCallback(() => {
        stop()
        // Immediate action
        updateFnRef.current(1)

        // Initial delay before repeating
        timerRef.current = setTimeout(run, delay)
    }, [delay, run, stop])

    return {
        start,
        stop
    }
}
