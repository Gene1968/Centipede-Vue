# Stats Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toggleable HTML stats panel (rows cleared, fractional mushroom count, elapsed time) triggered by the `I` key.

**Architecture:** Two composables gain new getters supplying live data; GameCanvas.vue reads them into Vue refs each game loop tick and renders an absolutely-positioned HTML overlay beside the canvas via a wrapper div.

**Tech Stack:** Vue 3, Vite, plain JS singleton composables

---

## File Map

| File | Change |
|---|---|
| `src/composables/useGameBoard.js` | Add `clearedRowCount` and `totalMushroomHealth` getters |
| `src/composables/useGameState.js` | Add `gameStartTime` module var, reset it in `reset()`, expose `elapsedMs` getter |
| `src/components/GameCanvas.vue` | Import new services, add refs + `formatElapsed`, update loop, handle `I` key, add wrapper + panel template + CSS |

---

## Task 1: Add stat getters to useGameBoard

**Files:**
- Modify: `src/composables/useGameBoard.js`

- [ ] **Step 1: Add `clearedRowCount` getter**

Inside the object returned by `useGameBoard()`, add after `get mushroomsOnScreen() { return mushroomsOnScreen },`:

```js
get clearedRowCount() {
	let count = 0
	for (let h = 0; h < globalSettings.gameBoardHeight - 1; h++) {
		let empty = true
		for (let w = 0; w < globalSettings.gameBoardWidth; w++) {
			if (map[h][w] !== 0) { empty = false; break }
		}
		if (empty) count++
	}
	return count
},
```

Note: scans rows 0–28 only (excludes the bottom row per spec).

- [ ] **Step 2: Add `totalMushroomHealth` getter**

Directly after `clearedRowCount`, add:

```js
get totalMushroomHealth() {
	let total = 0
	for (let h = 0; h < globalSettings.gameBoardHeight; h++) {
		for (let w = 0; w < globalSettings.gameBoardWidth; w++) {
			total += Math.abs(map[h][w])
		}
	}
	return total / 4
},
```

Each cell's strength is 1–4 (or –1 to –4 for poison). Dividing by 4 gives fractional mushroom equivalents.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: exits 0 with no errors.

---

## Task 2: Add elapsed timer to useGameState

**Files:**
- Modify: `src/composables/useGameState.js`

- [ ] **Step 1: Add `gameStartTime` module variable**

After `let playerDieTime = null`, add:

```js
let gameStartTime = Date.now()
```

- [ ] **Step 2: Reset timer in `reset()`**

The `reset()` method currently ends with `currentGameState = gameState.gameActive`. Add one line after it:

```js
reset() {
	lives = globalSettings.lives
	level = 1
	score = 0
	currentGameState = gameState.gameActive
	gameStartTime = Date.now()
},
```

- [ ] **Step 3: Expose `elapsedMs` getter**

In the returned object, add after `get lives() { return lives },`:

```js
get elapsedMs() { return Date.now() - gameStartTime },
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exits 0 with no errors.

---

## Task 3: Wire stats panel into GameCanvas.vue

**Files:**
- Modify: `src/components/GameCanvas.vue`

- [ ] **Step 1: Add imports**

After the existing imports in `<script setup>`, add:

```js
import { useGameBoard } from '@/composables/useGameBoard'
import { useGameState } from '@/composables/useGameState'
```

- [ ] **Step 2: Instantiate services and add reactive refs**

After `const keyPressHandler = useKeyPress()`, add:

```js
const gameBoardService = useGameBoard()
const gameStateService = useGameState()

const showStats = ref(false)
const statsRowsCleared = ref(0)
const statsMushrooms = ref('0.00')
const statsElapsed = ref('0:00')
```

- [ ] **Step 3: Add `formatElapsed` helper**

Add before `function gameLoop()`:

```js
function formatElapsed(ms) {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
```

- [ ] **Step 4: Update stats refs in the game loop**

In `gameLoop()`, after `renderService.draw(animation)`, add:

```js
if (showStats.value) {
	statsRowsCleared.value = gameBoardService.clearedRowCount
	statsMushrooms.value = gameBoardService.totalMushroomHealth.toFixed(2)
	statsElapsed.value = formatElapsed(gameStateService.elapsedMs)
}
```

- [ ] **Step 5: Handle `I` key in `handleKeyDown`**

After the pause block (the `if (e.keyCode === 80)` block with its `return`), add before `keyPressHandler.keyPress(e.keyCode)`:

```js
if (e.keyCode === 73) {
	showStats.value = !showStats.value
	return
}
```

- [ ] **Step 6: Wrap canvas in `.canvas-wrapper` and add stats panel**

Replace the current canvas element in `<template>`:

```html
<canvas
	v-show="instructionsDisplayed"
	ref="canvasRef"
	width="600"
	height="640"
	style="border: 1px solid #000000"
/>
```

with:

```html
<div
	v-show="instructionsDisplayed"
	class="canvas-wrapper"
>
	<canvas
		ref="canvasRef"
		width="600"
		height="640"
		style="border: 1px solid #000000"
	/>
	<div
		v-if="showStats"
		class="stats-panel"
	>
		<div class="stats-title">STATS</div>
		<div>Rows cleared: {{ statsRowsCleared }}</div>
		<div>Mushrooms: {{ statsMushrooms }}</div>
		<div>Time: {{ statsElapsed }}</div>
	</div>
</div>
```

- [ ] **Step 7: Add CSS**

In `<style scoped>`, add:

```css
.canvas-wrapper {
	position: relative;
}

.stats-panel {
	position: absolute;
	left: calc(100% + 12px);
	top: 0;
	background: rgba(0, 0, 0, 0.75);
	color: #00ff00;
	font-family: monospace;
	font-size: 13px;
	padding: 10px 14px;
	border: 1px solid #00ff00;
	white-space: nowrap;
	line-height: 1.8;
}

.stats-title {
	font-weight: bold;
	margin-bottom: 4px;
	color: #ffff00;
	letter-spacing: 2px;
}
```

- [ ] **Step 8: Verify build and manual test**

Run: `npm run build`
Expected: exits 0.

Run: `npm run dev`
Manual checks:
- Press any key to start game
- Press `I` — stats panel appears to right of canvas with green text on dark background
- Stats values update each frame (rows cleared, mushroom count, timer ticking)
- Press `I` again — panel disappears
- Press `P` to pause — stats panel stays visible but timer freezes updating (game loop stopped)
- New game (after game over) — timer resets to `0:00`
