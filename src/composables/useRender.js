import { globalSettings } from '@/constants/globalSettings'
import { coordinateSystem } from '@/constants/coordinateSystem'
import { sprite } from '@/constants/sprite'
import { useGraphicsEngine } from '@/composables/useGraphicsEngine'
import { useGameBoard } from '@/composables/useGameBoard'
import { useGameState } from '@/composables/useGameState'
import { useScoreMarker } from '@/composables/useScoreMarker'
import { usePlayer } from '@/composables/usePlayer'
import { useCentipede } from '@/composables/useCentipede'
import { useSpider } from '@/composables/useSpider'
import { useFlea } from '@/composables/useFlea'
import { useSnail } from '@/composables/useSnail'
import { useBullet } from '@/composables/useBullet'

let livesAnimationCount = 0

const gfx = useGraphicsEngine()
const gameBoardService = useGameBoard()
const gameStateService = useGameState()
const scoreMarkerService = useScoreMarker()
const playerService = usePlayer()
const centipedeService = useCentipede()
const spiderService = useSpider()
const fleaService = useFlea()
const snailService = useSnail()
const bulletService = useBullet()

function drawScoreBoard(animation) {
	if (animation === 0) {
		livesAnimationCount = (livesAnimationCount + 1) % 9
	}
	const animationOffset = livesAnimationCount > 4 ? 9 - livesAnimationCount : livesAnimationCount
	const { scoreBoardFont, scoreBoardTitleFontColour, scoreBoardContentFontColour } = globalSettings

	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardLivesXPositionText, globalSettings.scoreBoardTitleYPosition, 'Lives', scoreBoardTitleFontColour, scoreBoardFont)
	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardScoreXPosition, globalSettings.scoreBoardTitleYPosition, 'Score', scoreBoardTitleFontColour, scoreBoardFont)
	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardLevelXPosition, globalSettings.scoreBoardTitleYPosition, 'Level', scoreBoardTitleFontColour, scoreBoardFont)
	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardHighScoreXPosition, globalSettings.scoreBoardTitleYPosition, 'High', scoreBoardTitleFontColour, scoreBoardFont)

	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardScoreXPosition, globalSettings.scoreBoardContentYPosition, gameStateService.score, scoreBoardContentFontColour, scoreBoardFont)
	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardLevelXPosition, globalSettings.scoreBoardContentYPosition, gameStateService.level, scoreBoardContentFontColour, scoreBoardFont)
	gfx.drawText(coordinateSystem.screen, globalSettings.scoreBoardHighScoreXPosition, globalSettings.scoreBoardContentYPosition, gameStateService.highScore, scoreBoardContentFontColour, scoreBoardFont)

	for (let i = 0; i < gameStateService.lives; i++) {
		gfx.drawImage(
			coordinateSystem.screen,
			globalSettings.scoreBoardLivesXPositionImage + globalSettings.scoreBoardLivesOffset * i + animationOffset * 4,
			globalSettings.scoreBoardLivesYPosition,
			sprite.playerWalkRight1 + livesAnimationCount,
		)
	}
}

export function useRender() {
	return {
		draw(animation) {
			gfx.blankScreen()
			drawScoreBoard(animation)
			gameBoardService.draw()
			playerService.draw(animation)
			fleaService.draw(animation)
			spiderService.draw(animation)
			snailService.draw(animation)
			centipedeService.draw(animation)
			bulletService.draw(animation)
			scoreMarkerService.draw(animation)

			if (gameStateService.isGameOver()) {
				gfx.drawText(
					coordinateSystem.screen,
					globalSettings.gameOverXPosition,
					globalSettings.gameOverYPosition,
					'Game Over',
					globalSettings.gameOverFontColour,
					globalSettings.gameOverFont,
				)
			}
		},
	}
}
