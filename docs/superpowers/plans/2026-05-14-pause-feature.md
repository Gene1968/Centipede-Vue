# Pause Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Toggle game pause/resume with the `P` key, freezing the game loop and showing a canvas overlay.

**Architecture:** Single-file change in `GameCanvas.vue`. Pause = `clearInterval`, draw overlay once. Resume = `setInterval` restart. No changes to composables or constants.

**Tech Stack:** Vue 3, canvas 2D API, `setInterval`/`clearInterval`

---

### Task 1: Add `isPaused` state and `drawPauseOverlay` function

**Files:**
- Modify: `src/components/GameCanvas.vue`

- [ ] **Step 1: Add `isPaused` ref**

In the `<script setup>` block, add alongside the existing `instructionsDisplayed` ref:

```js
const isPaused = ref(false)
```

- [ ] **Step 2: Add `drawPauseOverlay` function**

Add after the `gameLoop` function:

```js
function drawPauseOverlay() {
  const ctx = canvasRef.value.getContext('2d')
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.fillRect(0, 0, 600, 640)
  ctx.fillStyle = 'white'
  ctx.font = 'bold 48px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PAUSED', 300, 320)
}
```

- [ ] **Step 3: Verify the app still compiles**

Run: `npm run dev`  
Expected: No console errors, game loads and plays normally. `P` key does nothing yet.

---

### Task 2: Wire up `P` key toggle in `handleKeyDown`

**Files:**
- Modify: `src/components/GameCanvas.vue`

- [ ] **Step 1: Add pause toggle to `handleKeyDown`**

Replace the existing `handleKeyDown` function with:

```js
function handleKeyDown(e) {
  if ([32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault()

  if (!instructionsDisplayed.value) {
    instructionsDisplayed.value = true
    const ctx = canvasRef.value.getContext('2d')
    gfx.initialise(ctx, graphicsFile)
    gameService.initialise()
    intervalId = setInterval(gameLoop, 50)
    return
  }

  if (e.keyCode === 80) {
    isPaused.value = !isPaused.value
    if (isPaused.value) {
      clearInterval(intervalId)
      intervalId = null
      drawPauseOverlay()
    } else {
      intervalId = setInterval(gameLoop, 50)
    }
    return
  }

  keyPressHandler.keyPress(e.keyCode)
}
```

- [ ] **Step 2: Manually test pause**

Run: `npm run dev`

Test checklist:
- Press any key → instructions disappear, game starts
- Press `P` → game freezes, "PAUSED" overlay appears centered on canvas
- Press `P` again → game resumes from exact frozen state, overlay gone
- Press `P` during death transition → game freezes, resumes correctly
- Press `P` before game starts (on instructions screen) → nothing happens
- Close/navigate away while paused → no errors (onUnmounted handles null `intervalId` via existing `if (intervalId)` guard)
