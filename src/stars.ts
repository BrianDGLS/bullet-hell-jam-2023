import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants"
import { Context, Star, Vec2 } from "./types"
import { getRandomInt } from "./utils"

export class Stars {
    stars: Star[] = []
    min_depth = 50
    max_depth = 500 //Star closer if depth lower
    max_size = 3 //max radius for the closest star
    step = this.max_size / (this.max_depth - this.min_depth) //used for determining radius  using depth
    centerX = CANVAS_WIDTH / 2
    centerY = CANVAS_HEIGHT / 2
    camX = 0
    camY = 0 //0 because cam is considered to be already in center(check draw function)

    constructor(count: number = 100) {
        this.initStars(count)
    }

    initStars(starCount: number = 100) {
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: getRandomInt(-CANVAS_WIDTH * 10, CANVAS_WIDTH * 10), //Play with those values
                y: getRandomInt(-CANVAS_HEIGHT * 10, CANVAS_HEIGHT * 10),
                z: getRandomInt(this.min_depth, this.max_depth),
            })
        }
    }

    makeCamFollow({ x, y }: Vec2) {
        this.camX = x
        this.camY = y
    }

    render(ctx: Context) {
        ctx.save()
        for (const star of this.stars) {
            const dx = star.x - this.camX
            const dy = star.y - this.camY //get star relative to camera
            const z = star.z
            const hx = 15
            const hy = 15 //can be different ratios for X and Y axis-but better not change
            const sx = (hx * dx) / (z + hx)
            const sy = (hy * dy) / (z + hy)

            ctx.beginPath()
            ctx.arc(
                this.centerX + sx,
                this.centerY + sy,
                this.max_size - (star.z - this.min_depth) * this.step,
                0,
                2 * Math.PI,
            )
            ctx.fillStyle = "rgba(255, 255, 255, .7)"
            ctx.fill()
        }
        ctx.restore()
    }
}
