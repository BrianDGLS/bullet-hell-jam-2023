import { CANVAS_WIDTH, FLOOR } from "./constants"
import { Vec2, Context } from "./types"
import { sample } from "./utils"

export function createHills(): Vec2[] {
    const hills: Vec2[] = []

    const verticalSteps = [-32, -96, -64, -128, -160, -196]
    const horizontalSteps = [32, 64, 96]
    const startX = -sample(horizontalSteps)
    let progress = startX
    hills.push({ x: startX, y: sample(verticalSteps) })
    while (progress < CANVAS_WIDTH) {
        progress += sample(horizontalSteps)
        hills.push({ x: progress, y: sample(verticalSteps) })
    }

    return hills
}

export function renderHills(ctx: Context, hills: Vec2[]) {
    ctx.save()
    ctx.translate(0, FLOOR)
    ctx.beginPath()
    ctx.moveTo(hills[0].x, 0)
    for (const hill of hills) {
        ctx.lineTo(hill.x, hill.y)
    }
    ctx.lineTo(hills[hills.length - 1].x, 0)
    ctx.closePath()
    ctx.strokeStyle = "#fff"
    ctx.fillStyle = "#000"
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.fill()
    ctx.restore()
}
