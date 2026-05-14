# Pause Feature Design

**Date:** 2026-05-14  
**Scope:** `src/components/GameCanvas.vue` only

## Summary

Add pause/resume via `P` key (keyCode 80). Pausing stops the game loop interval and draws a canvas overlay. Resuming restarts the interval.

## Architecture

Single-file change: `GameCanvas.vue`. No changes to composables, constants, or game logic.

### State

```js
const isPaused = ref(false)
```

### Toggle logic

In `handleKeyDown`:
- Ignore `P` if `!instructionsDisplayed.value` (game not started yet)
- Do not forward `P` to `keyPressHandler`
- On pause: `clearInterval(intervalId)`, call `drawPauseOverlay()`
- On resume: `intervalId = setInterval(gameLoop, 50)`

### Overlay

Drawn once via `canvasRef.value.getContext('2d')` when pausing:
- Semi-transparent dark rectangle covering full canvas (e.g. `rgba(0,0,0,0.5)`)
- "PAUSED" text centered, large white font

Overlay is cleared automatically when game resumes — next `gameLoop` tick redraws the canvas.

### `onUnmounted`

No change needed. Existing `clearInterval(intervalId)` handles both paused and running states.

## Edge Cases

| Scenario | Behaviour |
|----------|-----------|
| `P` pressed on instructions screen | Ignored |
| `P` during death/game-over transition | Pauses interval — valid, safe |
| Unmount while paused | `clearInterval` already called on pause; `onUnmounted` call is a no-op |

## Out of Scope

- Pause blocked during certain game states (not needed — interval-level pause is universal)
- Keyboard shortcut display on overlay (keep it minimal)
