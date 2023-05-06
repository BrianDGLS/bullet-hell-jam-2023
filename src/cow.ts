import { CANVAS_WIDTH, FLOOR, GRAVITY } from "./constants"
import { Duration } from "./duration"
import { Context, Vec2 } from "./types"
import { sample } from "./utils"

export type Cow = Vec2 & {
    vx: number
    vy: number
    scale: Vec2
    speed: number
    active: boolean,
    color: string
    width: number
    height: number
    rotation: number
    isBeingAbducted: boolean
    animationDuration: Duration
}

export function createCow({ x, y }: Vec2): Cow {
    const speed = 0.2
    return {
        x,
        y,
        vy: 0,
        speed,
        width: 20,
        height: 20,
        rotation: 0,
        active: true,
        color: "#fff",
        scale: { x: 1, y: 1 },
        isBeingAbducted: false,
        animationDuration: new Duration(300),
        vx: x > CANVAS_WIDTH / 2 ? -speed : speed,
    }
}

export function renderCow(ctx: Context, cow: Cow) {
    ctx.save()

    ctx.fillStyle = cow.color
    ctx.translate(cow.x, cow.y)
    ctx.rotate(cow.rotation)
    ctx.scale(cow.scale.x, cow.scale.y)
    const legHeight = cow.height / 3
    const legWidth = cow.width / 10
    const headHeight = cow.height / 3
    const headWidth = cow.width / 3
    // head
    ctx.fillRect(0, 0, headWidth, headHeight)
    //body
    ctx.fillRect(
        headWidth / 2,
        headHeight / 2,
        cow.width - headWidth / 2,
        cow.height - legHeight - headHeight / 2,
    )
    // front legs
    ctx.fillRect(headWidth / 2, cow.height - legHeight, legWidth, legHeight)
    ctx.fillRect(
        headWidth / 2 + legWidth * 2,
        cow.height - legHeight,
        legWidth,
        legHeight,
    )
    // back leg
    ctx.fillRect(
        cow.width - legWidth,
        cow.height - legHeight,
        legWidth,
        legHeight,
    )
    // left horn
    // ctx.fillRect(
    //     -headWidth / 2 - cow.height / 2.2,
    //     -headHeight - 2,
    //     cow.height / 2.2,
    //     cow.height / 2.2,
    // )
    // right horn
    // ctx.fillRect(headWidth / 2, -headHeight - 2, cow.height / 2, cow.height / 2)
    // udder
    // ctx.fillRect(cow.width / 2, 0, cow.width / 4, cow.height - legHeight / 1.5)
    ctx.restore()
    // ctx.strokeStyle = "green"
    // ctx.strokeRect(cow.x, cow.y, cow.width, cow.height)
}

export function updateCow(cow: Cow) {
    if (!cow.isBeingAbducted) {
        cow.x += cow.vx
        cow.y += cow.vy
        if (cow.vx > 0) {
            cow.scale.x = -1
        }
        if (cow.animationDuration.hasPassed()) {
            cow.rotation = cow.rotation < 0 ? -0.02 : 0
            cow.scale.y = cow.scale.y === 1 ? 1.1 : 1
        }

        if (cow.y > FLOOR - cow.height) {
            cow.y = FLOOR - cow.height
            cow.vy = 0
        } else {
            cow.vy += GRAVITY
        }
    }
}
