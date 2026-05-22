import { globalSettings } from '@/constants/globalSettings'
import { coordinateSystem } from '@/constants/coordinateSystem'
import { sprite } from '@/constants/sprite'
import { useGraphicsEngine } from '@/composables/useGraphicsEngine'
import { useGameBoard } from '@/composables/useGameBoard'

let flea = null
const gfx = useGraphicsEngine()
const gameBoardService = useGameBoard()

function random(chance) {
	return Math.floor(Math.random() * chance)
}

export function useFlea() {
	return {
		checkCreateFlea() {
			if (flea) return
			if (gameBoardService.mushroomsInPlayerArea > globalSettings.minMushroomsInPlayerAreaBeforeFleaCreated &&
					gameBoardService.mushroomsOnScreen > globalSettings.minMushroomsBeforeFleaCreated) return

			if (gameBoardService.mushroomsOnScreen < globalSettings.maxMushroomsAllowed &&
					(gameBoardService.mushroomsOnScreen < globalSettings.minMushroomsBeforeFleaCreated ||
						random(globalSettings.fleaCreationChance) === 0)) {
				flea = { x: random(globalSettings.gameBoardWidth), y: 0, prevY: 0, dy: 0.5 }
			}
		},

		destroy() { flea = null },
		get isActive() { return flea !== null },

		checkCollision(x, y) {
			if (!flea) return false
			return !!(flea.x === x && (flea.y === y || flea.prevY === y))
		},

		update(animation) {
			if (animation % 2 !== 0 || !flea) return
			flea.prevY = flea.y
			flea.y += 1

			if (flea.y >= globalSettings.gameBoardHeight) {
				flea = null
				return
			}

			if (flea.prevY < globalSettings.gameBoardHeight - 1) {
				if (Math.floor(Math.random() * 3) === 0) {
					gameBoardService.createMushroom(flea.x, flea.prevY)
				}
			}
		},

		draw(animation) {
			if (!flea) return
			const destY = flea.prevY + (animation % 2) * flea.dy
			gfx.drawImage(coordinateSystem.world, flea.x, destY, sprite.flea)
		},
	}
}
