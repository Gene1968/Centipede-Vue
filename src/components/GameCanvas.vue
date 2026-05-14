<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGraphicsEngine } from '@/composables/useGraphicsEngine'
import { useGame } from '@/composables/useGame'
import { useRender } from '@/composables/useRender'
import { useKeyPress } from '@/composables/useKeyPress'
import graphicsFile from '@/assets/img/graphics.png'

const instructionsDisplayed = ref(false)
const isPaused = ref(false)
const canvasRef = ref(null)

const gfx = useGraphicsEngine()
const gameService = useGame()
const renderService = useRender()
const keyPressHandler = useKeyPress()

let intervalId = null
let animation = 0

function gameLoop() {
	animation = (animation + 1) % 4
	gameService.update(animation)
	renderService.draw(animation)
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
		<canvas
			v-show="instructionsDisplayed"
			ref="canvasRef"
			width="600"
			height="640"
			style="border: 1px solid #000000"
		/>
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
</style>
