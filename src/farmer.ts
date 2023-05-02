import { Bullet } from "./bullet"
import { CANVAS_WIDTH, FLOOR, GRAVITY } from "./constants"
import { Duration } from "./duration"
import { Player } from "./player"
import { Context, Vec2 } from "./types"
import { sample } from "./utils"

export type Farmer = Vec2 & {
    vx: number
    vy: number
    scale: Vec2
    speed: number
    width: number
    height: number
    rotation: number
    skinColor: string
    fireRate: Duration
    clothesColor: string
    animationDuration: Duration
}

export function createFarmer({ x, y }: Vec2): Farmer {
    const speed = 0.5
    return {
        x,
        y,
        vy: 0,
        speed,
        width: 10,
        height: 25,
        rotation: 0,
        scale: { x: 1, y: 1 },
        skinColor: "white",
        clothesColor: "gray",
        fireRate: new Duration(1500),
        animationDuration: new Duration(300),
        vx: x > CANVAS_WIDTH / 2 ? -speed : speed,
    }
}

export function renderFarmer(ctx: Context, farmer: Farmer) {
    ctx.save()

    ctx.translate(farmer.x, farmer.y)
    ctx.rotate(farmer.rotation)
    ctx.scale(farmer.scale.x, farmer.scale.y)
    const headHeight = farmer.height / 3
    // head
    ctx.fillStyle = farmer.skinColor
    ctx.fillRect(0, 0, farmer.width, headHeight)
    //body
    ctx.fillStyle = farmer.clothesColor
    ctx.fillRect(0, headHeight, farmer.width, farmer.height - headHeight)
    // hat
    ctx.fillRect(0, 0, farmer.width * 1.2, headHeight / 4)
    ctx.restore()
}

export function updateFarmer(farmer: Farmer) {
    farmer.x += farmer.vx
    farmer.y += farmer.vy
    if (farmer.vx < 0) {
        farmer.scale.x = -1
    }
    if (farmer.animationDuration.hasPassed()) {
        farmer.rotation = farmer.rotation < 0 ? -0.02 : 0
        farmer.scale.y = farmer.scale.y === 1 ? 1.1 : 1
    }

    if (farmer.y > FLOOR - farmer.height) {
        farmer.y = FLOOR - farmer.height
    }
}
