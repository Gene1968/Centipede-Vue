<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGraphicsEngine } from '@/composables/useGraphicsEngine'
import { useGame } from '@/composables/useGame'
import { useRender } from '@/composables/useRender'
import { useKeyPress } from '@/composables/useKeyPress'
import { useGameBoard } from '@/composables/useGameBoard'
import { useGameState } from '@/composables/useGameState'
import graphicsFile from '@/assets/img/graphics.png'

const instructionsDisplayed = ref(false)
const isPaused = ref(false)
const canvasRef = ref(null)

const gfx = useGraphicsEngine()
const gameService = useGame()
const renderService = useRender()
const keyPressHandler = useKeyPress()
const gameBoardService = useGameBoard()
const gameStateService = useGameState()

const showStats = ref(false)
const statsRowsCleared = ref(0)
const statsMushrooms = ref('0.00')
const statsElapsed = ref('0:00')

let intervalId = null
let animation = 0

function formatElapsed(ms) {
	const totalSeconds = Math.floor(ms / 1000)
	const minutes = Math.floor(totalSeconds / 60)
	const seconds = totalSeconds % 60
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function gameLoop() {
	animation = (animation + 1) % 4
	gameService.update(animation)
	renderService.draw(animation)
	if (showStats.value) {
		statsRowsCleared.value = gameBoardService.clearedRowCount
		statsMushrooms.value = gameBoardService.totalMushroomHealth.toFixed(2)
		statsElapsed.value = formatElapsed(gameStateService.elapsedMs)
	}
}

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

	if (e.keyCode === 73) {
		showStats.value = !showStats.value
		return
	}

	keyPressHandler.keyPress(e.keyCode)
}

function handleKeyUp(e) {
	keyPressHandler.keyRelease(e.keyCode)
}

onMounted(() => {
	document.addEventListener('keydown', handleKeyDown)
	document.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
	document.removeEventListener('keydown', handleKeyDown)
	document.removeEventListener('keyup', handleKeyUp)
	if (intervalId) clearInterval(intervalId)
})
</script>

<template>
	<div class="game-container">
		<div
			v-if="!instructionsDisplayed"
			class="instructions"
		>
			<h2>Instructions</h2>
			<p>Shoot everything and stay alive</p>
			<p>Arrow Keys to move</p>
			<p>Space bar to fire</p>
			<p>(P to toggle pause)</p>
			<br>
			<p>Press any key to start</p>
		</div>
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
	</div>
</template>

<style scoped>
.game-container {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
}

.instructions {
	text-align: center;
	color: white;
}

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
</style>
